import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts TikTok numeric video ID from various TikTok URL patterns:
 * e.g., https://www.tiktok.com/@username/video/7272898779944602922
 * or shortlinks / mobile shares
 */
export function extractTikTokVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern: /video/7272898779944602922
  const match = trimmed.match(/\/video\/(\d+)/);
  if (match && match[1]) return match[1];

  // Pattern: /v/7272898779944602922
  const vMatch = trimmed.match(/\/v\/(\d+)/);
  if (vMatch && vMatch[1]) return vMatch[1];

  // Generic 15-22 consecutive digits often used as TikTok item IDs
  const genericIdMatch = trimmed.match(/(\d{15,22})/);
  if (genericIdMatch && genericIdMatch[1]) return genericIdMatch[1];

  return null;
}

export function extractTikTokUsername(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/@([a-zA-Z0-9_.-]+)/);
  return match && match[1] ? `@${match[1]}` : null;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
