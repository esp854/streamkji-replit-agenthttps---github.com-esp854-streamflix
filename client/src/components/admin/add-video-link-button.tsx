import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Content } from "@shared/schema";

interface AddVideoLinkButtonProps {
  content: Content;
  onAddVideoLink: (content: Content) => void;
}

export function AddVideoLinkButton({ content, onAddVideoLink }: AddVideoLinkButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => onAddVideoLink(content)}
      className="flex items-center gap-2"
    >
      <Plus className="h-4 w-4" />
      Ajouter lien vidéo
    </Button>
  );
}