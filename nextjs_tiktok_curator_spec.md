# TikTok Curator - Next.js (App Router) Project Specification

> **Instruction for AI / Antigravity:** Read this complete specification and generate the full production-ready Next.js application using React 18/19, TypeScript, Tailwind CSS, and **Supabase (PostgreSQL)** for cloud persistence. Ensure all components are modular, reactive, and responsive.

---

## 1. Project Overview & Tech Stack

- **Framework:** Next.js (App Router `app/` directory)
- **Language:** TypeScript (`strict: true`)
- **Styling:** Tailwind CSS (Dark Mode default, TikTok theme colors `#25F4EE` cyan & `#FE2C55` pink)
- **Icons:** `lucide-react`
- **Database & Persistence:** **Supabase (PostgreSQL)** with Row Level Security (RLS) + React Context (with safe fallback if env is not set).
- **Core Functionalities:**
  1. Manage Topics (Create, Edit, Delete, Filter) stored in Supabase `topics` table.
  2. Save TikTok Videos (URL parsing, ID extraction, title, topic foreign key, markdown/bullet notes) stored in Supabase `videos` table.
  3. Two Viewing Modes:
     - **Grid View:** Responsive cards showing TikTok preview/player + quick notes.
     - **Feed Mode:** Full vertical snap-scroll reel experience (`scroll-snap-type: y mandatory`) mimicking TikTok / Reels, allowing instant scrolling through videos filtered by the active topic with single active player management.

---

## 2. Directory Structure

```text
tiktok-curator/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.example
├── .env.local
├── supabase_schema.sql
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── TopicBar.tsx
│   ├── VideoCard.tsx
│   ├── VideoGrid.tsx
│   ├── VideoFeed.tsx
│   ├── TikTokEmbed.tsx
│   ├── modals/
│   │   ├── AddEditVideoModal.tsx
│   │   ├── ManageTopicsModal.tsx
│   │   └── VideoDetailModal.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Toast.tsx
├── context/
│   └── CuratorContext.tsx
├── types/
│   └── index.ts
└── lib/
    ├── supabase.ts
    ├── supabaseService.ts
    ├── storage.ts
    └── utils.ts
```

---

## 3. Data Models & TypeScript Types (`types/index.ts`)

```typescript
export interface Topic {
  id: string; // UUID from Supabase or string
  name: string;
  color?: string;
  createdAt: number;
}

export interface VideoItem {
  id: string; // UUID from Supabase or string
  url: string;
  videoId: string;
  title: string;
  topicId: string;
  notes: string;
  createdAt: number;
}

export type ViewMode = 'grid' | 'feed';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}
```

---

## 4. Supabase Database Schema (`supabase_schema.sql`)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Topics Table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text default '#25F4EE',
  created_at timestamptz default now() not null
);

-- 2. Videos Table
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  video_id text not null,
  title text not null,
  topic_id uuid references public.topics(id) on delete set null,
  notes text default '',
  created_at timestamptz default now() not null
);

-- Indexes for performance
create index if not exists idx_videos_topic_id on public.videos(topic_id);
create index if not exists idx_videos_created_at on public.videos(created_at desc);

-- Enable Row Level Security (RLS)
alter table public.topics enable row level security;
alter table public.videos enable row level security;

-- Public access policies (with anon key)
create policy "Allow public read access on topics" on public.topics for select using (true);
create policy "Allow public insert on topics" on public.topics for insert with check (true);
create policy "Allow public update on topics" on public.topics for update using (true);
create policy "Allow public delete on topics" on public.topics for delete using (true);

create policy "Allow public read access on videos" on public.videos for select using (true);
create policy "Allow public insert on videos" on public.videos for insert with check (true);
create policy "Allow public update on videos" on public.videos for update using (true);
create policy "Allow public delete on videos" on public.videos for delete using (true);

-- Seed initial default topics
insert into public.topics (id, name, color) values
  ('b0a1a001-0000-0000-0000-000000000001', 'Nấu ăn & Ẩm thực', '#FE2C55'),
  ('b0a1a001-0000-0000-0000-000000000002', 'Coding & AI', '#25F4EE'),
  ('b0a1a001-0000-0000-0000-000000000003', 'Thể thao & Gym', '#F59E0B'),
  ('b0a1a001-0000-0000-0000-000000000004', 'Du lịch & Khám phá', '#10B981')
