"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  selectedProfileName: string;
  // Assuming other props like logo, subtitle, etc. are passed here
  // and their logic should remain unchanged as per your request.
}

export const Header: React.FC<HeaderProps> = ({ selectedProfileName }) => {
  // Determine if the title should have the gradient effect.
  // It should NOT have the gradient for "Remarkable", "NST", or "Kobo" profiles.
  const shouldTitleBeGradient = !["Remarkable", "NST", "Kobo"].includes(selectedProfileName);

  // Ensure the title's container always has no filter applied,
  // preventing it from disappearing due to an opacity filter.
  // This specifically targets the div wrapping the h1.
  const titleContainerFilter = 'none';

  return (
    <header className="relative w-full p-4 flex flex-col items-center justify-center">
      {/* Existing logic for logo and other elements remains unchanged */}

      {/* Title */}
      <div style={{ filter: titleContainerFilter }}>
        <h1 className={cn(
          "text-5xl font-bold tracking-tight transition-all duration-500",
          shouldTitleBeGradient
            ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300 drop-shadow-lg"
            : "text-black dark:text-white" // Keep it black (or default text color) for specified profiles
        )}>
          YePA
        </h1>
      </div>

      {/* Existing logic for subtitle and other elements remains unchanged */}
    </header>
  );
};