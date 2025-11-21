---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│   auth.users│
└──────┬──────┘
       │
       ├──────────────────────────────────────────┐
       │                                          │
       ▼                                          ▼
┌─────────────┐                            ┌─────────────┐
│  profiles   │                            │   streaks   │
├─────────────┤                            ├─────────────┤
│ id (PK)     │                            │ id (PK)     │
│ full_name   │                            │ user_id (FK)│
│ avatar_url  │                            │ current     │
│ level       │                            │ longest     │
│ total_xp    │                            └─────────────┘
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┬──────────────┐
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
│  subjects   │ │  sessions   │ │    tasks    │ │  reminders  │ │user_achieve. │
├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤ ├──────────────┤
│ id (PK)     │ │ id (PK)     │ │ id (PK)     │ │ id (PK)     │ │ id (PK)      │
│ user_id (FK)│ │ user_id (FK)│ │ user_id (FK)│ │ user_id (FK)│ │ user_id (FK) │
│ name        │ │ subject_id  │ │ subject_id  │ │ title       │ │ achieve_id   │
│ color       │ │ duration    │ │ title       │ │ time        │ │ unlocked_at  │
│ weekly_goal │ │ date        │ │ completed   │ │ days_of_week│ └──────────────┘
└─────────────┘ │ notes       │ └─────────────┘ │ enabled     │
                └─────────────┘                  └─────────────┘
```

### Table Descriptions

#### `profiles`
Stores user profile information and gamification data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (references auth.users) |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | Profile picture URL |
| level | INTEGER | Current level (default: 1) |
| total_xp | INTEGER | Total experience points |

#### `subjects`
User-created study subjects with color coding.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| name | TEXT | Subject name |
| color | TEXT | Color identifier |
| weekly_target_minutes | INTEGER | Weekly goal in minutes |

#### `sessions`
Individual study sessions with duration tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| subject_id | UUID | Foreign key to subjects |
| duration_minutes | INTEGER | Session length |
| date | DATE | Session date |
| notes | TEXT | Optional notes |

#### `tasks`
To-do items associated with subjects.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| subject_id | UUID | Foreign key to subjects |
| title | TEXT | Task description |
| completed | BOOLEAN | Completion status |

#### `reminders`
Scheduled study reminders with day-of-week support.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| title | TEXT | Reminder title |
| time | TEXT | Time in HH:MM format |
| days_of_week | INTEGER[] | Array of days (0-6) |
| enabled | BOOLEAN | Active status |

#### `achievements`
Predefined achievements users can unlock.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Achievement name |
| description | TEXT | Achievement description |
| icon | TEXT | Emoji icon |
| xp_reward | INTEGER | XP awarded |
| requirement_type | TEXT | Type of requirement |
| requirement_value | INTEGER | Value to achieve |

#### `user_achievements`
Junction table for unlocked achievements.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| achievement_id | UUID | Foreign key to achievements |
| unlocked_at | TIMESTAMP | When unlocked |

#### `streaks`
User study streak tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| current_streak | INTEGER | Current consecutive days |
| longest_streak | INTEGER | Best streak ever |
| last_study_date | DATE | Last study session date |

---

## 🔌 API Reference

### Supabase Client Usage

#### Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
await supabase.auth.signOut();
```

#### CRUD Operations

```typescript
// Create subject
const { data, error } = await supabase
  .from('subjects')
  .insert({
    user_id: userId,
    name: 'Mathematics',
    color: 'blue',
    weekly_target_minutes: 300
  });

// Read sessions
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false });

// Update reminder
const { error } = await supabase
  .from('reminders')
  .update({ enabled: false })
  .eq('id', reminderId);

// Delete task
const { error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

