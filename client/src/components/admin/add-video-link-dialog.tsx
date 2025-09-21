import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Content } from "@shared/schema";

interface AddVideoLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Content | null;
  getCSRFToken: (token: string | null) => Promise<string | null>;
}

export function AddVideoLinkDialog({ open, onOpenChange, content, getCSRFToken }: AddVideoLinkDialogProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const csrfToken = await getCSRFToken(token);
      
      const response = await fetch("/api/contents/add-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": "Bearer " + token } : {}),
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          tmdbId: content.tmdbId,
          videoUrl: videoUrl
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add video link");
      }
      
      const data = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      
      toast({
        title: "Lien vidéo ajouté",
        description: "Le lien vidéo a été ajouté avec succès au contenu.",
      });
      
      onOpenChange(false);
      setVideoUrl("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le lien vidéo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un lien vidéo</DialogTitle>
          <DialogDescription>
            Ajouter un lien vidéo pour le contenu: {content?.title}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="videoUrl" className="text-right">
                URL de la vidéo
              </Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://example.com/video.mp4"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Ajout en cours..." : "Ajouter le lien"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}