const nodemailer = require('nodemailer');

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || pass === 'your_16_digit_app_password_here') {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: pass,
    },
  });
}

/**
 * Format date for friendly Bengali display
 */
function formatDisplayDate(dateStr) {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}-${month}-${year}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

/**
 * Modern HTML Email Template generator
 */
function buildEmailHtml({
  badgeText,
  badgeColor,
  title,
  mainMessage,
  taskTitle,
  taskDescription,
  targetDate,
  priority,
  daysLeftText,
}) {
  const displayDate = formatDisplayDate(targetDate);
  const priorityColor =
    priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981';

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F3F4F6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1F2937;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      border: 1px solid #E5E7EB;
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      padding: 32px 24px;
      text-align: center;
      color: #FFFFFF;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      background: ${badgeColor || '#EEF2FF'};
      color: ${badgeColor ? '#FFFFFF' : '#4F46E5'};
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px 28px;
    }
    .message-box {
      background: #F8FAFC;
      border-left: 4px solid #4F46E5;
      padding: 16px 20px;
      border-radius: 0 12px 12px 0;
      margin-bottom: 24px;
      font-size: 16px;
      font-weight: 600;
      color: #334155;
    }
    .task-card {
      background: #FAFAFA;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .task-title {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 10px 0;
    }
    .task-desc {
      font-size: 14px;
      color: #475569;
      margin: 0 0 16px 0;
      white-space: pre-line;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      border-top: 1px solid #E2E8F0;
      padding-top: 12px;
      font-size: 13px;
    }
    .meta-item {
      display: inline-block;
      margin-right: 16px;
      color: #64748B;
    }
    .meta-item strong {
      color: #1E293B;
    }
    .countdown-pill {
      display: inline-block;
      background: #FEF3C7;
      color: #92400E;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 13px;
    }
    .footer {
      background: #F9FAFB;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #9CA3AF;
      border-top: 1px solid #E5E7EB;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">${badgeText}</div>
      <h1>Smart Task & Email Reminder</h1>
    </div>
    <div class="content">
      <div class="message-box">
        ${mainMessage}
      </div>

      <div class="task-card">
        <h2 class="task-title">📌 ${taskTitle}</h2>
        ${taskDescription ? `<p class="task-desc">${taskDescription}</p>` : ''}
        <div class="meta-row">
          <div class="meta-item">
            📅 <strong>নির্ধারিত তারিখ:</strong> ${displayDate}
          </div>
          <div class="meta-item">
            ⚡ <strong>অগ্রাধিকার:</strong> 
            <span style="color: ${priorityColor}; font-weight: bold;">
              ${priority ? priority.toUpperCase() : 'NORMAL'}
            </span>
          </div>
          ${daysLeftText ? `<div class="meta-item"><span class="countdown-pill">${daysLeftText}</span></div>` : ''}
        </div>
      </div>

      <p style="font-size: 13px; color: #6B7280; margin-top: 24px; text-align: center;">
        এই রিমাইন্ডারটি স্বয়ংক্রিয়ভাবে Smart Task & Email Reminder App থেকে আপনার জিমেইল অ্যাকাউন্টে পাঠানো হয়েছে।
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Smart Task & Email Reminder App • Cross-Platform Web & Mobile
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send reminder email based on reminder type
 * type: 't_minus_2' | 't_minus_1' | 'target_day'
 */
async function sendReminderEmail(userEmail, task, type) {
  const transporter = createTransporter();
  const displayDate = formatDisplayDate(task.target_date);
  const taskDetails = task.description ? `${task.title} - ${task.description}` : task.title;

  let subject = '';
  let mainMessage = '';
  let badgeText = '';
  let badgeColor = '#4F46E5';
  let daysLeftText = '';

  if (type === 't_minus_2') {
    // 2 days before
    subject = `রিমাইন্ডার: আর মাত্র ২ দিন বাকি! [${task.title}]`;
    mainMessage = `রিমাইন্ডার: আপনি <strong>${displayDate}</strong> তারিখে এই কাজটি করতে চেয়েছিলেন: <em>${taskDetails}</em>। আর মাত্র ২ দিন বাকি!`;
    badgeText = '⏳ ২ দিন বাকি (T-2 Reminder)';
    badgeColor = '#4F46E5';
    daysLeftText = '⏳ ২ দিন বাকি';
  } else if (type === 't_minus_1') {
    // 1 day before
    subject = `রিমাইন্ডার: আগামীকাল ${displayDate} তারিখ! [${task.title}]`;
    mainMessage = `রিমাইন্ডার: আগামীকাল <strong>${displayDate}</strong> তারিখ! আপনার নির্ধারিত কাজ: <em>${taskDetails}</em>।`;
    badgeText = '⏰ আগামীকাল নির্ধারিত দিন (T-1 Reminder)';
    badgeColor = '#D97706';
    daysLeftText = '⏰ আগামীকাল';
  } else if (type === 'target_day') {
    // on target date
    subject = `আজকের কাজ: আজ ${displayDate} তারিখ! [${task.title}]`;
    mainMessage = `আজকের কাজ: আজ <strong>${displayDate}</strong> তারিখ। আপনি আজ এই কাজটি করতে চেয়েছিলেন: <em>${taskDetails}</em>।`;
    badgeText = '🎯 আজকের কাজ (Target Day Reminder)';
    badgeColor = '#059669';
    daysLeftText = '🎯 আজই নির্ধারিত দিন';
  }

  const html = buildEmailHtml({
    badgeText,
    badgeColor,
    title: subject,
    mainMessage,
    taskTitle: task.title,
    taskDescription: task.description,
    targetDate: task.target_date,
    priority: task.priority,
    daysLeftText,
  });

  if (!transporter) {
    console.warn(`[MAILER WARNING] Email simulated (Gmail credentials not provided in .env):`);
    console.warn(`To: ${userEmail} | Subject: ${subject}`);
    return {
      success: false,
      simulated: true,
      message: 'Gmail App Password is not configured in .env. Email was logged in simulated mode.',
      subject,
      recipient: userEmail,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Smart Task Reminder" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: html,
      text: mainMessage.replace(/<[^>]*>?/gm, ''),
    });

    console.log(`[MAILER SUCCESS] Email sent to ${userEmail} (Message ID: ${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId,
      subject,
      recipient: userEmail,
    };
  } catch (error) {
    console.error(`[MAILER ERROR] Failed to send email to ${userEmail}:`, error.message);
    throw error;
  }
}

/**
 * Send an immediate test email to verify Gmail setup
 */
async function sendTestEmail(userEmail, userName = 'ব্যবহারকারী') {
  const transporter = createTransporter();
  const subject = '✅ Smart Task Reminder: টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে!';
  const mainMessage = `অভিনন্দন ${userName}! আপনার জিমেইল (<strong>${userEmail}</strong>) ইন্টিগ্রেশন সফলভাবে কাজ করছে। আপনি এখন থেকে যেকোনো কাজের নির্ধারিত তারিখের ২ দিন আগে, ১ দিন আগে এবং নির্ধারিত দিনে স্বয়ংক্রিয় ইমেইল রিমাইন্ডার পাবেন।`;

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F3F4F6; margin: 0; padding: 20px; }
    .box { max-width: 580px; margin: 20px auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .top { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 28px; text-align: center; }
    .content { padding: 30px; color: #1F2937; }
    .pill { display: inline-block; background: #D1FAE5; color: #065F46; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 13px; margin-bottom: 12px; }
    .features-list { background: #F9FAFB; border-radius: 12px; padding: 18px 22px; margin: 20px 0; border: 1px solid #E5E7EB; }
    .features-list li { margin-bottom: 8px; font-size: 14px; color: #374151; }
    .footer { text-align: center; font-size: 12px; color: #9CA3AF; padding: 16px; border-top: 1px solid #E5E7EB; }
  </style>
</head>
<body>
  <div class="box">
    <div class="top">
      <div class="pill">✅ TEST SUCCESSFUL</div>
      <h1 style="margin: 0; font-size: 22px;">Smart Task & Email Reminder App</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">${mainMessage}</p>
      <div class="features-list">
        <strong>📋 আপনার ৩-দিনের স্বয়ংক্রিয় রিমাইন্ডার সিস্টেম:</strong>
        <ul>
          <li><strong>T - 2 (২ দিন আগে):</strong> আগাম প্রস্তুতির জন্য রিমাইন্ডার পাঠানো হবে।</li>
          <li><strong>T - 1 (১ দিন আগে):</strong> শেষ মুহূর্তের রিমাইন্ডার পাঠানো হবে।</li>
          <li><strong>T (নির্ধারিত দিনে):</strong> আজকের কাজের অগ্রাধিকার রিমাইন্ডার পাঠানো হবে।</li>
        </ul>
      </div>
      <p style="font-size: 13px; color: #6B7280; text-align: center;">
        এই টেস্ট ইমেইলটি প্রমাণ করে আপনার ব্যাকএন্ড এবং জিমেইল অ্যাপ পাসওয়ার্ড সঠিকভাবে সংযুক্ত হয়েছে।
      </p>
    </div>
    <div class="footer">
      Smart Task & Email Reminder • Ready for Web, PWA & Android APK
    </div>
  </div>
</body>
</html>
  `;

  if (!transporter) {
    return {
      success: false,
      simulated: true,
      message: 'Gmail App Password is not configured in .env. Please configure GMAIL_USER and GMAIL_APP_PASSWORD to send real emails.',
      subject,
      recipient: userEmail,
    };
  }

  const info = await transporter.sendMail({
    from: `"Smart Task Reminder" <${process.env.GMAIL_USER}>`,
    to: userEmail,
    subject: subject,
    html: html,
    text: mainMessage.replace(/<[^>]*>?/gm, ''),
  });

  return {
    success: true,
    messageId: info.messageId,
    subject,
    recipient: userEmail,
  };
}

module.exports = {
  sendReminderEmail,
  sendTestEmail,
  formatDisplayDate,
};
