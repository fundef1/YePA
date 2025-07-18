import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isColorful: boolean;
}

export const Header = ({ isColorful }: HeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-2">
        <BookOpen className={cn(
          "w-10 h-10 transition-all duration-500",
          isColorful ? "text-pink-400 drop-shadow-lg" : "text-gray-800 dark:text-gray-200"
        )} />
        <h1 className={cn(
          "text-5xl font-bold tracking-tight transition-all duration-500",
          isColorful 
            ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 drop-shadow-lg" 
            : "text-gray-800 dark:text-gray-200"
        )}>
          YePA
        </h1>
      </div>
      <p className={cn(
        "text-lg transition-all duration-500",
        isColorful ? "text-pink-400 drop-shadow-md" : "text-muted-foreground"
      )}>
        Yet <span className="font-semibold">ePUB</span> Another Processor
      </p>
    </div>
  );
};