import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplateSelectProps {
  onTemplateChange: (template: string) => void;
  disabled: boolean;
}

export const TemplateSelect = ({ onTemplateChange, disabled }: TemplateSelectProps) => {
  return (
    <Select onValueChange={onTemplateChange} disabled={disabled}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a template" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="nst">NST</SelectItem>
        <SelectItem value="nst-g">NST/G</SelectItem>
      </SelectContent>
    </Select>
  );
};