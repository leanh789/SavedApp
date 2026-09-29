'use client';

import React from 'react';
import { VideoItem } from '@/types';
import { useCurator } from '@/context/CuratorContext';
import { TikTokEmbed } from './TikTokEmbed';
import { formatDate } from '@/lib/utils';
import {
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  Clock,
  Play,
  Square,
} from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const {
    topics,
    openEditModal,
    deleteVideo,
    openDetailModal,
    activePlayingVideoId,
    setActivePlayingVideoId,
  } = useCurator();

  const topic = topics.find((t) => t.id === video.topicId);
  const isPlaying = activePlayingVideoId === video.id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc muốn xóa video "${video.title}"?`)) {
      deleteVideo(video.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEditModal(video);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      setActivePlayingVideoId(null);
    } else {
      setActivePlayingVideoId(video.id);
    }
  };

  return (
    <div
      onClick={() => openDetailModal(video)}
      className="group relative flex flex-col justify-between bg-[#11131a] hover:bg-[#141722] border border-gray-800/80 hover:border-tiktok-cyan/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-tiktok-cyan/5 cursor-pointer"
    >
      {/* Top Bar: Topic & Date */}
      <div className="p-3.5 pb-2 flex items-center justify-between gap-2 border-b border-gray-800/50 bg-[#0d0f15]/80">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: topic?.color || '#FE2C55' }}
          />
          <span className="text-xs font-semibold text-gray-200">
            {topic?.name || 'Chưa phân loại'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Clock size={11} />
          <span>{formatDate(video.createdAt)}</span>
        </div>
      </div>

      {/* Embedded Player or Smart Poster */}
      <div
        className="w-full flex items-center justify-center p-3 bg-[#090a0f] min-h-[490px]"
        onClick={(e) => e.stopPropagation()}
      >
        <TikTokEmbed
          url={video.url}
          videoId={video.videoId}
          title={video.title}
          topicName={topic?.name}
          topicColor={topic?.color}
          isPlaying={isPlaying}
          onPlay={() => setActivePlayingVideoId(video.id)}
          onStop={() => setActivePlayingVideoId(null)}
        />
      </div>

      {/* Video Info & Notes */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-tiktok-cyan transition line-clamp-2 leading-snug">
              {video.title}
            </h3>
          </div>

          {video.notes && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-gray-900/80 border border-gray-800/80 text-xs text-gray-300 leading-relaxed max-h-24 overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-1 text-tiktok-cyan font-medium text-[11px] mb-1">
                <FileText size={12} />
                <span>Ghi chú & Tóm tắt:</span>
              </div>
              <p className="whitespace-pre-line text-gray-300/90">{video.notes}</p>
            </div>
          )}
        </div>

        {/* Card Actions Bottom */}
        <div
          className="mt-4 pt-3 border-t border-gray-800/70 flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleEdit}
              title="Chỉnh sửa video"
              className="p-1.5 rounded-lg text-gray-400 hover:text-tiktok-cyan hover:bg-gray-800 transition"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={handleDelete}
              title="Xóa video"
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-tiktok-cyan/20 text-tiktok-cyan border border-tiktok-cyan/30 hover:bg-tiktok-cyan hover:text-black'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square size={12} className="fill-amber-400" /> Tạm dừng
                </>
              ) : (
                <>
                  <Play size={12} className="fill-tiktok-cyan" /> Phát
                </>
              )}
            </button>

            <button
              onClick={() => openDetailModal(video)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700 transition font-medium"
            >
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
