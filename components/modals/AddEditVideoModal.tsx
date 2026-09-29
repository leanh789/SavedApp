'use client';

import React, { useState, useEffect } from 'react';
import { useCurator } from '@/context/CuratorContext';
import { extractTikTokVideoId } from '@/lib/utils';
import { Button } from '../ui/Button';
import { X, CheckCircle2, AlertCircle, Link, Type, Tag, FileText } from 'lucide-react';

export const AddEditVideoModal: React.FC = () => {
  const {
    isAddEditModalOpen,
    editingVideo,
    closeAddEditModal,
    topics,
    addVideo,
    editVideo,
    showToast,
  } = useCurator();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');
  const [notes, setNotes] = useState('');
  const [detectedId, setDetectedId] = useState<string | null>(null);

  // Sync state when modal opens or editingVideo changes
  useEffect(() => {
    if (editingVideo) {
      setUrl(editingVideo.url);
      setTitle(editingVideo.title);
      setTopicId(editingVideo.topicId);
      setNotes(editingVideo.notes);
      setDetectedId(editingVideo.videoId);
    } else {
      setUrl('');
      setTitle('');
      setTopicId(topics[0]?.id || '');
      setNotes('');
      setDetectedId(null);
    }
  }, [editingVideo, isAddEditModalOpen, topics]);

  // Live video ID detection when url changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    const id = extractTikTokVideoId(val);
    setDetectedId(id);
  };

  if (!isAddEditModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      showToast('Vui lòng nhập đường dẫn video TikTok', 'error');
      return;
    }

    const videoId = detectedId || extractTikTokVideoId(url);
    if (!videoId) {
      showToast('Không tìm thấy Video ID hợp lệ trong liên kết này', 'error');
      return;
    }

    if (!title.trim()) {
      showToast('Vui lòng nhập tiêu đề cho video', 'error');
      return;
    }

    if (editingVideo) {
      editVideo(editingVideo.id, {
        url: url.trim(),
        videoId,
        title: title.trim(),
        topicId: topicId || topics[0]?.id || 'general',
        notes: notes.trim(),
      });
    } else {
      addVideo({
        url: url.trim(),
        videoId,
        title: title.trim(),
        topicId: topicId || topics[0]?.id || 'general',
        notes: notes.trim(),
      });
    }

    closeAddEditModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e1017] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-[#12141e]">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingVideo ? 'Chỉnh sửa Video TikTok' : 'Thêm Video TikTok Mới'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Dán liên kết TikTok để tự động trích xuất và lưu trữ
            </p>
          </div>
          <button
            onClick={closeAddEditModal}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* TikTok URL */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-1.5">
              <Link size={14} className="text-tiktok-cyan" />
              <span>Đường dẫn TikTok (URL) *</span>
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={handleUrlChange}
              placeholder="https://www.tiktok.com/@username/video/7272898779944602922"
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-tiktok-cyan focus:ring-1 focus:ring-tiktok-cyan transition"
            />
            {/* Status of ID extraction */}
            {url.trim() && (
              <div className="mt-1.5 text-xs flex items-center gap-1.5">
                {detectedId ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 size={13} /> Nhận diện Video ID: {detectedId}
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertCircle size={13} /> Chưa nhận diện được ID TikTok trong liên kết
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-1.5">
              <Type size={14} className="text-tiktok-pink" />
              <span>Tiêu đề mô tả *</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Bí kíp học Prompt Engineering nhanh..."
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-tiktok-pink focus:ring-1 focus:ring-tiktok-pink transition"
            />
          </div>

          {/* Topic Selector */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-1.5">
              <Tag size={14} className="text-tiktok-cyan" />
              <span>Chủ đề (Topic)</span>
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-tiktok-cyan transition cursor-pointer"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-1.5">
              <FileText size={14} className="text-amber-400" />
              <span>Ghi chú & Tóm tắt kiến thức (Bullet points / Markdown)</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="• Điểm quan trọng 1&#10;• Điểm quan trọng 2&#10;• Bí quyết cần nhớ..."
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-tiktok-cyan transition leading-relaxed font-sans"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-3">
            <Button variant="secondary" size="md" type="button" onClick={closeAddEditModal}>
              Hủy
            </Button>
            <Button variant="primary" size="md" type="submit">
              {editingVideo ? 'Lưu thay đổi' : 'Lưu Video'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
