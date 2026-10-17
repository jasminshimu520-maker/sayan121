const cron = require('node-cron');
const db = require('./db');
const { sendReminderEmail } = require('./mailer');

/**
 * Format Date object to YYYY-MM-DD
 */
function formatDateToYYYYMMDD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Core reminder checker:
 * Finds all tasks requiring T-2, T-1, or Target Day (T) email reminders.
 */
async function checkAndSendReminders() {
  const now = new Date();
  const todayStr = formatDateToYYYYMMDD(now);

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = formatDateToYYYYMMDD(tomorrow);

  const twoDaysLater = new Date(now);
  twoDaysLater.setDate(now.getDate() + 2);
  const twoDaysLaterStr = formatDateToYYYYMMDD(twoDaysLater);

  console.log(`[SCHEDULER] Checking reminders for Today: ${todayStr}, T+1: ${tomorrowStr}, T+2: ${twoDaysLaterStr}`);

  const results = {
    timestamp: new Date().toISOString(),
    todayDate: todayStr,
    t_minus_2_processed: 0,
    t_minus_1_processed: 0,
    target_day_processed: 0,
    details: [],
    errors: [],
  };

  // 1. Process T-2 reminders (Target Date = 2 days in the future, e.g., today is 28th and task is on 30th)
  const tMinus2Tasks = db.prepare(`
    SELECT t.*, u.email as user_email, u.name as user_name
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    WHERE t.target_date = ? 
      AND t.reminder_t_minus_2_sent = 0 
      AND t.is_completed = 0
  `).all(twoDaysLaterStr);

  for (const task of tMinus2Tasks) {
    try {
      const emailResult = await sendReminderEmail(task.user_email, task, 't_minus_2');
      
      // Update task status
      db.prepare(`
        UPDATE tasks 
        SET reminder_t_minus_2_sent = 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(task.id);

      // Log email
      db.prepare(`
        INSERT INTO email_logs (user_id, recipient_email, task_id, reminder_type, subject, status)
        VALUES (?, ?, ?, 't_minus_2', ?, ?)
      `).run(task.user_id, task.user_email, task.id, emailResult.subject, emailResult.simulated ? 'simulated' : 'sent');

      results.t_minus_2_processed++;
      results.details.push({
        taskId: task.id,
        title: task.title,
        recipient: task.user_email,
        type: 't_minus_2',
        targetDate: task.target_date,
        simulated: emailResult.simulated || false,
      });
    } catch (err) {
      console.error(`Error sending T-2 reminder for task #${task.id}:`, err.message);
      results.errors.push({ taskId: task.id, type: 't_minus_2', error: err.message });
      
      db.prepare(`
        INSERT INTO email_logs (user_id, recipient_email, task_id, reminder_type, subject, status, error_message)
        VALUES (?, ?, ?, 't_minus_2', 'Failed T-2 Reminder', 'failed', ?)
      `).run(task.user_id, task.user_email, task.id, err.message);
    }
  }

  // 2. Process T-1 reminders (Target Date = Tomorrow, e.g., today is 29th and task is on 30th)
  const tMinus1Tasks = db.prepare(`
    SELECT t.*, u.email as user_email, u.name as user_name
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    WHERE t.target_date = ? 
      AND t.reminder_t_minus_1_sent = 0 
      AND t.is_completed = 0
  `).all(tomorrowStr);

  for (const task of tMinus1Tasks) {
    try {
      const emailResult = await sendReminderEmail(task.user_email, task, 't_minus_1');
      
      db.prepare(`
        UPDATE tasks 
        SET reminder_t_minus_1_sent = 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(task.id);

      db.prepare(`
        INSERT INTO email_logs (user_id, recipient_email, task_id, reminder_type, subject, status)
        VALUES (?, ?, ?, 't_minus_1', ?, ?)
      `).run(task.user_id, task.user_email, task.id, emailResult.subject, emailResult.simulated ? 'simulated' : 'sent');

      results.t_minus_1_processed++;
      results.details.push({
        taskId: task.id,
        title: task.title,
        recipient: task.user_email,
        type: 't_minus_1',
        targetDate: task.target_date,
        simulated: emailResult.simulated || false,
      });
    } catch (err) {
      console.error(`Error sending T-1 reminder for task #${task.id}:`, err.message);
      results.errors.push({ taskId: task.id, type: 't_minus_1', error: err.message });

      db.prepare(`
        INSERT INTO email_logs (user_id, recipient_email, task_id, reminder_type, subject, status, error_message)
        VALUES (?, ?, ?, 't_minus_1', 'Failed T-1 Reminder', 'failed', ?)
      `).run(task.user_id, task.user_email, task.id, err.message);
    }
  }

  // 3. Process Target Day reminders (Target Date = Today, e.g., today is 30th and task is on 30th)
  const targetDayTasks = db.prepare(`
    SELECT t.*, u.email as user_email, u.name as user_name
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    WHERE t.target_date = ? 
      AND t.reminder_target_day_sent = 0 
      AND t.is_completed = 0
  `).all(todayStr);

  for (const task of targetDayTasks) {
    try {
      const emailResult = await sendReminderEmail(task.user_email, task, 'target_day');
      
      db.prepare(`
        UPDATE tasks 
        SET reminder_target_day_sent = 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(task.id);

      db.prepare(`
        INSERT INTO email_logs (user_id, recipient_email, task_id, reminder_type, subject, status)
        VALUES (?, ?, ?, 'target_day', ?, ?)
      `).run(task.user_id, task.user_email, task.id, emailResult.subject, emailResult.simulated ? 'simulated' : 'sent');

      results.target_day_processed++;
      results.details.push({
        taskId: task.id,
        title: task.title,
        recipient: task.user_email,
        type: 'target_day',
        targetDate: task.target_date,
        simulated: emailResult.simulated || false,
      });
    } catch (err) {
      console.error(`Error sending Target Day reminder for task #${task.id}:`, err.message);
      results.errors.push({ taskId: task.id, type: 'target_day', error: err.message });

      db.prepare(`
        INSERT INTO email_logs (user_id, recipient_email, task_id, reminder_type, subject, status, error_message)
        VALUES (?, ?, ?, 'target_day', 'Failed Target Day Reminder', 'failed', ?)
      `).run(task.user_id, task.user_email, task.id, err.message);
    }
  }

  console.log(`[SCHEDULER FINISHED] Sent: T-2: ${results.t_minus_2_processed}, T-1: ${results.t_minus_1_processed}, Today: ${results.target_day_processed}`);
  return results;
}

/**
 * Start the daily node-cron scheduler
 * Runs daily at midnight 00:05 AM (configurable via CRON_SCHEDULE in .env)
 */
function startCronScheduler() {
  const schedule = process.env.CRON_SCHEDULE || '5 0 * * *'; // Every day at 00:05
  console.log(`[CRON] Initializing automated task reminder cron job with schedule: "${schedule}"`);

  const job = cron.schedule(schedule, async () => {
    console.log(`[CRON TRIGGERED] Executing automated 3-day reminder sweep...`);
    try {
      await checkAndSendReminders();
    } catch (error) {
      console.error('[CRON ERROR] Reminder sweep failed:', error);
    }
  });

  return job;
}

module.exports = {
  checkAndSendReminders,
  startCronScheduler,
  formatDateToYYYYMMDD,
};
