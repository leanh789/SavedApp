'use client';

import React, { useState } from 'react';
import { useCurator } from '@/context/CuratorContext';
import { Button } from '../ui/Button';
import { X, Plus, Edit2, Trash2, Check, FolderCog, Tag } from 'lucide-react';

const PRESET_COLORS = [
  '#25F4EE', // TikTok Cyan
  '#FE2C55', // TikTok Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#EC4899', // Pink
];

export const ManageTopicsModal: React.FC = () => {
  const {
    isTopicsModalOpen,
    closeTopicsModal,
    topics,
    videos,
    addTopic,
    editTopic,
    deleteTopic,
    showToast,
  } = useCurator();

  const [newTopicName, setNewTopicName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  // Editing state for specific topic
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isTopicsModalOpen) return null;

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) {
      showToast('Vui lòng nhập tên chủ đề', 'error');
      return;
    }
    addTopic(newTopicName.trim(), selectedColor);
    setNewTopicName('');
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    editTopic(id, editName.trim());
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    const videoCount = videos.filter((v) => v.topicId === id).length;
    let msg = `Bạn có chắc muốn xóa chủ đề "${name}"?`;
    if (videoCount > 0) {
      msg += ` Có ${videoCount} video đang thuộc chủ đề này.`;
    }
    if (confirm(msg)) {
      deleteTopic(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0e1017] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-[#12141e]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-tiktok-cyan/10 text-tiktok-cyan border border-tiktok-cyan/20">
              <FolderCog size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Quản lý Chủ đề</h2>
              <p className="text-xs text-gray-400">Tổ chức video theo các chuyên mục</p>
            </div>
          </div>
          <button
            onClick={closeTopicsModal}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Create New Topic Form */}
          <form
            onSubmit={handleCreateTopic}
            className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3"
          >
            <span className="text-xs font-semibold text-gray-300 block">
              + Tạo chủ đề mới
            </span>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Tên chủ đề (ví dụ: Học Tiếng Anh)..."
                className="flex-1 px-3 py-2 bg-[#090a0f] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tiktok-cyan transition"
              />
              <Button variant="primary" size="sm" type="submit" className="shrink-0">
                <Plus size={14} /> Thêm
              </Button>
            </div>

            {/* Color picker presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-gray-400">Màu tag:</span>
              <div className="flex items-center gap-1.5">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      selectedColor === col ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </form>

          {/* List of Existing Topics */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
              Danh sách chủ đề ({topics.length})
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
              {topics.map((t) => {
                const count = videos.filter((v) => v.topicId === t.id).length;
                const isEditing = editingId === t.id;

                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800/80 hover:border-gray-700 transition"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-black border border-tiktok-cyan/60 rounded-lg text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(t.id)}
                          className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: t.color || '#25F4EE' }}
                        />
                        <span className="text-sm font-medium text-gray-200">{t.name}</span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-gray-800 text-gray-400">
                          {count} video
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(t.id, t.name)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-tiktok-cyan hover:bg-gray-800 transition"
                          title="Đổi tên"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Xóa chủ đề"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#12141e] flex justify-end">
          <Button variant="secondary" size="sm" onClick={closeTopicsModal}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
