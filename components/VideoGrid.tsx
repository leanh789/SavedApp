'use client';

import React from 'react';
import { useCurator } from '@/context/CuratorContext';
import { VideoCard } from './VideoCard';
import { Button } from './ui/Button';
import { Film, Plus, RefreshCw } from 'lucide-react';

export const VideoGrid: React.FC = () => {
  const { filteredVideos, searchQuery, setSearchQuery, activeTopicId, setActiveTopicId, openAddModal } =
    useCurator();

  if (filteredVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4 text-gray-500 shadow-xl">
          <Film size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-200">Không tìm thấy video nào</h3>
        <p className="text-sm text-gray-400 max-w-md mt-1 mb-6">
          {searchQuery
            ? `Không có video nào khớp với từ khóa "${searchQuery}". Hãy thử tìm kiếm khác hoặc xóa bộ lọc.`
            : 'Chưa có video nào trong danh mục này. Hãy bắt đầu lưu video đầu tiên của bạn!'}
        </p>

        <div className="flex items-center gap-3">
          {(searchQuery || activeTopicId !== 'all') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setActiveTopicId('all');
              }}
            >
              <RefreshCw size={14} /> Xóa bộ lọc
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={openAddModal}>
            <Plus size={16} /> Thêm Video Mới
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredVideos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};
