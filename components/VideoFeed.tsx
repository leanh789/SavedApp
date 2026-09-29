'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useCurator } from '@/context/CuratorContext';
import { TikTokEmbed } from './TikTokEmbed';
import {
  ChevronUp,
  ChevronDown,
  ExternalLink,
  StickyNote,
  Edit2,
  Trash2,
  Film,
  Plus,
  Zap,
  ZapOff,
  Maximize2,
} from 'lucide-react';
import { Button } from './ui/Button';

export const VideoFeed: React.FC = () => {
  const {
    filteredVideos,
    topics,
    openDetailModal,
    openEditModal,
    deleteVideo,
    openAddModal,
  } = useCurator();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number | null>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const scrollDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  const scrollToStep = (index: number) => {
    if (!scrollRef.current) return;
    const targetIdx = Math.max(0, Math.min(index, filteredVideos.length - 1));
    const step = scrollRef.current.clientHeight;
    scrollRef.current.scrollTo({
      top: targetIdx * step,
      behavior: 'smooth',
    });
    setCurrentIndex(targetIdx);
    if (autoPlay) {
      setActivePlayerIndex(targetIdx);
    }
  };

  const handleScrollStep = (direction: 'up' | 'down') => {
    scrollToStep(direction === 'down' ? currentIndex + 1 : currentIndex - 1);
  };

  // Keyboard navigation for feeds (Arrow Up / Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', 'j'].includes(e.key)) {
        e.preventDefault();
        handleScrollStep('down');
      } else if (['ArrowUp', 'PageUp', 'k'].includes(e.key)) {
        e.preventDefault();
        handleScrollStep('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredVideos.length, autoPlay]);

  // Debounced scroll listener to avoid firing rapid requests while scrolling
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, clientHeight } = scrollRef.current;
    const newIndex = Math.round(scrollTop / (clientHeight || 1));

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < filteredVideos.length) {
      setCurrentIndex(newIndex);

      if (scrollDebounceTimer.current) {
        clearTimeout(scrollDebounceTimer.current);
      }

      // 350ms debounce before activating the player: avoids triggering requests for intermediate skipped videos!
      scrollDebounceTimer.current = setTimeout(() => {
        if (autoPlay) {
          setActivePlayerIndex(newIndex);
        }
      }, 350);
    }
  };

  if (filteredVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4 text-gray-500 shadow-xl">
          <Film size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-200">Không có video trong danh mục này</h3>
        <p className="text-sm text-gray-400 max-w-md mt-1 mb-6">
          Thêm video hoặc chọn chủ đề khác để trải nghiệm chế độ lướt feed.
        </p>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          <Plus size={16} /> Thêm Video Mới
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-1 px-2">
      {/* Top Feed Control Bar (Wide & Prominent) */}
      <div className="w-full max-w-xl sm:max-w-2xl flex items-center justify-between mb-3 px-4 py-2 rounded-2xl bg-gray-900/80 border border-gray-800/90 backdrop-blur-md shadow-lg text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-tiktok-cyan/15 text-tiktok-cyan">
            <Maximize2 size={14} />
          </div>
          <span className="text-gray-200 font-bold sm:text-sm">
            Chế độ Reel Lướt Dọc
          </span>
          <span className="text-[11px] font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md border border-gray-700">
            {currentIndex + 1} / {filteredVideos.length}
          </span>
        </div>

        {/* Auto-Play Toggle */}
        <button
          onClick={() => {
            const next = !autoPlay;
            setAutoPlay(next);
            if (next) {
              setActivePlayerIndex(currentIndex);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition font-semibold text-xs ${
            autoPlay
              ? 'bg-tiktok-cyan/20 text-tiktok-cyan border border-tiktok-cyan/40 shadow-sm shadow-tiktok-cyan/10'
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
          }`}
          title="Bật/Tắt tự động phát khi cuộn video"
        >
          {autoPlay ? (
            <>
              <Zap size={13} className="text-tiktok-cyan fill-tiktok-cyan animate-pulse" />
              <span>Tự phát: Bật</span>
            </>
          ) : (
            <>
              <ZapOff size={13} />
              <span>Tự phát: Tắt</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container with Floating Navigation on Desktop */}
      <div className="relative w-full flex items-center justify-center">
        {/* Large Scrollable Reel Frame */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full max-w-xl sm:max-w-2xl h-[86vh] sm:h-[89vh] overflow-y-scroll snap-y snap-mandatory rounded-3xl bg-[#090a0d] border border-gray-800/90 shadow-2xl relative scroll-smooth no-scrollbar"
        >
          {filteredVideos.map((video, index) => {
            const topic = topics.find((t) => t.id === video.topicId);
            const isPlaying = activePlayerIndex === index;

            return (
              <div
                key={video.id}
                className="w-full h-full snap-start snap-always flex flex-col justify-between p-3 sm:p-5 border-b border-gray-800/80 relative bg-[#0d0f17] select-none"
              >
                {/* Header Info */}
                <div className="z-10 bg-gradient-to-b from-black/95 via-black/70 to-transparent p-3 sm:p-4 rounded-2xl backdrop-blur-md border border-white/5">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5"
                      style={{
                        borderColor: `${topic?.color || '#FE2C55'}55`,
                        backgroundColor: `${topic?.color || '#FE2C55'}22`,
                        color: topic?.color || '#FE2C55',
                      }}
                    >
                      #{topic?.name || 'Chưa phân loại'}
                    </span>
                    <span className="text-xs font-mono text-gray-400 bg-gray-900/90 px-2.5 py-1 rounded-lg border border-gray-800">
                      Video {index + 1} / {filteredVideos.length}
                    </span>
                  </div>
                  <h3 className="text-white font-extrabold text-sm sm:text-base mt-2 line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                </div>

                {/* TikTok Large Player Container */}
                <div className="flex-1 flex items-center justify-center my-auto overflow-y-auto no-scrollbar py-2 w-full">
                  <TikTokEmbed
                    url={video.url}
                    videoId={video.videoId}
                    title={video.title}
                    topicName={topic?.name}
                    topicColor={topic?.color}
                    size="large"
                    isPlaying={isPlaying}
                    onPlay={() => setActivePlayerIndex(index)}
                    onStop={() => setActivePlayerIndex(null)}
                  />
                </div>

                {/* Bottom Card Bar: Notes & Action Buttons */}
                <div className="z-10 pt-3 border-t border-gray-800/80 bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-2xl p-3 sm:p-4">
                  {video.notes && (
                    <div className="mb-3 p-3 rounded-2xl bg-gray-900/90 border border-gray-800 text-xs sm:text-sm text-gray-200 max-h-24 overflow-y-auto no-scrollbar leading-relaxed">
                      <span className="text-tiktok-cyan font-bold">Ghi chú & Tóm tắt: </span>
                      <span className="whitespace-pre-line text-gray-300">{video.notes}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetailModal(video)}
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-200 hover:text-white px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition font-semibold"
                      >
                        <StickyNote size={14} className="text-tiktok-cyan" /> Chi tiết
                      </button>
                      <button
                        onClick={() => openEditModal(video)}
                        title="Sửa video"
                        className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Xóa video "${video.title}"?`)) {
                            deleteVideo(video.id);
                          }
                        }}
                        title="Xóa video"
                        className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-tiktok-pink to-rose-600 text-white hover:brightness-110 transition shadow-lg shadow-tiktok-pink/25"
                    >
                      Xem TikTok <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Side Controls for Desktop Screens */}
        <div className="hidden lg:flex flex-col gap-3 ml-4">
          <button
            onClick={() => handleScrollStep('up')}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-2xl bg-gray-900/90 border border-gray-800 text-gray-200 hover:text-white hover:border-tiktok-cyan/40 hover:bg-gray-800 flex items-center justify-center transition shadow-xl disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Video trước (Phím mũi tên lên)"
          >
            <ChevronUp size={22} />
          </button>
          <div className="text-center font-mono text-xs text-gray-400 py-1">
            {currentIndex + 1}
          </div>
          <button
            onClick={() => handleScrollStep('down')}
            disabled={currentIndex === filteredVideos.length - 1}
            className="w-12 h-12 rounded-2xl bg-gradient-to-b from-tiktok-cyan to-tiktok-pink text-black font-bold flex items-center justify-center transition shadow-xl shadow-tiktok-pink/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Video kế tiếp (Phím mũi tên xuống)"
          >
            <ChevronDown size={22} />
          </button>
        </div>
      </div>

      {/* External Scroll Controls Below Frame */}
      <div className="flex items-center gap-4 mt-3">
        <button
          onClick={() => handleScrollStep('up')}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-200 text-xs font-semibold hover:bg-gray-800 hover:text-white flex items-center gap-1.5 transition shadow disabled:opacity-40"
          title="Video trước"
        >
          <ChevronUp size={16} /> Trước
        </button>
        <span className="text-xs text-gray-400 font-mono">
          Phím <kbd className="px-2 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-200 font-bold">↑</kbd> /{' '}
          <kbd className="px-2 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-200 font-bold">↓</kbd>
        </span>
        <button
          onClick={() => handleScrollStep('down')}
          disabled={currentIndex === filteredVideos.length - 1}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-black text-xs font-extrabold shadow-lg shadow-tiktok-pink/20 hover:brightness-110 flex items-center gap-1.5 transition disabled:opacity-40"
          title="Video kế tiếp"
        >
          Tiếp theo <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
};
