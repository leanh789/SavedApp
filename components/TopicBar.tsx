'use client';

import React from 'react';
import { useCurator } from '@/context/CuratorContext';
import { Layers, Plus, FolderCog } from 'lucide-react';

export const TopicBar: React.FC = () => {
  const {
    topics,
    videos,
    activeTopicId,
    setActiveTopicId,
    openTopicsModal,
  } = useCurator();

  // Calculate count per topic
  const getCountForTopic = (topicId: string) => {
    if (topicId === 'all') return videos.length;
    return videos.filter((v) => v.topicId === topicId).length;
  };

  return (
    <div className="w-full bg-[#0a0c12]/60 border-b border-gray-800/60 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {/* 'All' topic chip */}
          <button
            onClick={() => setActiveTopicId('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTopicId === 'all'
                ? 'bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-black shadow-md shadow-tiktok-cyan/20'
                : 'bg-gray-900/90 text-gray-300 border border-gray-800 hover:border-gray-700 hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Tất cả</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTopicId === 'all'
                  ? 'bg-black/20 text-black font-bold'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {getCountForTopic('all')}
            </span>
          </button>

          {/* Custom Topics chips */}
          {topics.map((topic) => {
            const isActive = activeTopicId === topic.id;
            const count = getCountForTopic(topic.id);

            return (
              <button
                key={topic.id}
                onClick={() => setActiveTopicId(topic.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-tiktok-pink text-white shadow-md shadow-tiktok-pink/25 ring-1 ring-white/20'
                    : 'bg-gray-900/90 text-gray-300 border border-gray-800 hover:border-gray-700 hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: topic.color || '#25F4EE' }}
                />
                <span>{topic.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/25 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick manage topics button for mobile or handy access */}
        <div className="shrink-0 flex items-center gap-2 pl-2">
          <button
            onClick={openTopicsModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-gray-400 bg-gray-900 border border-gray-800/80 hover:text-white hover:border-gray-700 transition"
          >
            <FolderCog size={13} />
            <span className="hidden sm:inline">Quản lý</span>
          </button>
        </div>
      </div>
    </div>
  );
};
