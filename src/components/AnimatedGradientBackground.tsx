import React from 'react';
import { cn } from '@/lib/utils';

export const AnimatedGradientBackground = ({ className, isGrayscale }: { className?: string; isGrayscale?: boolean }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 -z-20 animate-gradient-bg bg-[length:200%_200%]',
        'bg-[linear-gradient(-45deg,#3b82f6,#60a5fa,#38bdf8,#22d3ee)]',
        'dark:bg-[linear-gradient(-45deg,#1e3a8a,#1d4ed8,#155e75,#164e63)]',
        'transition-all duration-700 ease-in-out', // Smooth transition for the effect
        { 'grayscale': isGrayscale },
        className
      )}
    />
  );
};