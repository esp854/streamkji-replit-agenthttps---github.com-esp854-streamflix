import React from 'react';
import PlanFeatureGuard from './PlanFeatureGuard';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Download, 
  Star, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Lock
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  rating: number;
  isExclusive?: boolean;
  quality: 'SD' | 'HD' | '4K';
}

interface ContentWithPlanRestrictionsProps {
  content: ContentItem;
}

const ContentWithPlanRestrictions: React.FC<ContentWithPlanRestrictionsProps> = ({ content }) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img 
          src={content.thumbnail} 
          alt={content.title} 
          className="w-full h-48 object-cover"
        />
        {content.isExclusive && (
          <Badge className="absolute top-2 right-2 bg-purple-600">
            <Star className="w-3 h-3 mr-1" />
            Exclusif
          </Badge>
        )}
        <Badge className="absolute top-2 left-2 bg-black/70">
          {content.quality}
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span>{content.title}</span>
          <span className="text-lg font-bold text-yellow-500 flex items-center">
            <Star className="w-4 h-4 fill-current mr-1" />
            {content.rating}
          </span>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {content.duration}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {content.description}
        </p>
        
        {/* Download button with plan restriction */}
        <PlanFeatureGuard 
          feature="download" 
          fallback={
            <Button variant="outline" disabled className="w-full mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Téléchargement (Plan requis)
            </Button>
          }
        >
          <Button className="w-full mb-2 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Télécharger
          </Button>
        </PlanFeatureGuard>
        
        {/* Exclusive content restriction */}
        {content.isExclusive ? (
          <PlanFeatureGuard 
            feature="exclusive"
            fallback={
              <Button variant="outline" disabled className="w-full flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contenu exclusif (Plan Premium/VIP requis)
              </Button>
            }
          >
            <Button className="w-full flex items-center gap-2">
              <Star className="w-4 h-4" />
              Regarder le contenu exclusif
            </Button>
          </PlanFeatureGuard>
        ) : (
          <Button className="w-full flex items-center gap-2">
            Regarder maintenant
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentWithPlanRestrictions;