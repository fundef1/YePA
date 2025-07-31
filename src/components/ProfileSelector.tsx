import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Template {
  name: string;
  description: string;
}

interface ProfileSelectorProps {
  templates: Template[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  templates,
  selectedValue,
  onValueChange,
  disabled,
}) => {
  return (
    <TooltipProvider>
      <RadioGroup
        value={selectedValue}
        onValueChange={onValueChange}
        disabled={disabled}
        className="flex justify-center flex-wrap gap-4 pt-2"
      >
        {templates.map((template) => {
          const imageName = template.name.toLowerCase().split(' ')[0];
          return (
            <Tooltip key={template.name} delayDuration={200}>
              <TooltipTrigger asChild>
                <Label
                  className={`
                    flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 h-full w-32
                    hover:bg-accent hover:text-accent-foreground transition-colors
                    ${selectedValue === template.name ? "border-primary" : "border-muted"}
                    ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  `}
                >
                  <RadioGroupItem value={template.name} className="sr-only" />
                  <img
                    src={`/${imageName}.png`}
                    alt={template.name}
                    className="mb-3 h-20 w-20 object-contain bg-gray-200 dark:bg-gray-700 rounded-md"
                  />
                  <span className="text-center text-sm font-medium leading-tight">{template.name}</span>
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>{template.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </RadioGroup>
    </TooltipProvider>
  );
};