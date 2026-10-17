<<<<<<< HEAD
# 📱 Smart Task & Email Reminder App

> **Cross-Platform Progressive Web App (PWA) & Native Android App (Capacitor)** with an automated **3-Day Consecutive Gmail Notification System** (`node-cron` & `nodemailer`).

---

## 🌟 Key Features

1. **Cross-Platform Responsive UI (Web + Native Mobile Feel):**
   - **Desktop:** Elegant Split-Screen Dashboard featuring an Interactive Month Calendar on the left and a Live Task Manager on the right.
   - **Mobile (Android/iOS):** Native mobile app navigation with a bottom navigation bar (`Calendar`, `Task List`, `Email Center`, `History`), floating quick-action action button (FAB), and touch-friendly calendar.
   - **Progressive Web App (PWA):** Equipped with `manifest.webmanifest`, custom icons (`192x192`, `512x512`), and Service Worker caching (`workbox`) for offline support and direct "Install as App" on Android and PC.

2. **User Authentication (Gmail & Password):**
   - Secure signup and login storing the user's exact Gmail address and salted password hashes (`bcryptjs`).
   - JWT token authentication (`jsonwebtoken`).
   - Every scheduled reminder is automatically bound and delivered to the user's logged-in Gmail address.

3. **Interactive Calendar & Task Scheduling:**
   - Tap or double-click any date on the calendar (e.g., the 30th) to instantly open the task scheduling modal.
   - Set task title, description, target date, optional target time, priority (High, Medium, Low), and category (Project, Work, Personal, Study, General).
   - Real-time countdowns: `🎯 Today`, `⏰ Tomorrow (1 day left)`, `⏳ In 2 days`, `📅 In X days`.
   - Visual task completion with celebratory confetti animation (`canvas-confetti`).

4. **Automated 3-Day Gmail Notification System (`node-cron` & `nodemailer`):**
   - A background cron scheduler automatically checks tasks and sends emails on **3 consecutive days** before and on target date `T`:
     - **2 Days Before (`T - 2`):**  
       `রিমাইন্ডার: আপনি [Date] তারিখে এই কাজটি করতে চেয়েছিলেন: [Task Details]। আর মাত্র ২ দিন বাকি!`
     - **1 Day Before (`T - 1`):**  
       `রিমাইন্ডার: আগামীকাল [Date] তারিখ! আপনার নির্ধারিত কাজ: [Task Details]।`
     - **On the Target Date (`T`):**  
       `আজকের কাজ: আজ [Date] তারিখ। আপনি আজ এই কাজটি করতে চেয়েছিলেন: [Task Details]।`
   - Database flags (`reminder_t_minus_2_sent`, `reminder_t_minus_1_sent`, `reminder_target_day_sent`) prevent duplicate email deliveries.

5. **Instant Testing & Transparency:**
   - **"Test Email Now" Button:** Verify Gmail inbox delivery in 1-click without waiting for scheduled dates.
   - **"Run Reminder Check" Button:** Execute the 3-day reminder sweep on demand to test all upcoming tasks and inspect full sweep diagnostics.
   - **Email Notification History:** Full log table with timestamp, recipient, subject, and delivery status.

---

## 📁 Project Structure

```
smart-task-reminder-app/
├── package.json                 # Root automation scripts
├── test_e2e.js                  # Automated End-to-End verification test suite
│
├── server/                      # Backend (Node.js, Express, SQLite, Cron, Nodemailer)
│   ├── server.js                # Express API & static frontend server
│   ├── package.json             # Backend dependencies
│   ├── .env                     # Environment variables (Gmail & JWT)
│   ├── .env.example             # Template for configuration
│   └── src/
│       ├── db.js                # SQLite database setup (better-sqlite3)
│       ├── auth.js              # Password hashing & JWT middleware
│       ├── mailer.js            # Nodemailer transport & Bengali HTML email templates
│       └── scheduler.js         # Daily node-cron 3-day reminder engine
│
└── client/                      # Frontend (React 19, TypeScript, Vite, Tailwind v4)
    ├── vite.config.ts           # Vite + Tailwind v4 + VitePWA plugin
    ├── capacitor.config.ts      # Capacitor configuration for Android APK
    ├── package.json             # Frontend dependencies
    ├── public/
    │   ├── icons/               # PWA icons (192x192, 512x512)
    │   └── favicon.svg
    ├── src/
    │   ├── App.tsx              # Main Desktop Split-Screen & Mobile App Controller
    │   ├── index.css            # Tailwind CSS v4 & mobile safe-area styling
    │   ├── types/               # TypeScript interfaces
    │   ├── services/api.ts      # REST API client
    │   └── components/
    │       ├── Navbar.tsx            # Top header with profile & quick actions
    │       ├── CalendarView.tsx      # Interactive touch-friendly month calendar
    │       ├── TaskList.tsx          # Task list, search, filter, countdown badges
    │       ├── TaskModal.tsx         # Add/Edit task modal with 3-day reminder preview
    │       ├── EmailControlPanel.tsx # Instant email testing & scheduler trigger
    │       ├── EmailLogsModal.tsx    # Notification history audit log
    │       ├── SweepResultsModal.tsx # Sweep results breakdown popup
    │       ├── AuthScreen.tsx        # Login & Signup screen
    │       ├── BottomNav.tsx         # Mobile bottom navigation bar + FAB
    │       └── PWAInstallBanner.tsx  # Native app install prompt banner
    │
    └── android/                 # Native Android Project (Capacitor)
        ├── app/
        │   └── build.gradle     # Android application gradle configuration
        └── build.gradle
```

