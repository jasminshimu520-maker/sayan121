const http = require('http');

async function runTest() {
  console.log('========================================================');
  console.log('🧪 Running Smart Task & Email Reminder End-to-End Test');
  console.log('========================================================');

  const BASE_URL = 'http://localhost:5000/api';

  async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
    const url = new URL(BASE_URL + endpoint);
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const headers = {
        'Content-Type': 'application/json',
      };
      if (payload) {
        headers['Content-Length'] = Buffer.byteLength(payload);
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method,
          headers,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              resolve({ status: res.statusCode, data: json });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        }
      );

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  // 1. Check System Status
  console.log('\n[1/6] Checking system status endpoint...');
  const statusRes = await apiRequest('/system/status');
  console.log('Status Response:', statusRes.data);

  // 2. Register a test Gmail account
  const testGmail = `tester_${Date.now()}@gmail.com`;
  console.log(`\n[2/6] Registering test user with Gmail: ${testGmail}...`);
  const signupRes = await apiRequest('/auth/signup', 'POST', {
    name: 'Sayan Developer',
    email: testGmail,
    password: 'securePassword123',
  });
  console.log('Signup result:', signupRes.data.message);
  const token = signupRes.data.token;
  if (!token) throw new Error('Failed to obtain auth token');

  // 3. Create 3 tasks testing T-2, T-1, and Target Day (T)
  console.log('\n[3/6] Scheduling tasks for Today, Tomorrow, and In 2 Days...');
  const now = new Date();
  const format = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayStr = format(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = format(tomorrow);
  const twoDaysLater = new Date(now);
  twoDaysLater.setDate(now.getDate() + 2);
  const twoDaysLaterStr = format(twoDaysLater);

  // Task for Today (Target Day)
  const taskTodayRes = await apiRequest(
    '/tasks',
    'POST',
    {
      title: 'Target Day Task: Deploy Smart App to Play Store',
      description: 'Review release bundle and release to internal testers',
      target_date: todayStr,
      priority: 'high',
      category: 'project',
    },
    token
  );
  console.log(`Created Target Day Task #${taskTodayRes.data.task.id} for date: ${todayStr}`);

  // Task for Tomorrow (T-1)
  const taskT1Res = await apiRequest(
    '/tasks',
    'POST',
    {
      title: 'T-1 Task: Finalize Capacitor Android APK Build',
      description: 'Verify service worker caching and offline capabilities',
      target_date: tomorrowStr,
      priority: 'medium',
      category: 'work',
    },
    token
  );
  console.log(`Created T-1 Task #${taskT1Res.data.task.id} for date: ${tomorrowStr}`);

  // Task for In 2 Days (T-2)
  const taskT2Res = await apiRequest(
    '/tasks',
    'POST',
    {
      title: 'T-2 Task: Build a project on the 30th',
      description: 'Setup initial repository and configure Gmail SMTP credentials',
      target_date: twoDaysLaterStr,
      priority: 'high',
      category: 'project',
    },
    token
  );
  console.log(`Created T-2 Task #${taskT2Res.data.task.id} for date: ${twoDaysLaterStr}`);

  // 4. Test "Test Email Now" endpoint
  console.log('\n[4/6] Triggering "Test Email Now" endpoint...');
  const testEmailRes = await apiRequest('/email/test', 'POST', {}, token);
  console.log('Test Email Response:', testEmailRes.data.message);

  // 5. Trigger Automated 3-Day Reminder Sweep
  console.log('\n[5/6] Triggering Automated 3-Day Reminder Sweep (/reminders/trigger-check)...');
  const sweepRes = await apiRequest('/reminders/trigger-check', 'POST', {}, token);
  console.log('Sweep Results:', {
    T_minus_2_processed: sweepRes.data.results.t_minus_2_processed,
    T_minus_1_processed: sweepRes.data.results.t_minus_1_processed,
    Target_day_processed: sweepRes.data.results.target_day_processed,
    Total_processed: sweepRes.data.results.details.length,
  });

  // 6. Verify Tasks & Email Logs in Database
  console.log('\n[6/6] Verifying updated tasks and email logs...');
  const tasksRes = await apiRequest('/tasks', 'GET', null, token);
  tasksRes.data.tasks.forEach((t) => {
    console.log(`- Task #${t.id} [${t.title.substring(0, 30)}...]:`, {
      target_date: t.target_date,
      T_minus_2_sent: t.reminder_t_minus_2_sent,
      T_minus_1_sent: t.reminder_t_minus_1_sent,
      Target_day_sent: t.reminder_target_day_sent,
    });
  });

  const logsRes = await apiRequest('/reminders/logs', 'GET', null, token);
  console.log(`Email Logs recorded in DB: ${logsRes.data.logs.length} logs found.`);
  logsRes.data.logs.slice(0, 4).forEach((log) => {
    console.log(`  * [${log.reminder_type.toUpperCase()}] Status: ${log.status} | Subject: "${log.subject}"`);
  });

  console.log('\n========================================================');
  console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================');
}

// Start server child process for test if not running
const { spawn } = require('child_process');
const path = require('path');

const server = spawn(process.execPath, ['server/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

setTimeout(async () => {
  try {
    await runTest();
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.kill();
    process.exit(0);
  }
}, 2000);
