export interface Topic {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface VideoItem {
  id: string;
  url: string;
  videoId: string;
  title: string;
  topicId: string;
  notes: string;
  createdAt: number;
}

export type ViewMode = 'grid' | 'feed';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}
