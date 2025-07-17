import { BookOpen } from 'lucide-react';

export const Header = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-2">
        <BookOpen className="w-10 h-10 text-primary" />
        <h1 className="text-5xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
          YePA
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">
        Yet <span className="font-semibold">ePUB</span> Another Processor
      </p>
    </div>
  );
};