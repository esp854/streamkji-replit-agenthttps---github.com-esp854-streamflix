import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video.movie' | 'video.tv_show';
  keywords?: string[];
  noIndex?: boolean;
}

export const useSEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  noIndex = false
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description);
      updateMetaTag('twitter:description', description);
    }

    // Update Open Graph tags
    if (title) {
      updateMetaTag('og:title', title);
      updateMetaTag('twitter:title', title);
    }

    if (image) {
      updateMetaTag('og:image', image);
      updateMetaTag('twitter:image', image);
    }

    if (url) {
      updateMetaTag('og:url', url);
    }

    if (type) {
      updateMetaTag('og:type', type);
    }

    // Update keywords
    if (keywords && keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // Update robots
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    }

    // Cleanup function to reset to default values when component unmounts
    return () => {
      // Reset title to default
      document.title = 'StreamFlix - Streaming de Films et Séries en VF | Regarder Gratuitement';

      // Reset meta tags to defaults
      updateMetaTag('description', 'Découvrez StreamFlix, votre plateforme de streaming gratuite. Regardez des milliers de films et séries en version française (VF) en HD. Films récents, classiques, séries populaires - tout est disponible gratuitement.');
      updateMetaTag('og:title', 'StreamFlix - Streaming Gratuit de Films et Séries en VF');
      updateMetaTag('og:description', 'Regardez des milliers de films et séries en version française gratuitement. HD, sans inscription, streaming illimité.');
      updateMetaTag('og:type', 'website');
      updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    };
  }, [title, description, image, url, type, keywords, noIndex]);
};

const updateMetaTag = (name: string, content: string) => {
  let metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!metaTag) {
    metaTag = document.querySelector(`meta[property="${name}"]`) as HTMLMetaElement;
  }

  if (metaTag) {
    metaTag.content = content;
  } else {
    // Create new meta tag if it doesn't exist
    const newMetaTag = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      newMetaTag.setAttribute('property', name);
    } else {
      newMetaTag.setAttribute('name', name);
    }
    newMetaTag.content = content;
    document.head.appendChild(newMetaTag);
  }
};

// Utility function to generate SEO data for content
export const generateContentSEO = (content: any, type: 'movie' | 'tv') => {
  const baseUrl = window.location.origin;
  const contentUrl = `${baseUrl}/${type === 'movie' ? 'films' : 'series'}/${content.id}`;

  const title = `${content.title} - Regarder en Streaming VF Gratuit | StreamFlix`;
  const description = content.description
    ? `${content.description.substring(0, 155)}... Regardez ${content.title} en streaming gratuit sur StreamFlix.`
    : `Regardez ${content.title} en streaming VF gratuit. Films et séries en haute qualité sur StreamFlix.`;

  const image = content.posterPath
    ? `https://image.tmdb.org/t/p/w500${content.posterPath}`
    : `${baseUrl}/og-image.jpg`;

  const keywords = [
    content.title,
    type === 'movie' ? 'film' : 'série',
    'streaming',
    'VF',
    'gratuit',
    'HD',
    'regarder',
    'StreamFlix'
  ];

  if (content.genres) {
    keywords.push(...content.genres.map((g: any) => g.name || g));
  }

  return {
    title,
    description,
    image,
    url: contentUrl,
    type: type === 'movie' ? 'video.movie' : 'video.tv_show',
    keywords
  };
};