"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  selectedProfile: string;
}

export const Header: React.FC<HeaderProps> = ({ selectedProfile }) => {
  const [isColorful, setIsColorful] = useState(true);
  const [titleFilterValue, setTitleFilterValue] = useState('none');

  useEffect(() => {
    // When the "Remarkable" profile is selected, ensure the title remains visible and colorful.
    // The previous implementation likely applied a filter (e.g., opacity(0)) that made it disappear.
    if (selectedProfile === 'Remarkable') {
      setIsColorful(true); // Keep the colorful gradient text
      setTitleFilterValue('none'); // Remove any hiding filter
    } else {
      // For any other profile, default to colorful text with no filter.
      // If there were specific styles for other profiles, they would be handled here.
      setIsColorful(true);
      setTitleFilterValue('none');
    }
  }, [selectedProfile]);

  return (
    <header className="w-full py-6 flex justify-center items-center relative z-10">
      <div style={{ filter: titleFilterValue }}>
        <h1 className={cn(
          "text-5xl font-bold tracking-tight transition-all duration-500",
          isColorful
            ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300 drop-shadow-lg"
            : "text-gray-800 dark:text-gray-200",
        )}>
          YePA
        </h1>
      </div>
    </header>
  );
};