on conflict (id) do nothing;

-- Seed initial default videos
insert into public.videos (url, video_id, title, topic_id, notes) values
  (
    'https://www.tiktok.com/@gordonramsayofficial/video/7036640523091971333',
    '7036640523091971333',
    'Bí kíp làm món Bò Wellington Gordon Ramsay',
    'b0a1a001-0000-0000-0000-000000000001',
    '• Áp chảo thịt bò thật nhanh để giữ nước ngọt.\n• Nấm băm nhỏ xào cạn nước (duxelles).\n• Cuộn chặt với prosciutto và bột ngàn lớp pastry.\n• Nướng ở nhiệt độ 200°C đến khi vàng giòn.'
  ),
  (
    'https://www.tiktok.com/@fireship_dev/video/7272898779944602922',
    '7272898779944602922',
    '10 tính năng JavaScript mới trong 100s',
    'b0a1a001-0000-0000-0000-000000000002',
    '• Object.groupBy() để phân nhóm mảng dễ dàng.\n• Array.prototype.toSorted() không làm thay đổi mảng gốc.\n• Promise.withResolvers() cực kỳ tiện lợi khi tạo promise thủ công.'
  )
on conflict do nothing;
```

---

## 5. Supabase Client & Service Layer (`lib/supabase.ts`, `lib/supabaseService.ts`)

- `lib/supabase.ts`: Khởi tạo Supabase client an toàn với SSR và phát hiện biến môi trường `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/supabaseService.ts`: Cung cấp các phương thức async CRUD:
  - `fetchTopicsFromDb()`, `createTopicInDb()`, `updateTopicInDb()`, `deleteTopicFromDb()`
  - `fetchVideosFromDb()`, `createVideoInDb()`, `updateVideoInDb()`, `deleteVideoFromDb()`

---

## 6. Context Provider (`context/CuratorContext.tsx`)

React Context kết nối trực tiếp với Supabase (kèm fallback LocalStorage nếu chưa cấu hình key):

- `topics`: List of topics từ Supabase `topics`.
- `videos`: List of videos từ Supabase `videos`.
- `activeTopicId`: Current active topic filter (`'all'` hoặc UUID).
- `viewMode`: `'grid'` | `'feed'`.
- `searchQuery`: Search string.
- `isLoading`: Trạng thái tải từ database.
- `isSupabaseConnected`: boolean hiển thị trạng thái kết nối Cloud Database.
- CRUD methods (bất đồng bộ):
  - `addTopic(name: string, color?: string)`
  - `editTopic(id: string, name: string, color?: string)`
  - `deleteTopic(id: string)`
  - `addVideo(data: Omit<VideoItem, 'id' | 'createdAt'>)`
  - `editVideo(id: string, data: Partial<VideoItem>)`
  - `deleteVideo(id: string)`
  - `showToast(msg: string, type?: 'success' | 'error')`

---

## 7. Dynamic TikTok Embed Component (`components/TikTokEmbed.tsx`)

Nhúng video trực tiếp qua `/embed/v2/{videoId}` với `referrerPolicy="no-referrer"` và chế độ Poster theo nhu cầu (On-Demand Single Player) nhằm loại bỏ hoàn toàn lỗi rate limit `overload-protect triggered`.

---

## 8. TikTok Snap-Scroll Feed Component (`components/VideoFeed.tsx`)

Chế độ lướt dọc snap-scroll rộng rãi (`max-w-2xl`, `h-[89vh]`) với debounce kích hoạt player, công tắc tự động phát và cụm phím điều hướng nổi bên phải trên desktop.

---

## 9. Hướng dẫn thiết lập Supabase

1. Tạo một project mới tại [supabase.com](https://supabase.com).
2. Vào **SQL Editor** trên Supabase Dashboard, copy toàn bộ nội dung file `supabase_schema.sql` và nhấn **Run**.
3. Vào **Project Settings ➔ API**, sao chép:
   - `Project URL` ➔ gán vào `NEXT_PUBLIC_SUPABASE_URL` trong file `.env.local`.
   - `anon public key` ➔ gán vào `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong file `.env.local`.
4. Khởi động ứng dụng bằng `npm run dev`. Toàn bộ dữ liệu sẽ tự động lưu và đồng bộ tức thì trên Supabase!