---

## ⚙️ Quick Setup & Gmail Configuration

### 1. Generating a Gmail App Password (Takes 1 Minute)
To enable real email delivery from the backend to your Gmail inbox:
1. Go to your **Google Account**: [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Ensure **2-Step Verification** is turned **ON**.
3. In the search bar at the top of Google Account, type **"App Passwords"** and select it.
4. Name the app `Smart Task App` and click **Create**.
5. Copy the generated **16-character password** (e.g., `abcd efgh ijkl mnop`).
6. Open `server/.env` and enter your credentials:

```env
PORT=5000
JWT_SECRET=your_custom_jwt_secret_key_2026
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
CRON_SCHEDULE=5 0 * * *
```

> 💡 *Note: If credentials are not provided, the app operates in **Simulated / Preview Mode**, recording all emails to the database log and UI without crashing.*

---

## 🚀 How to Run on Web

### Option A: Production Mode (Recommended - Single Server)
Build the frontend once and let Express serve both the API and the PWA:

```bash
# From project root
npm run build:client
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

### Option B: Development Mode (Hot-Reload)
Run both the backend and Vite frontend with hot-module replacement:

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
```
Runs at `http://localhost:5000`.

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
```
Runs at `http://localhost:5173`.

---

## 🧪 Running the Automated End-to-End Test Suite

Run the pre-configured end-to-end verification test to simulate user signup, task creation for $T$, $T-1$, and $T-2$, instant email test, and automated scheduler sweep:

```bash
npm run test:e2e
```

---

## 📲 How to Install as PWA (Mobile & PC)

### On Android (Chrome):
1. Open the app URL in Google Chrome on your Android phone.
2. Tap the **"Install Now"** banner that appears automatically, or tap Chrome's three dots (`⋮`) -> **"Install App"** / **"Add to Home screen"**.
3. The app is now installed on your Android app drawer with its own icon and opens full-screen without browser URL bars!

### On iPhone / iPad (Safari):
1. Open the URL in Safari.
2. Tap the **Share** button (box with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.

### On Desktop (Windows/Mac/Linux):
1. In Chrome or Edge, click the **Install App** icon in the address bar (or click the green "Install App" button in the app navbar).

---

## 🤖 How to Build Android APK via Capacitor

The native Android project is already initialized inside `client/android/`.

### Method 1: Using Android Studio (GUI)
1. Build the latest web assets and sync:
   ```bash
   npm run cap:sync
   ```
2. Open the project in Android Studio:
   ```bash
   npm run cap:open
   ```
3. In Android Studio:
   - Click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
   - Or click **Run** (Green Play Button) to run directly on a connected Android phone or Emulator.

---

### Method 2: Command Line APK Build (Gradle)
If you have Android SDK and Java installed:
```bash
cd client/android
./gradlew assembleDebug
```
The generated APK will be located at:
`client/android/app/build/outputs/apk/debug/app-debug.apk`

Transfer this `.apk` file to your Android phone and install it directly!

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register new user with Gmail & password |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/auth/me` | Fetch logged-in user profile |
| `GET` | `/api/tasks` | Get all tasks (supports date/status filters) |
| `POST` | `/api/tasks` | Create task on target date with Gmail binding |
| `PUT` | `/api/tasks/:id` | Update task title, date, priority, or completion |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `POST` | `/api/email/test` | Send immediate test email to logged-in Gmail |
| `POST` | `/api/reminders/trigger-check` | Execute 3-day reminder cron sweep on demand |
| `GET` | `/api/reminders/logs` | View email delivery logs |
| `GET` | `/api/system/status` | Check server and Gmail SMTP connection status |

---

## 🎯 Verification Checklist

- [x] Responsive Cross-Platform UI (Desktop split-screen + Mobile native bottom nav)
- [x] PWA Manifest and Service Worker registered for installability
- [x] User signup & login saving Gmail address in database
- [x] Interactive calendar with tap-to-schedule modal
- [x] 3-Day Automated Reminder System ($T-2$, $T-1$, $T$) with exact Bengali templates
- [x] Nodemailer Gmail SMTP integration (App Password)
- [x] "Test Email Now" button for instant inbox verification
- [x] "Run Reminder Check" button for manual scheduler sweeps
- [x] Capacitor Android native project configured and synced
- [x] Automated E2E verification test suite passing 100%
=======
# asdfgh
fghdrshthgfh
>>>>>>> 3dd04d9ba1b7ef469764adcd9b61d8ebd173fc79
#   a s d a c f s d f e r e r h g h t u  
 