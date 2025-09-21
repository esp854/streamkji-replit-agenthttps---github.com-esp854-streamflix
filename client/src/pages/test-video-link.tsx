import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AddVideoLinkDialog } from "@/components/admin/add-video-link-dialog";
import type { Content } from "@shared/schema";

export default function TestVideoLink() {
  const [content, setContent] = useState<Content | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [tmdbId, setTmdbId] = useState("");
  const { toast } = useToast();

  // Mock getCSRFToken function for testing
  const getCSRFToken = async (token: string | null): Promise<string | null> => {
    try {
      const response = await fetch("/api/csrf-token", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch CSRF token");
      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return null;
    }
  };

  const loadContent = async () => {
    if (!tmdbId) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/contents/tmdb/${tmdbId}`, {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load content");
      }
      
      const data = await response.json();
      setContent(data);
      
      toast({
        title: "Contenu chargé",
        description: "Le contenu a été chargé avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger le contenu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test d'ajout de lien vidéo</CardTitle>
          <CardDescription>
            Tester la fonctionnalité d'ajout de lien vidéo à un contenu existant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="tmdbId">TMDB ID</Label>
              <Input
                id="tmdbId"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                placeholder="Entrez un ID TMDB"
              />
            </div>
            <Button onClick={loadContent} className="self-end">
              Charger le contenu
            </Button>
          </div>
          
          {content && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-medium">{content.title}</h3>
              <p className="text-sm text-muted-foreground">
                TMDB ID: {content.tmdbId}
              </p>
              <Button onClick={() => setShowDialog(true)}>
                Ajouter un lien vidéo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddVideoLinkDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        content={content}
        getCSRFToken={getCSRFToken}
      />
    </div>
  );
}