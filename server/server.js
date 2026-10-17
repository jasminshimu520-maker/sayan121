require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./src/db');
const {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  isValidEmail,
} = require('./src/auth');
const { sendTestEmail } = require('./src/mailer');
const { startCronScheduler, checkAndSendReminders } = require('./src/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Start the automated 3-day reminder cron scheduler
startCronScheduler();

// ==========================================
// Authentication Routes
// ==========================================

// Signup
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, Gmail address, and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this Gmail address already exists' });
    }

    const hashedPassword = hashPassword(password);
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(
      name.trim(),
      trimmedEmail,
      hashedPassword
    );

    const user = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: trimmedEmail,
    };

    const token = generateToken(user);
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(trimmedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = generateToken(safeUser);
    res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Current User Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// ==========================================
// Task Management Routes
// ==========================================

// Get all tasks for logged-in user
app.get('/api/tasks', authenticateToken, (req, res) => {
  try {
    const { date, status } = req.query;
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [req.user.id];

    if (date) {
      query += ' AND target_date = ?';
      params.push(date);
    }

    if (status === 'completed') {
      query += ' AND is_completed = 1';
    } else if (status === 'pending') {
      query += ' AND is_completed = 0';
    }

    query += ' ORDER BY target_date ASC, created_at DESC';

    const tasks = db.prepare(query).all(...params);
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// Create new task
app.post('/api/tasks', authenticateToken, (req, res) => {
  try {
    const { title, description, target_date, target_time, priority, category } = req.body;

    if (!title || !target_date) {
      return res.status(400).json({ error: 'Task title and target date (YYYY-MM-DD) are required' });
    }

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(target_date)) {
      return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
    }

    const stmt = db.prepare(`
      INSERT INTO tasks (
        user_id, user_email, title, description, target_date, target_time, priority, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.user.id,
      req.user.email,
      title.trim(),
      description ? description.trim() : '',
      target_date,
      target_time || null,
      priority || 'medium',
      category || 'general'
    );

    const createdTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Task created successfully',
      task: createdTask,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, req.user.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    const {
      title = task.title,
      description = task.description,
      target_date = task.target_date,
      target_time = task.target_time,
      priority = task.priority,
      category = task.category,
      is_completed = task.is_completed,
    } = req.body;

    // If date changed, reset reminder sent flags so notifications will be rescheduled for the new date
    const dateChanged = target_date !== task.target_date;
    const resetReminders = dateChanged;

    const stmt = db.prepare(`
      UPDATE tasks 
      SET 
        title = ?,
        description = ?,
        target_date = ?,
        target_time = ?,
        priority = ?,
        category = ?,
        is_completed = ?,
        reminder_t_minus_2_sent = CASE WHEN ? = 1 THEN 0 ELSE reminder_t_minus_2_sent END,
        reminder_t_minus_1_sent = CASE WHEN ? = 1 THEN 0 ELSE reminder_t_minus_1_sent END,
        reminder_target_day_sent = CASE WHEN ? = 1 THEN 0 ELSE reminder_target_day_sent END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      title.trim(),
      description ? description.trim() : '',
      target_date,
      target_time || null,
      priority,
      category,
      is_completed ? 1 : 0,
      resetReminders ? 1 : 0,
      resetReminders ? 1 : 0,
      resetReminders ? 1 : 0,
      taskId,
      req.user.id
    );

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    res.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const result = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(taskId, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    res.json({ message: 'Task deleted successfully', taskId });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ==========================================
// Email Integration & Manual Trigger Routes
// ==========================================

// Test Email endpoint
app.post('/api/email/test', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userName = req.user.name;

    const result = await sendTestEmail(userEmail, userName);

    // Record in email logs
    db.prepare(`
      INSERT INTO email_logs (user_id, recipient_email, reminder_type, subject, status)
      VALUES (?, ?, 'test', ?, ?)
    `).run(req.user.id, userEmail, result.subject, result.simulated ? 'simulated' : 'sent');

    res.json({
      success: true,
      message: result.simulated
        ? `[Preview/Simulated Mode] Test email triggered for ${userEmail}. To receive actual emails in your Gmail inbox, configure your GMAIL_USER and GMAIL_APP_PASSWORD in server/.env.`
        : `Test email successfully sent to ${userEmail}! Check your inbox.`,
      details: result,
    });
  } catch (error) {
    console.error('Test email error:', error);

    db.prepare(`
      INSERT INTO email_logs (user_id, recipient_email, reminder_type, subject, status, error_message)
      VALUES (?, ?, 'test', 'Test Email', 'failed', ?)
    `).run(req.user.id, req.user.email, error.message);

    res.status(500).json({
      error: 'Failed to send test email',
      details: error.message,
      suggestion: 'Ensure your Gmail account has 2-Step Verification ON and you are using a 16-character Google App Password (not your normal Gmail account password).',
    });
  }
});

// Trigger Reminder Check endpoint (simulate / run cron immediately)
app.post('/api/reminders/trigger-check', authenticateToken, async (req, res) => {
  try {
    const results = await checkAndSendReminders();
    res.json({
      success: true,
      message: 'Automated 3-day reminder sweep executed successfully',
      results,
    });
  } catch (error) {
    console.error('Manual sweep trigger error:', error);
    res.status(500).json({
      error: 'Failed to run reminder sweep',
      details: error.message,
    });
  }
});

// Get user email notification logs
app.get('/api/reminders/logs', authenticateToken, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT l.*, t.title as task_title 
      FROM email_logs l
      LEFT JOIN tasks t ON l.task_id = t.id
      WHERE l.user_id = ?
      ORDER BY l.sent_at DESC
      LIMIT 50
    `).all(req.user.id);

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
});

// System Status and Diagnostics
app.get('/api/system/status', (req, res) => {
  const isGmailConfigured = Boolean(
    process.env.GMAIL_USER &&
    process.env.GMAIL_APP_PASSWORD &&
    process.env.GMAIL_APP_PASSWORD !== 'your_16_digit_app_password_here'
  );

  res.json({
    status: 'online',
    serverTime: new Date().toISOString(),
    gmailConfigured: isGmailConfigured,
    gmailAccount: process.env.GMAIL_USER || 'Not configured',
    schedulerActive: true,
    cronSchedule: process.env.CRON_SCHEDULE || '5 0 * * *',
  });
});

// Serve frontend in production if built
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Smart Task Reminder Server running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}/api`);
  console.log(`⏰ 3-Day Gmail Reminder Cron Scheduler is ACTIVE`);
  console.log(`=======================================================`);
});
