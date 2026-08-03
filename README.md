# Audiobook & Story CMS Admin Dashboard

A modern, full-featured Content Management System (CMS) admin dashboard for managing audiobooks, stories, episodes, audio assets, and categories. Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and **Supabase (Auth, Database, Storage)**.

---

## 🚀 Features

- **Authentication**: Secure Login and Registration using Supabase Authentication.
- **Story Management**:
  - Add, edit, and delete stories.
  - **Multi-Category Assignment**: Select and link multiple categories per story via junction table mappings (`story_category_links`).
  - Cover and thumbnail image management stored in Supabase Storage (`story-assets`).
  - Automatic calculation of total pages and total audio duration across all episodes.
- **Episode & Audio Management**:
  - **Full Episode & Title Editing**: Edit episode titles, descriptions, episode numbers, free preview flags, audio files, images, and scripts at `/episodes/[id]/edit`.
  - **Grouped Episode View**: Interactive accordion view of episodes grouped by story with linked story thumbnails and episode cover artwork.
  - Episode cover images and audio uploads saved into organized storage paths (`stories/<story_name>/images` and `stories/<story_name>/audio`).
  - **Automatic MP3 Audio Duration Extraction**: Auto-detects audio duration in seconds upon uploading new audio files.
  - Built-in inline audio preview player.
- **Category Management**: Create and organize story categories.

---

## 📋 Prerequisites

Before running or deploying this application, ensure you have:

- **Node.js**: v18.0.0 or v20+ installed.
- **npm** (or yarn / pnpm / bun).
- A **Supabase** project set up with:
  - Storage Bucket: `story-assets` (Public bucket)
  - Tables: `stories`, `story_categories`, `story_category_links`, `episodes`

---

## 🔑 Environment Variables Setup

Create a `.env.local` file in the root directory of the project. You can copy the provided `.env.example` template:

```bash
cp .env.example .env.local
```

### Required Environment Variables

| Variable Key | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project API URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Public Anonymous API Key | `eyJhbGciOiJIUzI1NiIsInR...` |
| `JWT_SECRET` | Secret key used for session/JWT verification | `random_32_byte_secret_key` |

---

## 🛠️ Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone <your-repository-url>
   cd <your-repository-directory>
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env.local` and fill in your Supabase credentials as described above.

---

## 🏃 Running the Application

### 1. Development Mode

Run the local Next.js development server with hot-reloading:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

### 2. Production Build

Build and start the application locally in production mode:

```bash
# Compile and build Next.js production bundle
npm run build

# Start the production server
npm start
```

---

### 3. Deploying & Running on VPS (using PM2)

To run the application continuously on a VPS server using **PM2**:

1. **Install PM2 globally** (if not already installed):
   ```bash
   npm install -g pm2
   ```

2. **Build the Application**:
   ```bash
   npm run build
   ```

3. **Start with PM2**:
   ```bash
   pm2 start npm --name "boopi-admin-cms" -- start
   ```

4. **Useful PM2 Commands**:
   ```bash
   # Check running status
   pm2 status

   # View live logs
   pm2 logs boopi-admin-cms --lines 50

   # Restart application after pulling updates
   pm2 restart boopi-admin-cms

   # Save PM2 process list to start automatically on reboot
   pm2 save
   pm2 startup
   ```

---

## 🗄️ Database & Storage Structure

### Supabase Storage Bucket
- **Bucket Name**: `story-assets` (Public)
  - Layout: `stories/<story_title>/images/<file>`
  - Layout: `stories/<story_title>/audio/<file>`

### Main Database Tables
- `stories`: Stores story metadata (title, description, cover_url, thumbnail_url, duration_seconds, total_pages, etc.).
- `story_categories`: Stores category names.
- `story_category_links`: Junction table mapping stories to multiple categories (`story_id`, `category_id`).
- `episodes`: Stores page/episode entries linked to a story (`story_id`, `episode_number`, `title`, `audio_url`, `image_url`, `duration_seconds`, `hindi_script`, `english_script`).
