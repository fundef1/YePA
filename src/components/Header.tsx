import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface HeaderProps {
  isColorful: boolean;
  maxWidth: number;
  maxHeight: number;
}

export const Header = ({ isColorful, maxWidth, maxHeight }: HeaderProps) => {
  const filterId = "pixelate-filter-advanced";

  const pixelationAmount = useMemo(() => {
    if (maxWidth === 0 || maxHeight === 0) {
      return { width: 0, height: 0 };
    }
    const width = 3600 / maxWidth;
    const height = 6400 / maxHeight;
    return { width, height };
  }, [maxWidth, maxHeight]);

  const { width: pixelWidth, height: pixelHeight } = pixelationAmount;
  const shouldUsePixelateFilter = pixelWidth > 0 && pixelHeight > 0;

  const titleFilterValue = shouldUsePixelateFilter ? `url(#${filterId})` : 'none';

  return (
    <div className="text-center mb-8">
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
        Yet <span className="font-semibold">ePUB</span> Another Processor
      </p>
    </div>
  );
};