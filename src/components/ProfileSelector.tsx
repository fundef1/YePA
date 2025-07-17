import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Template {
  name: string;
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
    <RadioGroup
      value={selectedValue}
      onValueChange={onValueChange}
      disabled={disabled}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
    >
      {templates.map((template) => {
        const imageName = template.name.toLowerCase().split(' ')[0];
        return (
          <div key={template.name}>
            <RadioGroupItem value={template.name} id={template.name} className="sr-only" />
            <Label
              htmlFor={template.name}
              className={`
                flex flex-col items-center justify-center rounded-md border-2 bg-popover p-4 h-full
                hover:bg-accent hover:text-accent-foreground
                ${selectedValue === template.name ? "border-primary" : "border-muted"}
                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              `}
            >
              <img
                src={`/${imageName}.png`}
                alt={template.name}
                className="mb-3 h-20 w-20 object-contain bg-gray-200 dark:bg-gray-700 rounded-md"
              />
              <span className="text-center text-sm font-medium">{template.name}</span>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
};