# TikTok Curator - Next.js (App Router) Project Specification

> **Instruction for AI / Antigravity:** Read this complete specification and generate the full production-ready Next.js application using React 18/19, TypeScript, and Tailwind CSS. Ensure all components are modular, reactive, and responsive.

---

## 1. Project Overview & Tech Stack

- **Framework:** Next.js (App Router `app/` directory)
- **Language:** TypeScript (`strict: true`)
- **Styling:** Tailwind CSS (Dark Mode default, TikTok theme colors `#25F4EE` cyan & `#FE2C55` pink)
- **Icons:** `lucide-react`
- **State Management & Persistence:** LocalStorage / React Context (or Zustand) with SSR hydration safety.
- **Core Functionalities:**
  1. Manage Topics (Create, Edit, Delete, Filter).
  2. Save TikTok Videos (URL parsing, ID extraction, title, topic tag, detailed markdown/bullet notes).
  3. Two Viewing Modes:
     - **Grid View:** Responsive cards showing embedded TikTok frames + quick notes.
     - **Feed Mode:** Full vertical snap-scroll reel experience (`scroll-snap-type: y mandatory`) mimicking TikTok / Reels, allowing instant scrolling through videos filtered by the active topic.

---

## 2. Directory Structure

```text
tiktok-curator/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
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
    ├── storage.ts
    └── utils.ts
```

---

## 3. Data Models & TypeScript Types (`types/index.ts`)

```typescript
export interface Topic {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface VideoItem {
  id: string;
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

## 4. Helper Utilities (`lib/utils.ts`)

```typescript
/**
 * Extracts TikTok numeric video ID from various TikTok URL patterns:
 * e.g., https://www.tiktok.com/@username/video/7272898779944602922
 * or shortlinks / mobile shares
 */
export function extractTikTokVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/\/video\/(\d+)/);
  if (match && match[1]) return match[1];

  const genericIdMatch = url.trim().match(/(\d{15,22})/);
  if (genericIdMatch && genericIdMatch[1]) return genericIdMatch[1];

  return null;
}
```

---

## 5. Storage & Initial Mock Data (`lib/storage.ts`)

```typescript
import { Topic, VideoItem } from '@/types';

export const DEFAULT_TOPICS: Topic[] = [
  { id: 'top-1', name: 'Nấu ăn & Ẩm thực', createdAt: Date.now() - 30000 },
  { id: 'top-2', name: 'Coding & AI', createdAt: Date.now() - 20000 },
  { id: 'top-3', name: 'Thể thao & Gym', createdAt: Date.now() - 10000 },
];

export const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    url: 'https://www.tiktok.com/@gordonramsayofficial/video/7036640523091971333',
    videoId: '7036640523091971333',
    title: 'Bí kíp làm món Bò Wellington Gordon Ramsay',
    topicId: 'top-1',
    notes: '• Áp chảo thịt thật nhanh.\n• Nấm băm nhỏ xào khô nước.\n• Bọc pastry nướng 200 độ C.',
    createdAt: Date.now() - 100000,
  },
  {
    id: 'vid-2',
    url: 'https://www.tiktok.com/@fireship_dev/video/7272898779944602922',
    videoId: '7272898779944602922',
    title: '10 tính năng JavaScript mới trong 100s',
    topicId: 'top-2',
    notes: '• Object.groupBy()\n• Array.toSorted()\n• Không làm thay đổi mảng ban đầu.',
    createdAt: Date.now() - 50000,
  },
];
```

---

## 6. Context Provider (`context/CuratorContext.tsx`)

Implement React Context with LocalStorage sync and SSR safety (`useEffect` check):

- `topics`: List of topics.
- `videos`: List of videos.
- `activeTopicId`: Current active topic filter (`'all'` or string ID).
- `viewMode`: `'grid'` | `'feed'`.
- `searchQuery`: Search string.
- CRUD methods:
  - `addTopic(name: string)`
  - `editTopic(id: string, name: string)`
  - `deleteTopic(id: string)`
  - `addVideo(data: Omit<VideoItem, 'id' | 'createdAt'>)`
  - `editVideo(id: string, data: Partial<VideoItem>)`
  - `deleteVideo(id: string)`
  - `showToast(msg: string, type?: 'success' | 'error')`

---

## 7. Dynamic TikTok Embed Component (`components/TikTokEmbed.tsx`)

Ensure proper re-hydration of TikTok's embed script when mounting or switching videos:

```tsx
'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  url: string;
  videoId: string;
}

