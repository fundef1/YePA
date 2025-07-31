import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface HeaderProps {
  isColorful: boolean;
  maxWidth: number;
  maxHeight: number;
}

export const Header = ({ isColorful, maxWidth, maxHeight }: HeaderProps) => {
  const headerFilterId = "pixelate-filter-header";

  const pixelationAmount = useMemo(() => {
    if (maxWidth === 0 || maxHeight === 0) {
      return { width: 0, height: 0 };
    }
    // Calculate pixelation for the title at half strength
    const width = (3600 / maxWidth) / 2;
    const height = (6400 / maxHeight) / 2;
    return { width, height };
  }, [maxWidth, maxHeight]);

  const { width: titlePixelWidth, height: titlePixelHeight } = pixelationAmount;
  const shouldUsePixelateFilter = titlePixelWidth > 0 && titlePixelHeight > 0;

  const titleFilterValue = shouldUsePixelateFilter ? `url(#${headerFilterId})` : 'none';

  return (
    <div className="text-center mb-8">
      {/* Define the SVG filter specifically for the header */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {shouldUsePixelateFilter && (
            <filter id={headerFilterId}>
              <feFlood x={titlePixelWidth / 2} y={titlePixelHeight / 2} height="1" width="1" />
              <feComposite width={titlePixelWidth} height={titlePixelHeight} />
              <feTile result="a" />
              <feComposite in="SourceGraphic" in2="a" operator="in" />
              <feMorphology operator="dilate" radius={`${titlePixelWidth / 2} ${titlePixelHeight / 2}`} />
            </filter>
          )}
        </defs>
      </svg>

      <div className="flex items-center justify-center gap-3 mb-2">
        <BookOpen className={cn(
          "w-10 h-10 transition-all duration-500",
          isColorful ? "text-sky-400 drop-shadow-lg" : "text-gray-800 dark:text-gray-200"
        )} />
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
      </div>
      <p className={cn(
        "text-lg transition-all duration-500",
        isColorful ? "text-sky-400 drop-shadow-md" : "text-muted-foreground"
      )}>
        Yet <span className="font-semibold">ePUB</span> Processor Another
      </p>
    </div>
  );
};