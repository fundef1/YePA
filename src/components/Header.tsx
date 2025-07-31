import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

type HeaderProps = {
  isColorful: boolean;
};

export function Header({ isColorful }: HeaderProps) {
  return (
    <header className="flex flex-col items-center justify-center space-y-2 text-center">
      <div className="flex items-center space-x-3">
        <BookOpen className={cn(
          "h-12 w-12 transition-all duration-500",
          isColorful ? "text-sky-500" : "text-foreground"
        )} />
        <h1 className="text-4xl font-bold tracking-tighter">
          YeAP
        </h1>
      </div>
      <p className={cn(
        "text-lg transition-all duration-500",
        isColorful ? "text-sky-400 drop-shadow-md" : "text-muted-foreground"
      )}>
        Yet ePUB Processor Another
      </p>
    </header>
  );
}