<div align="center">

# 🎯 FocusFlow

### *Your Ultimate Study Companion with Smart Reminders*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**Track your study sessions • Set smart reminders • Unlock achievements • Stay motivated**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#-demo)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🌟 Overview

**FocusFlow** is a modern, feature-rich study tracking application designed to help students and professionals maximize their productivity. Built with React 19 and TypeScript, it combines powerful time management tools with gamification elements to make studying more engaging and effective.

### Why FocusFlow?

- ⏱️ **Smart Timer System** - Pomodoro technique and custom study sessions
- 🔔 **Background Reminders** - Never miss a study session (works on all pages!)
- 📊 **Detailed Analytics** - Visualize your progress with beautiful charts
- 🏆 **Gamification** - Unlock achievements and level up as you study
- ☁️ **Cloud Sync** - Your data is safely stored and synced across devices
- 🌙 **Dark Mode** - Easy on the eyes during late-night study sessions
- 📱 **PWA Support** - Install as an app on any device
- 🔒 **Secure Authentication** - Email/password and OAuth support

---

## ✨ Features

### 🎯 Core Features

#### 1. **Study Timer**
- **Pomodoro Mode**: 25-minute focus sessions with 5-minute breaks
- **Custom Mode**: Set your own study and break durations
- **Zen Mode**: Distraction-free fullscreen timer
- **Auto-save**: Sessions are automatically saved to the cloud
- **Subject Selection**: Track time per subject

#### 2. **Smart Reminders** 🔔
- **Background Notifications**: Works even when you're on other tabs!
- **Flexible Scheduling**: Set reminders for specific times and days
- **Visual Indicators**: See which reminders will fire today
- **Quick Test**: One-click test reminder for debugging
- **Time Normalization**: Handles different time formats automatically

#### 3. **Subject Management**
- **Color Coding**: 8 beautiful color themes
- **Weekly Goals**: Set target hours per subject
- **Progress Tracking**: See how much you've studied each subject
- **CRUD Operations**: Easy add, edit, and delete

#### 4. **Analytics Dashboard** 📊
- **Study Heatmap**: GitHub-style contribution graph
- **Weekly Breakdown**: Bar chart showing daily study time
- **Subject Distribution**: Pie chart of time per subject
- **Streak Tracking**: Maintain your study streak
- **Time Filters**: View data by week, month, or all time

#### 5. **Gamification System** 🏆
- **XP & Levels**: Earn experience points for studying
- **Achievements**: 20+ achievements to unlock
- **Streak Bonuses**: Extra XP for maintaining streaks
- **Progress Bars**: Visual feedback on your progress
- **Achievement Notifications**: Celebrate your wins!

#### 6. **Task Management** ✅
- **Subject-based Tasks**: Organize tasks by subject
- **Quick Add**: Add tasks on the fly
- **Completion Tracking**: Check off completed tasks
- **Persistent Storage**: Tasks saved to the cloud

---

## 🎬 Demo

