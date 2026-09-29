'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Video, Play, Pause, RotateCw, Music2, AlertCircle } from 'lucide-react';
import { extractTikTokUsername } from '@/lib/utils';

interface Props {
  url: string;
  videoId: string;
  title?: string;
  topicName?: string;
  topicColor?: string;
  isPlaying?: boolean;
  size?: 'normal' | 'large';
  onPlay?: () => void;
  onStop?: () => void;
}

export const TikTokEmbed: React.FC<Props> = ({
  url,
  videoId,
  title,
  topicName,
  topicColor = '#FE2C55',
  isPlaying = true,
  size = 'normal',
  onPlay,
  onStop,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);
  const username = extractTikTokUsername(url);

  const isLarge = size === 'large';
  const containerMaxWidth = isLarge ? 'max-w-[460px] sm:max-w-[500px]' : 'max-w-[335px]';
  const iframeHeight = isLarge ? 'h-[620px] sm:h-[680px]' : 'h-[520px]';
  const posterHeight = isLarge ? 'h-[580px] sm:h-[640px]' : 'h-[490px]';

  // If iframe takes more than 7 seconds to load, show a helpful fallback link
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      setIsLoading(true);
      setHasTimedOut(false);
      timer = setTimeout(() => {
        setIsLoading(false);
        setHasTimedOut(true);
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, iframeKey]);

  if (!videoId) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-center text-sm text-gray-400 bg-gray-900/60 rounded-2xl border border-gray-800 my-4 w-full ${containerMaxWidth}`}>
        <Video size={28} className="text-gray-500 mb-2" />
        <p className="font-medium text-gray-300">Không tìm thấy Video ID</p>
        <p className="text-xs text-gray-500 mt-1">Đường dẫn không hợp lệ hoặc không có ID video</p>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-tiktok-pink hover:underline"
          >
            Mở trực tiếp trên TikTok <ExternalLink size={12} />
          </a>
        )}
      </div>
    );
  }

  // PREVIEW / POSTER MODE
  if (!isPlaying) {
    return (
      <div className={`w-full ${containerMaxWidth} ${posterHeight} rounded-3xl bg-gradient-to-b from-[#141724] via-[#0d0f17] to-[#08090e] border border-gray-800/90 flex flex-col justify-between p-6 relative overflow-hidden group shadow-2xl select-none`}>
        {/* Ambient glow effect */}
        <div
          className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: topicColor }}
        />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full blur-3xl opacity-15 pointer-events-none bg-tiktok-cyan" />

        {/* Top Header of Poster */}
        <div className="z-10 flex items-center justify-between">
          <span
            className="text-xs px-3 py-1 rounded-full font-semibold border"
            style={{
              borderColor: `${topicColor}40`,
              backgroundColor: `${topicColor}15`,
              color: topicColor,
            }}
          >
            #{topicName || 'TikTok'}
          </span>
          {username && (
            <span className="text-xs sm:text-sm font-medium text-gray-300 font-mono">
              {username}
            </span>
          )}
        </div>

        {/* Center: Play Trigger */}
        <div className="z-10 flex flex-col items-center justify-center my-auto text-center px-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            className={`${isLarge ? 'w-20 h-20' : 'w-16 h-16'} rounded-full bg-gradient-to-tr from-tiktok-cyan via-tiktok-pink to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-tiktok-pink/30 hover:scale-110 active:scale-95 transition-all duration-300 group-hover:brightness-110 mb-4`}
            title="Bấm để phát video"
          >
            <Play size={isLarge ? 34 : 28} className="fill-white translate-x-0.5" />
          </button>
          <span className={`${isLarge ? 'text-sm sm:text-base font-extrabold' : 'text-xs font-bold'} text-gray-100 group-hover:text-tiktok-cyan transition`}>
            Bấm để phát video
          </span>
          <span className="text-xs text-gray-500 mt-1">
            (Chế độ phát độc lập, bảo vệ máy chủ)
          </span>
        </div>

        {/* Bottom Details of Poster */}
        <div className="z-10 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5 truncate max-w-[240px]">
            <Music2 size={14} className="text-tiktok-cyan shrink-0 animate-bounce" />
            <span className="truncate text-xs text-gray-300">
              {title || 'TikTok Original Sound'}
            </span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 p-2 rounded-xl bg-gray-900 border border-gray-800 hover:text-white transition"
            title="Mở trên TikTok"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  }

  // ACTIVE PLAYER MODE
  return (
    <div className={`w-full flex flex-col items-center justify-center py-1 transition-all relative ${containerMaxWidth} mx-auto select-none`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 rounded-3xl border border-gray-800 z-10 ${iframeHeight}`}>
          <div className="w-10 h-10 rounded-full border-2 border-tiktok-cyan border-t-tiktok-pink animate-spin mb-3" />
          <span className="text-sm text-gray-200 font-semibold">Đang tải TikTok Player...</span>
          <span className="text-xs text-gray-400 mt-1">Kết nối trực tiếp máy chủ TikTok</span>
        </div>
      )}

      {/* Direct Iframe Player with responsive sizing and no-referrer */}
      <iframe
        key={iframeKey}
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        className={`w-full ${iframeHeight} rounded-3xl border border-gray-800/90 bg-black shadow-2xl`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="no-referrer"
        loading="lazy"
        title={`TikTok Video ${videoId}`}
        onLoad={() => {
          setIsLoading(false);
          setHasTimedOut(false);
        }}
      />

      {/* Helpful Fallback banner if loading takes too long */}
      {hasTimedOut && (
        <div className="w-full mt-2 p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-gray-300 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-1.5 text-amber-400">
            <AlertCircle size={14} className="shrink-0" />
            <span>Nếu video bị chậm:</span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 font-bold text-tiktok-pink hover:underline flex items-center gap-1"
          >
            Mở xem trực tiếp <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Controls Bar under Active Video */}
      <div className="w-full flex items-center justify-between mt-2.5 px-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          {onStop && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStop();
              }}
              className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 hover:text-white flex items-center gap-1 transition"
              title="Tạm dừng và đóng player"
            >
              <Pause size={12} /> Đóng player
            </button>
          )}
          <button
            onClick={() => {
              setIsLoading(true);
              setHasTimedOut(false);
              setIframeKey((prev) => prev + 1);
            }}
            className="hover:text-tiktok-cyan transition flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-800/60"
            title="Tải lại iframe"
          >
            <RotateCw size={12} /> Tải lại
          </button>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs hover:text-tiktok-pink transition font-semibold"
        >
          <span>Mở TikTok</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};