export const TikTokEmbed: React.FC<Props> = ({ url, videoId }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically insert or reload the TikTok embed script
    const scriptId = 'tiktok-embed-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Force TikTok re-render on DOM updates if window.tiktok is present
      (window as any).tiktok?.load?.();
    }
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-gray-400">
        <p>Không tìm thấy Video ID</p>
        <a href={url} target="_blank" rel="noreferrer" className="mt-2 text-xs text-rose-500 underline">
          Mở trực tiếp trên TikTok
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full flex justify-center items-center min-h-[400px]">
      <blockquote
        className="tiktok-embed"
        cite={url}
        data-video-id={videoId}
        style={{ maxWidth: '325px', minWidth: '280px', width: '100%', margin: '0 auto' }}
      >
        <section>
          <a target="_blank" rel="noreferrer" href={url}>
            Đang tải TikTok...
          </a>
        </section>
      </blockquote>
    </div>
  );
};
```

---

## 8. TikTok Snap-Scroll Feed Component (`components/VideoFeed.tsx`)

Build the vertical snap-scroll container with keyboard and button navigation:

```tsx
'use client';

import React, { useRef } from 'react';
import { useCurator } from '@/context/CuratorContext';
import { TikTokEmbed } from './TikTokEmbed';
import { ChevronUp, ChevronDown, ExternalLink, StickyNote } from 'lucide-react';

export const VideoFeed: React.FC = () => {
  const { filteredVideos, topics, openDetailModal } = useCurator();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScrollStep = (direction: 'up' | 'down') => {
    if (!scrollRef.current) return;
    const step = scrollRef.current.clientHeight;
    scrollRef.current.scrollBy({
      top: direction === 'down' ? step : -step,
      behavior: 'smooth',
    });
  };

  if (filteredVideos.length === 0) {
    return <div className="text-center py-20 text-gray-400">Không có video trong danh mục này.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        ref={scrollRef}
        className="w-full max-w-md h-[78vh] sm:h-[82vh] overflow-y-scroll snap-y snap-mandatory rounded-2xl bg-[#090a0d] border border-gray-800 shadow-2xl relative"
      >
        {filteredVideos.map((video, index) => {
          const topic = topics.find((t) => t.id === video.topicId);
          return (
            <div
              key={video.id}
              className="w-full h-full snap-start snap-always flex flex-col justify-between p-4 border-b border-gray-800 relative bg-[#0e1017]"
            >
              {/* Header Info */}
              <div className="z-10 bg-gradient-to-b from-black/80 to-transparent pb-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold">
                  #{topic?.name || 'General'}
                </span>
                <h3 className="text-white font-bold text-sm mt-1.5 line-clamp-1">{video.title}</h3>
              </div>

              {/* TikTok Iframe Player */}
              <div className="flex-1 flex items-center justify-center my-auto overflow-y-auto no-scrollbar">
                <TikTokEmbed url={video.url} videoId={video.videoId} />
              </div>

              {/* Bottom Card Bar: Notes & Open TikTok */}
              <div className="z-10 pt-2 border-t border-gray-800/80 bg-gradient-to-t from-black/80 to-transparent">
                {video.notes && (
                  <div className="mb-2 p-2 rounded-xl bg-gray-900/90 text-xs text-gray-300 max-h-16 overflow-y-auto">
                    <span className="text-cyan-400 font-semibold">Ghi chú: </span>
                    {video.notes}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => openDetailModal(video)}
                    className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800"
                  >
                    <StickyNote size={13} className="text-cyan-400" /> Chi tiết
                  </button>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition"
                  >
                    Xem TikTok <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* External Scroll Controls */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => handleScrollStep('up')}
          className="px-4 py-2 rounded-xl bg-gray-800 text-gray-200 text-xs font-medium hover:bg-gray-700 flex items-center gap-1"
        >
          <ChevronUp size={14} /> Trước
        </button>
        <button
          onClick={() => handleScrollStep('down')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-rose-500 text-black text-xs font-bold shadow hover:opacity-90 flex items-center gap-1"
        >
          Tiếp theo <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};
```

---

## 9. Next Steps for Implementation

1. Place this file (`nextjs_tiktok_curator_spec.md`) in your project root or cursor rules.
2. In Antigravity / Cursor Composer, invoke:
   > *"Read `nextjs_tiktok_curator_spec.md` and generate all the source code files according to the folder structure and TypeScript guidelines specified."*
3. Run `npm run dev` to launch the application at `http://localhost:3000`.
