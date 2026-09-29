'use client';

import React from 'react';
import { useCurator } from '@/context/CuratorContext';
import { TikTokEmbed } from '../TikTokEmbed';
import { formatDate } from '@/lib/utils';
import { Button } from '../ui/Button';
import {
  X,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  FileText,
  Bookmark,
} from 'lucide-react';

export const VideoDetailModal: React.FC = () => {
  const {
    detailVideo,
    closeDetailModal,
    topics,
    openEditModal,
    deleteVideo,
  } = useCurator();

  if (!detailVideo) return null;

  const topic = topics.find((t) => t.id === detailVideo.topicId);

  const handleEdit = () => {
    const video = detailVideo;
    closeDetailModal();
    openEditModal(video);
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc muốn xóa video "${detailVideo.title}"?`)) {
      deleteVideo(detailVideo.id);
      closeDetailModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0e1017] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#12141e]">
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold border flex items-center gap-1.5"
              style={{
                borderColor: `${topic?.color || '#FE2C55'}55`,
                backgroundColor: `${topic?.color || '#FE2C55'}22`,
                color: topic?.color || '#FE2C55',
              }}
            >
              <Bookmark size={12} />
              {topic?.name || 'Chưa phân loại'}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              <span>Đã lưu ngày {formatDate(detailVideo.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="p-2 rounded-xl text-gray-400 hover:text-tiktok-cyan hover:bg-gray-800 transition"
              title="Chỉnh sửa"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Xóa"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={closeDetailModal}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content - Two Column Layout on Desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-800">
          {/* Left Column: Embed Player (Single Dedicated Player) */}
          <div className="p-4 sm:p-6 flex items-center justify-center bg-[#08090d]">
            <div className="w-full flex justify-center">
              <TikTokEmbed
                url={detailVideo.url}
                videoId={detailVideo.videoId}
                title={detailVideo.title}
                topicName={topic?.name}
                topicColor={topic?.color}
                isPlaying={true}
              />
            </div>
          </div>

          {/* Right Column: Title, Notes & Details */}
          <div className="p-5 sm:p-7 flex flex-col justify-between space-y-6 bg-[#0e1017]">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {detailVideo.title}
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-mono break-all">
                  ID: {detailVideo.videoId}
                </p>
              </div>

              {/* Notes Container */}
              <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-tiktok-cyan uppercase tracking-wider mb-2">
                  <FileText size={14} />
                  <span>Ghi chú & Kiến thức cốt lõi</span>
                </div>
                {detailVideo.notes ? (
                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line space-y-1">
                    {detailVideo.notes}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    Chưa có ghi chú nào cho video này. Bấm &quot;Chỉnh sửa&quot; để thêm ghi chú.
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
              <Button variant="secondary" size="sm" onClick={handleEdit}>
                <Edit2 size={13} /> Sửa thông tin
              </Button>

              <a
                href={detailVideo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-tiktok-pink to-rose-600 text-white font-bold text-xs shadow-lg shadow-tiktok-pink/20 hover:brightness-110 transition"
              >
                <span>Xem trên TikTok</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
