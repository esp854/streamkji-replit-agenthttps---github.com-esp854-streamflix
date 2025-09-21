import { useToast } from "@/hooks/use-toast";
import type { TMDBMovie, TMDBTVSeries } from "@/types/movie";

export function useShare() {
  const { toast } = useToast();

  const shareContent = async (content: TMDBMovie | TMDBTVSeries, type: 'movie' | 'tv') => {
    const isMovie = type === 'movie';
    const title = isMovie ? (content as TMDBMovie).title : (content as TMDBTVSeries).name;
    const url = `${window.location.origin}/${type}/${content.id}`;
    const shareData = {
      title: `${title} - StreamFlix`,
      text: `Découvrez ${title} sur StreamFlix !`,
      url: url,
    };

    try {
      // Try native share API first (available on mobile and some desktop browsers)
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Partagé avec succès",
          description: `${title} a été partagé.`,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast({
          title: "Lien copié",
          description: `Le lien vers ${title} a été copié dans le presse-papiers.`,
        });
      }
    } catch (error) {
      // If both methods fail, show an error
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Error sharing content:", error);
        toast({
          title: "Erreur de partage",
          description: "Impossible de partager ce contenu.",
          variant: "destructive",
        });
      }
    }
  };

  const shareCurrentPage = async (title?: string) => {
    const shareData = {
      title: title ? `${title} - StreamFlix` : "StreamFlix",
      text: title ? `Découvrez ${title} sur StreamFlix !` : "Découvrez StreamFlix !",
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Partagé avec succès",
          description: "La page a été partagée.",
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Lien copié",
          description: "Le lien de la page a été copié dans le presse-papiers.",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Error sharing page:", error);
        toast({
          title: "Erreur de partage",
          description: "Impossible de partager cette page.",
          variant: "destructive",
        });
      }
    }
  };

  return {
    shareContent,
    shareCurrentPage,
  };
}