'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'cyan';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  const variants = {
    primary:
      'bg-gradient-to-r from-tiktok-cyan via-[#56d8e8] to-tiktok-pink text-black font-semibold shadow-md shadow-tiktok-pink/20 hover:shadow-tiktok-cyan/30 hover:brightness-110',
    secondary:
      'bg-[#1e2029] text-gray-200 border border-gray-700/60 hover:bg-[#282b37] hover:text-white',
    outline:
      'bg-transparent border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white',
    ghost:
      'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    danger:
      'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white',
    cyan:
      'bg-tiktok-cyan/20 text-tiktok-cyan border border-tiktok-cyan/30 hover:bg-tiktok-cyan hover:text-black',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2 text-sm',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
