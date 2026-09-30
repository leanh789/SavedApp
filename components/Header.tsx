'use client';

import React from 'react';
import { useCurator } from '@/context/CuratorContext';
import { Button } from './ui/Button';
import {
  LayoutGrid,
  Smartphone,
  Plus,
  FolderCog,
  Search,
  X,
  Sparkles,
  Database,
  Cloud,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    openAddModal,
    openTopicsModal,
    isSupabaseMode,
  } = useCurator();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090a0f]/85 border-b border-gray-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-tiktok-cyan via-tiktok-dark to-tiktok-pink p-[1.5px] shadow-lg shadow-tiktok-cyan/10">
            <div className="w-full h-full bg-[#0a0c10] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-tiktok-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                TikTok <span className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">Curator</span>
              </h1>
              
              {/* Database Status Badge */}
              {isSupabaseMode ? (
                <span
                  title="Đang đồng bộ trực tiếp với Supabase Cloud Database"
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 cursor-default"
                >
                  <Cloud size={10} className="animate-pulse" />
                  <span>Supabase</span>
                </span>
              ) : (
                <span
                  title="Đang ở chế độ LocalStorage. Điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local để kích hoạt Cloud DB"
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 cursor-default"
                >
                  <Database size={10} />
                  <span>Local Mode</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              Lưu trữ & Khám phá video TikTok thông minh
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tiêu đề, ghi chú..."
              className="w-full pl-9 pr-9 py-2 bg-gray-900/90 text-sm text-gray-100 placeholder-gray-500 rounded-xl border border-gray-800 focus:outline-none focus:border-tiktok-cyan/60 focus:ring-1 focus:ring-tiktok-cyan/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-gray-400 hover:text-white rounded-md"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Grid / Feed Toggle */}
          <div className="flex items-center p-1 bg-gray-900/90 rounded-xl border border-gray-800">
            <button
              onClick={() => setViewMode('grid')}
              title="Chế độ lưới (Grid View)"
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-tiktok-cyan/20 text-tiktok-cyan font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={16} />
              <span className="hidden md:inline">Lưới</span>
            </button>
            <button
              onClick={() => setViewMode('feed')}
              title="Chế độ lướt dọc (Feed Reels)"
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'feed'
                  ? 'bg-tiktok-pink/20 text-tiktok-pink font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone size={16} />
              <span className="hidden md:inline">Lướt Feed</span>
            </button>
          </div>

          {/* Manage Topics Modal Trigger */}
          <Button
            variant="secondary"
            size="sm"
            onClick={openTopicsModal}
            className="hidden sm:inline-flex"
            title="Quản lý các chủ đề"
          >
            <FolderCog size={15} />
            <span>Chủ đề</span>
          </Button>

          {/* Add Video Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            className="shadow-lg shadow-tiktok-pink/25 font-bold"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Thêm Video</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
