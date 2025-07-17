import React from 'react';
import { cn } from '@/lib/utils';

export const AnimatedGradientBackground = ({ className, isGrayscale }: { className?: string; isGrayscale?: boolean }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 -z-10 animate-gradient-bg bg-[length:200%_200%]',
        'bg-[linear-gradient(-45deg,#a855f7,#f472b6,#3b82f6,#22d3ee)]',
        'dark:bg-[linear-gradient(-45deg,#3b0764,#7c1f4b,#1e3a8a,#0e7490)]',
        'transition-all duration-700 ease-in-out', // Smooth transition for the effect
        { 'grayscale': isGrayscale },
        className
      )}
    />
  );
};