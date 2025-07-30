import { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { useProfile } from '@/hooks/useProfile'; // Assuming a custom hook provides the profile

export const Header = () => {
  const { profile } = useProfile(); // e.g., 'NST', 'Kobo', 'Remarkable'

  const titleFilterValue = useMemo(() => {
    switch (profile) {
      case 'NST':
        return 'url(#nst-filter)';
      case 'Kobo':
        return 'url(#kobo-filter)';
      case 'Remarkable':
        return 'url(#remarkable-filter)'; // FIX: Apply the new subtle filter
      default:
        return 'none';
    }
  }, [profile]);

  const isColorful = useMemo(() => {
    return profile !== 'Pass-Through';
  }, [profile]);

  return (
    <header>
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="nst-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="1" result="turbulence" />
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="25" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="kobo-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.04" numOctaves="1" result="turbulence" />
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="15" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* ADDED: New subtle filter for the Remarkable profile */}
          <filter id="remarkable-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.08 0.08" numOctaves="1" result="turbulence" />
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="7" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className="text-center mb-8">
        <div style={{ filter: titleFilterValue }}>
          <h1 className={cn(
            "text-5xl font-bold tracking-tight transition-all duration-500",
            isColorful 
              ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300 drop-shadow-lg" 
              : "text-gray-800 dark:text-gray-200"
          )}>
            YePA
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Your ePaper Assistant
        </p>
      </div>
    </header>
  );
};