'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Topic, VideoItem, ViewMode, ToastMessage } from '@/types';
import {
  DEFAULT_TOPICS,
  DEFAULT_VIDEOS,
  getStoredTopics,
  getStoredVideos,
  saveStoredTopics,
  saveStoredVideos,
} from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  fetchTopicsFromSupabase,
  createTopicInSupabase,
  updateTopicInSupabase,
  deleteTopicInSupabase,
  fetchVideosFromSupabase,
  createVideoInSupabase,
  updateVideoInSupabase,
  deleteVideoInSupabase,
} from '@/lib/supabaseService';

interface CuratorContextType {
  topics: Topic[];
  videos: VideoItem[];
  filteredVideos: VideoItem[];
  activeTopicId: string;
  viewMode: ViewMode;
  searchQuery: string;
  isMounted: boolean;
  isLoading: boolean;
  isSupabaseMode: boolean;

  // Single active playing video state (prevents TikTok overload-protect)
  activePlayingVideoId: string | null;
  setActivePlayingVideoId: (id: string | null) => void;

  // Setters
  setActiveTopicId: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;

  // Topic actions
  addTopic: (name: string, color?: string) => Promise<void>;
  editTopic: (id: string, name: string, color?: string) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;

  // Video actions
  addVideo: (data: Omit<VideoItem, 'id' | 'createdAt'>) => Promise<void>;
  editVideo: (id: string, data: Partial<VideoItem>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseMode, setIsSupabaseMode] = useState<boolean>(isSupabaseConfigured);

  // Single active player tracking: prevents simultaneous iframe loads which triggers TikTok rate limits
  const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false);
  const [detailVideo, setDetailVideo] = useState<VideoItem | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  // Initial load: from Supabase if configured, else fallback to localStorage
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);

      if (isSupabaseConfigured) {
        try {
          const [dbTopics, dbVideos] = await Promise.all([
            fetchTopicsFromSupabase(),
            fetchVideosFromSupabase(),
          ]);

          setTopics(dbTopics);
          setVideos(dbVideos);
          setIsSupabaseMode(true);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.warn('Could not load from Supabase, falling back to local data:', errorMessage);
          showToast('Chưa kết nối được bảng Supabase, đang dùng dữ liệu dự phòng.', 'info');
          setTopics(getStoredTopics());
          setVideos(getStoredVideos());
          setIsSupabaseMode(false);
        }
      } else {
        setTopics(getStoredTopics());
        setVideos(getStoredVideos());
        setIsSupabaseMode(false);
      }

      setIsMounted(true);
      setIsLoading(false);
    }

    loadInitialData();
  }, [showToast]);

  // Sync to localStorage as fallback whenever state changes (if not in Supabase mode)
  useEffect(() => {
    if (isMounted && !isSupabaseMode) {
      saveStoredTopics(topics);
      saveStoredVideos(videos);
    }
  }, [topics, videos, isMounted, isSupabaseMode]);

  // ================= TOPIC OPERATIONS =================
  const addTopic = async (name: string, color?: string) => {
    if (!name.trim()) return;

    if (isSupabaseMode) {
      try {
        const newTopic = await createTopicInSupabase(name.trim(), color);
        setTopics((prev) => [...prev, newTopic]);
        showToast(`Đã tạo chủ đề "${newTopic.name}" trên Supabase`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi thêm chủ đề lên Supabase', 'error');
      }
    } else {
      const newTopic: Topic = {
        id: `top-${Date.now()}`,
        name: name.trim(),
        color: color || '#25F4EE',
        createdAt: Date.now(),
      };
      setTopics((prev) => [...prev, newTopic]);
      showToast(`Đã tạo chủ đề "${newTopic.name}" (Local)`, 'success');
    }
  };

  const editTopic = async (id: string, name: string, color?: string) => {
    if (!name.trim()) return;

    if (isSupabaseMode) {
      try {
        const updated = await updateTopicInSupabase(id, name.trim(), color);
        setTopics((prev) => prev.map((t) => (t.id === id ? updated : t)));
        showToast(`Đã cập nhật chủ đề trên Supabase`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi cập nhật chủ đề trên Supabase', 'error');
      }
    } else {
      setTopics((prev) =>
        prev.map((t) => (t.id === id ? { ...t, name: name.trim(), color: color || t.color } : t))
      );
      showToast(`Đã cập nhật chủ đề (Local)`, 'success');
    }
  };

  const deleteTopic = async (id: string) => {
    const topicToDelete = topics.find((t) => t.id === id);
    if (!topicToDelete) return;

    if (isSupabaseMode) {
      try {
        await deleteTopicInSupabase(id);
        setTopics((prev) => prev.filter((t) => t.id !== id));
        if (activeTopicId === id) setActiveTopicId('all');
        showToast(`Đã xóa chủ đề "${topicToDelete.name}" trên Supabase`, 'info');
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi xóa chủ đề trên Supabase', 'error');
      }
    } else {
      setTopics((prev) => prev.filter((t) => t.id !== id));
      if (activeTopicId === id) setActiveTopicId('all');
      showToast(`Đã xóa chủ đề "${topicToDelete.name}" (Local)`, 'info');
    }
  };

  // ================= VIDEO OPERATIONS =================
  const addVideo = async (data: Omit<VideoItem, 'id' | 'createdAt'>) => {
    if (isSupabaseMode) {
      try {
        const newVideo = await createVideoInSupabase(data);
        setVideos((prev) => [newVideo, ...prev]);
        setActivePlayingVideoId(newVideo.id);
        showToast(`Đã lưu video thành công lên Supabase!`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi lưu video lên Supabase', 'error');
      }
    } else {
      const newVideo: VideoItem = {
        ...data,
        id: `vid-${Date.now()}`,
        createdAt: Date.now(),
      };
      setVideos((prev) => [newVideo, ...prev]);
      setActivePlayingVideoId(newVideo.id);
      showToast(`Đã lưu video thành công (Local)!`, 'success');
    }
  };

  const editVideo = async (id: string, data: Partial<VideoItem>) => {
    if (isSupabaseMode) {
      try {
        const updated = await updateVideoInSupabase(id, data);
        setVideos((prev) => prev.map((v) => (v.id === id ? updated : v)));
        showToast(`Đã cập nhật video trên Supabase!`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi cập nhật video trên Supabase', 'error');
      }
    } else {
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...data } : v))
      );
      showToast(`Đã cập nhật video!`, 'success');
    }
  };

  const deleteVideo = async (id: string) => {
    if (isSupabaseMode) {
      try {
        await deleteVideoInSupabase(id);
        setVideos((prev) => prev.filter((v) => v.id !== id));
        if (detailVideo?.id === id) setDetailVideo(null);
        if (activePlayingVideoId === id) setActivePlayingVideoId(null);
        showToast(`Đã xóa video trên Supabase!`, 'info');
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi xóa video trên Supabase', 'error');
      }
    } else {
      setVideos((prev) => prev.filter((v) => v.id !== id));
      if (detailVideo?.id === id) setDetailVideo(null);
      if (activePlayingVideoId === id) setActivePlayingVideoId(null);
      showToast(`Đã xóa video!`, 'info');
    }
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
        isLoading,
        isSupabaseMode,
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
