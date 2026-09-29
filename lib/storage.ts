import { Topic, VideoItem } from '@/types';

const STORAGE_KEYS = {
  TOPICS: 'tiktok_curator_topics_v1',
  VIDEOS: 'tiktok_curator_videos_v1',
};

export const DEFAULT_TOPICS: Topic[] = [
  { id: 'top-1', name: 'Nấu ăn & Ẩm thực', color: '#FE2C55', createdAt: 1700000000000 },
  { id: 'top-2', name: 'Coding & AI', color: '#25F4EE', createdAt: 1700000010000 },
  { id: 'top-3', name: 'Thể thao & Gym', color: '#F59E0B', createdAt: 1700000020000 },
  { id: 'top-4', name: 'Du lịch & Khám phá', color: '#10B981', createdAt: 1700000030000 },
];

export const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    url: 'https://www.tiktok.com/@gordonramsayofficial/video/7036640523091971333',
    videoId: '7036640523091971333',
    title: 'Bí kíp làm món Bò Wellington Gordon Ramsay',
    topicId: 'top-1',
    notes: '• Áp chảo thịt bò thật nhanh để giữ nước ngọt.\n• Nấm băm nhỏ xào cạn nước (duxelles).\n• Cuộn chặt với prosciutto và bột ngàn lớp pastry.\n• Nướng ở nhiệt độ 200°C đến khi vàng giòn.',
    createdAt: 1700000040000,
  },
  {
    id: 'vid-2',
    url: 'https://www.tiktok.com/@fireship_dev/video/7272898779944602922',
    videoId: '7272898779944602922',
    title: '10 tính năng JavaScript mới trong 100s',
    topicId: 'top-2',
    notes: '• Object.groupBy() để phân nhóm mảng dễ dàng.\n• Array.prototype.toSorted() không làm thay đổi mảng gốc.\n• Promise.withResolvers() cực kỳ tiện lợi khi tạo promise thủ công.',
    createdAt: 1700000050000,
  },
  {
    id: 'vid-3',
    url: 'https://www.tiktok.com/@khaby.lame/video/6959223395898395910',
    videoId: '6959223395898395910',
    title: 'Giải pháp đơn giản hóa cuộc sống - Khaby Lame',
    topicId: 'top-3',
    notes: '• Đơn giản là đỉnh cao của sự tinh tế.\n• Khaby Lame phong cách không lời thoại nhưng cực hài hước.\n• Video đạt hàng chục triệu lượt thả tim.',
    createdAt: 1700000060000,
  },
];

export function getStoredTopics(): Topic[] {
  if (typeof window === 'undefined') return DEFAULT_TOPICS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOPICS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(DEFAULT_TOPICS));
      return DEFAULT_TOPICS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load topics from localStorage:', err);
    return DEFAULT_TOPICS;
  }
}

export function saveStoredTopics(topics: Topic[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  } catch (err) {
    console.error('Failed to save topics to localStorage:', err);
  }
}

export function getStoredVideos(): VideoItem[] {
  if (typeof window === 'undefined') return DEFAULT_VIDEOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(DEFAULT_VIDEOS));
      return DEFAULT_VIDEOS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load videos from localStorage:', err);
    return DEFAULT_VIDEOS;
  }
}

export function saveStoredVideos(videos: VideoItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  } catch (err) {
    console.error('Failed to save videos to localStorage:', err);
  }
}
