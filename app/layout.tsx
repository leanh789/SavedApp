import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TikTok Curator - Lưu trữ & Khám phá Video TikTok',
  description:
    'Ứng dụng hiện đại giúp lưu trữ, phân loại theo chủ đề, ghi chú kiến thức và xem video TikTok dưới dạng lưới (Grid) hoặc lướt dọc (Feed).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#090a0f] text-gray-100 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
