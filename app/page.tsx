'use client';

import React from 'react';
import { CuratorProvider, useCurator } from '@/context/CuratorContext';
import { Header } from '@/components/Header';
import { TopicBar } from '@/components/TopicBar';
import { VideoGrid } from '@/components/VideoGrid';
import { VideoFeed } from '@/components/VideoFeed';
import { AddEditVideoModal } from '@/components/modals/AddEditVideoModal';
import { ManageTopicsModal } from '@/components/modals/ManageTopicsModal';
import { VideoDetailModal } from '@/components/modals/VideoDetailModal';
import { ToastContainer } from '@/components/ui/Toast';
import { Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { viewMode, isMounted } = useCurator();

  if (!isMounted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-tiktok-cyan border-t-tiktok-pink animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Đang khởi tạo dữ liệu...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {viewMode === 'grid' ? <VideoGrid /> : <VideoFeed />}
    </main>
  );
};

export default function Home() {
  return (
    <CuratorProvider>
      <div className="min-h-screen flex flex-col bg-[#090a0f] text-gray-100 selection:bg-tiktok-pink/30 selection:text-white">
        {/* Navigation & Topic Bars */}
        <Header />
        <TopicBar />

        {/* Dynamic View (Grid or Reel Feed) */}
        <MainContent />

        {/* App Modals */}
        <AddEditVideoModal />
        <ManageTopicsModal />
        <VideoDetailModal />

        {/* Floating Toasts */}
        <ToastContainer />

        {/* Minimal Footer */}
        <footer className="mt-auto border-t border-gray-900/80 py-6 px-4 text-center text-xs text-gray-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Sparkles size={13} className="text-tiktok-cyan" />
              <span>TikTok Curator • Quản lý & Học hỏi từ Video Ngắn</span>
            </div>
            <p className="text-gray-400">
              Chế độ xem Grid & Feed Reel mượt mà
            </p>
          </div>
        </footer>
      </div>
    </CuratorProvider>
  );
}
