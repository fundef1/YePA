import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { templates } from "@/lib/templates"

type ProfileSelectorProps = {
  selectedProfile: string;
  onProfileChange: (id: string) => void;
};

export function ProfileSelector({ selectedProfile, onProfileChange }: ProfileSelectorProps) {
  return (
    <RadioGroup value={selectedProfile} onValueChange={onProfileChange} className="space-y-3">
      {templates.map((template) => (
        <Label 
          key={template.id} 
          htmlFor={template.id} 
          className="flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary"
        >
          <img 
            src={template.image} 
            alt={template.name} 
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div className="flex-grow">
            <p className="font-semibold text-base">{template.name}</p>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
          <RadioGroupItem value={template.id} id={template.id} />
        </Label>
      ))}
    </RadioGroup>
  )
}