-- ==============================================================
-- TikTok Curator - Supabase Database Schema
-- Run this complete script in Supabase Dashboard -> SQL Editor
-- ==============================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create Topics Table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text default '#25F4EE',
  created_at timestamptz default now() not null
);

-- 3. Create Videos Table
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  video_id text not null,
  title text not null,
  topic_id uuid references public.topics(id) on delete set null,
  notes text default '',
  created_at timestamptz default now() not null
);

-- 4. Create Indexes for query optimization
create index if not exists idx_videos_topic_id on public.videos(topic_id);
create index if not exists idx_videos_created_at on public.videos(created_at desc);
create index if not exists idx_topics_created_at on public.topics(created_at asc);

-- 5. Enable Row Level Security (RLS)
alter table public.topics enable row level security;
alter table public.videos enable row level security;

-- 6. Setup Public Access Policies (Works with Supabase Anon Public Key)
-- Topics Policies
drop policy if exists "Allow public read access on topics" on public.topics;
create policy "Allow public read access on topics" 
  on public.topics for select using (true);

drop policy if exists "Allow public insert on topics" on public.topics;
create policy "Allow public insert on topics" 
  on public.topics for insert with check (true);

drop policy if exists "Allow public update on topics" on public.topics;
create policy "Allow public update on topics" 
  on public.topics for update using (true);

drop policy if exists "Allow public delete on topics" on public.topics;
create policy "Allow public delete on topics" 
  on public.topics for delete using (true);

-- Videos Policies
drop policy if exists "Allow public read access on videos" on public.videos;
create policy "Allow public read access on videos" 
  on public.videos for select using (true);

drop policy if exists "Allow public insert on videos" on public.videos;
create policy "Allow public insert on videos" 
  on public.videos for insert with check (true);

drop policy if exists "Allow public update on videos" on public.videos;
create policy "Allow public update on videos" 
  on public.videos for update using (true);

drop policy if exists "Allow public delete on videos" on public.videos;
create policy "Allow public delete on videos" 
  on public.videos for delete using (true);

-- 7. Seed Initial Default Topics
insert into public.topics (id, name, color) values
  ('b0a1a001-0000-0000-0000-000000000001', 'Nấu ăn & Ẩm thực', '#FE2C55'),
  ('b0a1a001-0000-0000-0000-000000000002', 'Coding & AI', '#25F4EE'),
  ('b0a1a001-0000-0000-0000-000000000003', 'Thể thao & Gym', '#F59E0B'),
  ('b0a1a001-0000-0000-0000-000000000004', 'Du lịch & Khám phá', '#10B981')
on conflict (id) do nothing;

-- 8. Seed Initial Default Videos
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
  ),
  (
    'https://www.tiktok.com/@khaby.lame/video/6959223395898395910',
    '6959223395898395910',
    'Giải pháp đơn giản hóa cuộc sống - Khaby Lame',
    'b0a1a001-0000-0000-0000-000000000003',
    '• Đơn giản là đỉnh cao của sự tinh tế.\n• Khaby Lame phong cách không lời thoại nhưng cực hài hước.\n• Video đạt hàng chục triệu lượt thả tim.'
  )
on conflict do nothing;