### Live Demo
🚀 **[Try FocusFlow Now](https://your-deployment-url.vercel.app)** *(Coming soon)*

### Quick Start Video
📹 **[Watch Tutorial](https://youtube.com/your-video)** *(Coming soon)*

---

## 📸 Screenshots

<div align="center">

### Dashboard
![Dashboard](https://via.placeholder.com/800x500?text=Dashboard+Screenshot)

### Analytics
![Analytics](https://via.placeholder.com/800x500?text=Analytics+Screenshot)

### Reminders
![Reminders](https://via.placeholder.com/800x500?text=Reminders+Screenshot)

### Achievements
![Achievements](https://via.placeholder.com/800x500?text=Achievements+Screenshot)

</div>

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/clevernat/focusflow.git
cd focusflow
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- React 19
- TypeScript
- Tailwind CSS v3
- Supabase Client
- Recharts (for analytics)
- jsPDF (for PDF export)
- date-fns (for date formatting)
- Lucide React (for icons)

### Step 3: Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com/)
   - Click "New Project"
   - Fill in project details

2. **Get Your API Keys**
   - Go to Project Settings → API
   - Copy the `Project URL` and `anon public` key

3. **Create Environment File**

Create a `.env.local` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set Up Database Tables**

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  weekly_target_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects ON DELETE CASCADE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table
CREATE TABLE reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  time TEXT NOT NULL,
  days_of_week INTEGER[] NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements table
CREATE TABLE user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Streaks table
CREATE TABLE streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for subjects
CREATE POLICY "Users can view own subjects" ON subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subjects" ON subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subjects" ON subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subjects" ON subjects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sessions
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reminders
CREATE POLICY "Users can view own reminders" ON reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON reminders FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT TO authenticated USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for streaks
CREATE POLICY "Users can view own streak" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON streaks FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

5. **Seed Initial Achievements** (Optional)

```sql
INSERT INTO achievements (name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first study session', '🎯', 50, 'sessions', 1),
('Getting Started', 'Study for 1 hour total', '⏱️', 100, 'total_minutes', 60),
('Dedicated Learner', 'Study for 10 hours total', '📚', 250, 'total_minutes', 600),
('Study Marathon', 'Study for 50 hours total', '🏃', 500, 'total_minutes', 3000),
('Century Club', 'Study for 100 hours total', '💯', 1000, 'total_minutes', 6000),
('Streak Starter', 'Maintain a 3-day streak', '🔥', 150, 'streak', 3),
('Week Warrior', 'Maintain a 7-day streak', '⚡', 300, 'streak', 7),
('Consistency King', 'Maintain a 30-day streak', '👑', 1000, 'streak', 30),
('Early Bird', 'Study before 8 AM', '🌅', 100, 'early_bird', 1),
('Night Owl', 'Study after 10 PM', '🦉', 100, 'night_owl', 1),
('Pomodoro Pro', 'Complete 10 Pomodoro sessions', '🍅', 200, 'pomodoro', 10),
('Task Master', 'Complete 50 tasks', '✅', 300, 'tasks', 50),
('Subject Explorer', 'Create 5 different subjects', '🎨', 150, 'subjects', 5),
('Focused Mind', 'Complete a 2-hour session', '🧠', 250, 'long_session', 120),
('Weekend Warrior', 'Study on a weekend', '🎮', 100, 'weekend', 1),
('Daily Grind', 'Study every day for a week', '📅', 400, 'daily_week', 7),
('Goal Crusher', 'Meet your weekly goal', '🎯', 200, 'weekly_goal', 1),
('Overachiever', 'Exceed weekly goal by 50%', '🚀', 500, 'goal_150', 1),
('Zen Master', 'Use Zen mode 10 times', '🧘', 200, 'zen_mode', 10),
('Data Analyst', 'Export your study data', '📊', 100, 'export', 1);
```

### Step 4: Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ Yes |

### Supabase Configuration

#### Authentication Providers

Enable the following in Supabase Dashboard → Authentication → Providers:

- ✅ Email/Password
- ✅ Google OAuth (optional)
- ✅ GitHub OAuth (optional)

#### Email Templates

Customize email templates in Supabase Dashboard → Authentication → Email Templates:
- Confirmation email
- Password reset
- Magic link

---

## 📚 Usage Guide

### Getting Started

1. **Sign Up / Sign In**
   - Create an account with email/password
   - Or use Google/GitHub OAuth

2. **Create Your First Subject**
   - Click "Add Subject" on the dashboard
   - Choose a name and color
   - Set a weekly goal (optional)

3. **Start Studying**
   - Select a subject from the timer
   - Choose Pomodoro or Custom mode
   - Click "Start" to begin

4. **Set Up Reminders**
   - Go to the Reminders tab
   - Click "Add" to create a reminder
   - Set time and days of the week
   - Reminders work on all pages!

### Timer Modes

#### Pomodoro Mode
- **Focus**: 25 minutes
- **Break**: 5 minutes
- **Long Break**: 15 minutes (after 4 sessions)

#### Custom Mode
- Set your own focus duration
- Set your own break duration
- Perfect for longer study sessions

#### Zen Mode
- Fullscreen distraction-free timer
- Minimal UI
- Press ESC to exit

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Start/Pause timer |
| `R` | Reset timer |
| `ESC` | Exit Zen mode |
| `Ctrl/Cmd + S` | Save session |

### Tips for Maximum Productivity

1. **Set Realistic Goals**: Start with 2-3 hours per week per subject
2. **Use Pomodoro**: Great for maintaining focus
3. **Enable Reminders**: Never miss a study session
4. **Track Your Streak**: Build consistency
5. **Review Analytics**: Identify patterns and optimize
6. **Unlock Achievements**: Stay motivated with gamification

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript 5.6** - Type-safe development
- **Vite 6** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first CSS framework

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication & Authorization

### Libraries & Tools
- **Recharts** - Beautiful charts for analytics
- **date-fns** - Modern date utility library
- **Lucide React** - Beautiful icon set
- **jsPDF** - PDF generation for exports
- **jsPDF-AutoTable** - Table generation for PDFs

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 📁 Project Structure

```
focusflow/
├── public/
│   ├── icon.svg              # App icon
│   ├── icon-192.png          # PWA icon (192x192)
│   ├── icon-512.png          # PWA icon (512x512)
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker
├── components/
│   ├── Dashboard.tsx         # Main dashboard component
│   ├── Timer.tsx             # Study timer component
│   ├── Analytics.tsx         # Analytics dashboard
│   ├── RemindersPanel.tsx    # Reminders management
│   ├── AchievementsPanel.tsx # Achievements display
│   ├── Auth.tsx              # Authentication UI
│   ├── Heatmap.tsx           # Study heatmap
│   ├── StreakDisplay.tsx     # Streak counter
│   └── XPProgressBar.tsx     # XP progress bar
├── hooks/
│   ├── useSupabaseData.ts    # Supabase data hooks
│   ├── useGamification.ts    # Gamification logic
│   └── useReminderChecker.ts # Background reminder checker
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── lib/
│   └── supabase.ts           # Supabase client & types
├── utils/
│   └── pdfExport.ts          # PDF export utilities
├── App.tsx                   # Main app component
├── AppWrapper.tsx            # App wrapper with providers
├── index.tsx                 # Entry point
├── types.ts                  # TypeScript types
├── constants.ts              # App constants
├── pwaRegistration.ts        # PWA registration
├── tailwind.config.js        # Tailwind configuration
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

---

## 🗄️ Database Schema

### Key Tables

- **profiles** - User profile and gamification data
- **subjects** - Study subjects with color coding
- **sessions** - Individual study sessions
- **tasks** - To-do items per subject
- **reminders** - Scheduled notifications
- **achievements** - Unlockable achievements
- **user_achievements** - User's unlocked achievements
- **streaks** - Study streak tracking

See [Database Schema Documentation](./README_PART2.md) for detailed schema and relationships.

---

## 🎨 Customization

### Color Themes

FocusFlow includes 8 beautiful color themes for subjects:

| Color | Class | Hex |
|-------|-------|-----|
| 🔵 Blue | `bg-blue-500` | #3B82F6 |
| 🟢 Green | `bg-green-500` | #10B981 |
| 🟣 Purple | `bg-purple-500` | #8B5CF6 |
| 🔴 Red | `bg-red-500` | #EF4444 |
| 🟡 Yellow | `bg-yellow-500` | #F59E0B |
| 🟠 Orange | `bg-orange-500` | #F97316 |
| 🩷 Pink | `bg-pink-500` | #EC4899 |
| 🔵 Indigo | `bg-indigo-500` | #6366F1 |

### Dark Mode

Toggle between light and dark themes:
- Click the sun/moon icon in the navigation
- Preference is saved to localStorage
- Smooth transitions between themes

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub** (you're here!)

2. **Import to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Add Supabase keys

### Deploy to Railway

```bash
railway login
railway init
railway up
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Manual Testing Checklist

- [ ] Sign up with email/password
- [ ] Sign in with existing account
- [ ] Create a subject
- [ ] Start a study session
- [ ] Complete a Pomodoro cycle
- [ ] Set a reminder
- [ ] Receive notification
- [ ] Complete a task
- [ ] View analytics
- [ ] Unlock an achievement
- [ ] Export data to PDF
- [ ] Toggle dark mode
- [ ] Test on mobile device

---

## 🐛 Troubleshooting

### Common Issues

#### Reminders Not Working

**Problem**: Notifications don't appear

**Solutions**:
1. Check browser notification permissions
2. Ensure notifications are enabled in OS settings
3. Check console for errors
4. Try the "Test Notification" button
5. Verify time format is HH:MM

#### Database Connection Error

**Problem**: "Failed to fetch" errors

**Solutions**:
1. Verify `.env.local` file exists
2. Check Supabase URL and key are correct
3. Ensure RLS policies are set up
4. Check Supabase project is active

#### Build Errors

**Problem**: Build fails with TypeScript errors

**Solutions**:
1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear cache: `npm run clean`
3. Update dependencies: `npm update`

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs

1. Check if the bug is already reported in [Issues](https://github.com/clevernat/focusflow/issues)
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS information

### Suggesting Features

1. Open a new issue with the `enhancement` label
2. Describe the feature and its benefits
3. Provide mockups or examples if possible

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/clevernat/focusflow.git
   cd focusflow
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run dev
   npm run build
   ```

5. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

6. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Development Guidelines

- Use TypeScript for type safety
- Follow React best practices
- Write meaningful commit messages
- Keep components small and focused
- Add JSDoc comments for functions
- Test on multiple browsers

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 FocusFlow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 💬 Support

### Get Help

- 📧 **Email**: support@focusflow.app
- 💬 **Discord**: [Join our community](https://discord.gg/focusflow)
- 🐦 **Twitter**: [@focusflow_app](https://twitter.com/focusflow_app)
- 📖 **Documentation**: [docs.focusflow.app](https://docs.focusflow.app)

### FAQ

**Q: Is FocusFlow free?**
A: Yes! FocusFlow is completely free and open-source.

**Q: Can I use it offline?**
A: Yes, FocusFlow is a PWA and works offline after initial load.

**Q: How is my data stored?**
A: All data is securely stored in Supabase with Row Level Security.

**Q: Can I export my data?**
A: Yes! Use the export feature to download your data as PDF or JSON.

**Q: Does it work on mobile?**
A: Yes! FocusFlow is fully responsive and works on all devices.

**Q: Can I self-host it?**
A: Yes! Clone the repo and deploy to your own server.

---

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Supabase** - For the excellent backend platform
- **Tailwind CSS** - For the beautiful styling system
- **Lucide** - For the icon set
- **Recharts** - For the charting library
- **All Contributors** - Thank you for your contributions!

---

## 🗺️ Roadmap

### Version 2.0 (Planned)

- [ ] Mobile app (React Native)
- [ ] Study groups and collaboration
- [ ] AI-powered study recommendations
- [ ] Integration with calendar apps
- [ ] Spotify integration for study music
- [ ] Advanced analytics with ML insights
- [ ] Custom themes and branding
- [ ] API for third-party integrations
- [ ] Browser extension
- [ ] Voice commands

### Version 1.1 (In Progress)

- [x] Background reminders
- [x] Improved notification system
- [ ] Weekly/monthly reports
- [ ] Study session templates
- [ ] Import/export improvements
- [ ] Performance optimizations

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/clevernat/focusflow?style=social)
![GitHub forks](https://img.shields.io/github/forks/clevernat/focusflow?style=social)
![GitHub issues](https://img.shields.io/github/issues/clevernat/focusflow)
![GitHub pull requests](https://img.shields.io/github/issues-pr/clevernat/focusflow)
![GitHub last commit](https://img.shields.io/github/last-commit/clevernat/focusflow)
![GitHub contributors](https://img.shields.io/github/contributors/clevernat/focusflow)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ by [clevernat](https://github.com/clevernat)**

[Report Bug](https://github.com/clevernat/focusflow/issues) • [Request Feature](https://github.com/clevernat/focusflow/issues) • [Contribute](https://github.com/clevernat/focusflow/pulls)

</div>
