'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Topic, VideoItem, ViewMode, ToastMessage } from '@/types';
import {
  DEFAULT_TOPICS,
  DEFAULT_VIDEOS,
  getStoredTopics,
  getStoredVideos,
  saveStoredTopics,
  saveStoredVideos,
} from '@/lib/storage';

interface CuratorContextType {
  topics: Topic[];
  videos: VideoItem[];
  filteredVideos: VideoItem[];
  activeTopicId: string;
  viewMode: ViewMode;
  searchQuery: string;
  isMounted: boolean;

  // Single active playing video state (prevents TikTok overload-protect)
  activePlayingVideoId: string | null;
  setActivePlayingVideoId: (id: string | null) => void;

  // Setters
  setActiveTopicId: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;

  // Topic actions
  addTopic: (name: string, color?: string) => void;
  editTopic: (id: string, name: string, color?: string) => void;
  deleteTopic: (id: string) => void;

  // Video actions
  addVideo: (data: Omit<VideoItem, 'id' | 'createdAt'>) => void;
  editVideo: (id: string, data: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;

  // Modal actions
  isAddEditModalOpen: boolean;
  editingVideo: VideoItem | null;
  openAddModal: () => void;
  openEditModal: (video: VideoItem) => void;
  closeAddEditModal: () => void;

  isTopicsModalOpen: boolean;
  openTopicsModal: () => void;
  closeTopicsModal: () => void;

  detailVideo: VideoItem | null;
  openDetailModal: (video: VideoItem) => void;
  closeDetailModal: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const CuratorContext = createContext<CuratorContextType | undefined>(undefined);

export const CuratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [topics, setTopics] = useState<Topic[]>(DEFAULT_TOPICS);
  const [videos, setVideos] = useState<VideoItem[]>(DEFAULT_VIDEOS);
  const [activeTopicId, setActiveTopicId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Single active player tracking: prevents simultaneous iframe loads which triggers TikTok rate limits
  const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false);
  const [detailVideo, setDetailVideo] = useState<VideoItem | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from localStorage on mount to ensure SSR safety
  useEffect(() => {
    const loadedTopics = getStoredTopics();
    const loadedVideos = getStoredVideos();
    setTopics(loadedTopics);
    setVideos(loadedVideos);
    setIsMounted(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isMounted) {
      saveStoredTopics(topics);
    }
  }, [topics, isMounted]);

  useEffect(() => {
    if (isMounted) {
      saveStoredVideos(videos);
    }
  }, [videos, isMounted]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Topic operations
  const addTopic = (name: string, color?: string) => {
    if (!name.trim()) return;
    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      name: name.trim(),
      color: color || '#25F4EE',
      createdAt: Date.now(),
    };
    setTopics((prev) => [...prev, newTopic]);
    showToast(`Đã tạo chủ đề "${newTopic.name}"`, 'success');
  };

  const editTopic = (id: string, name: string, color?: string) => {
    if (!name.trim()) return;
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: name.trim(), color: color || t.color } : t))
    );
    showToast(`Đã cập nhật chủ đề`, 'success');
  };

  const deleteTopic = (id: string) => {
    const topicToDelete = topics.find((t) => t.id === id);
    if (!topicToDelete) return;

    setTopics((prev) => prev.filter((t) => t.id !== id));
    if (activeTopicId === id) {
      setActiveTopicId('all');
    }
    showToast(`Đã xóa chủ đề "${topicToDelete.name}"`, 'info');
  };

  // Video operations
  const addVideo = (data: Omit<VideoItem, 'id' | 'createdAt'>) => {
    const newVideo: VideoItem = {
      ...data,
      id: `vid-${Date.now()}`,
      createdAt: Date.now(),
    };
    setVideos((prev) => [newVideo, ...prev]);
    // Set as active player if desired
    setActivePlayingVideoId(newVideo.id);
    showToast(`Đã lưu video thành công!`, 'success');
  };

  const editVideo = (id: string, data: Partial<VideoItem>) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...data } : v))
    );
    showToast(`Đã cập nhật video!`, 'success');
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    if (detailVideo?.id === id) {
      setDetailVideo(null);
    }
    if (activePlayingVideoId === id) {
      setActivePlayingVideoId(null);
    }
    showToast(`Đã xóa video!`, 'info');
  };

  // Modal handlers
  const openAddModal = () => {
    setEditingVideo(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (video: VideoItem) => {
    setEditingVideo(video);
    setIsAddEditModalOpen(true);
  };

  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setEditingVideo(null);
  };

  const openTopicsModal = () => setIsTopicsModalOpen(true);
  const closeTopicsModal = () => setIsTopicsModalOpen(false);

  const openDetailModal = (video: VideoItem) => {
    // When opening detail modal, ensure this is the active video
    setActivePlayingVideoId(video.id);
    setDetailVideo(video);
  };

  const closeDetailModal = () => setDetailVideo(null);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchTopic = activeTopicId === 'all' || video.topicId === activeTopicId;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        video.title.toLowerCase().includes(q) ||
        video.notes.toLowerCase().includes(q);

      return matchTopic && matchQuery;
    });
  }, [videos, activeTopicId, searchQuery]);

  return (
    <CuratorContext.Provider
      value={{
        topics,
        videos,
        filteredVideos,
        activeTopicId,
        viewMode,
        searchQuery,
        isMounted,
        activePlayingVideoId,
        setActivePlayingVideoId,
        setActiveTopicId,
        setViewMode,
        setSearchQuery,
        addTopic,
        editTopic,
        deleteTopic,
        addVideo,
        editVideo,
        deleteVideo,
        isAddEditModalOpen,
        editingVideo,
        openAddModal,
        openEditModal,
        closeAddEditModal,
        isTopicsModalOpen,
        openTopicsModal,
        closeTopicsModal,
        detailVideo,
        openDetailModal,
        closeDetailModal,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </CuratorContext.Provider>
  );
};

export const useCurator = () => {
  const context = useContext(CuratorContext);
  if (!context) {
    throw new Error('useCurator must be used within a CuratorProvider');
  }
  return context;
};
