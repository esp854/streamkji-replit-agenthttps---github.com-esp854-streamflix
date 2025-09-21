import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronRight,
  Play,
  Heart,
  Share2,
  Settings,
  CreditCard,
  Shield,
  Monitor,
  Smartphone
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "Comment créer un compte ?",
    answer: "Pour créer un compte, cliquez sur le bouton 'S'inscrire' en haut à droite de la page. Remplissez le formulaire avec votre nom d'utilisateur, email et mot de passe. Vous recevrez un email de confirmation pour activer votre compte.",
    category: "Compte",
    tags: ["inscription", "compte", "email"]
  },
  {
    id: "2",
    question: "Comment ajouter des films à mes favoris ?",
    answer: "Pour ajouter un film à vos favoris, cliquez sur l'icône cœur (♥) sur la fiche du film ou dans la liste des films. Vous pouvez retrouver tous vos favoris dans la section 'Mes Favoris' de votre profil.",
    category: "Fonctionnalités",
    tags: ["favoris", "cœur", "films"]
  },
  {
    id: "3",
    question: "Comment partager un film avec mes amis ?",
    answer: "Cliquez sur l'icône de partage (📤) sur la page du film. Vous pouvez partager le lien via les réseaux sociaux ou copier le lien pour l'envoyer directement.",
    category: "Fonctionnalités",
    tags: ["partage", "partager", "amis"]
  },
  {
    id: "4",
    question: "Pourquoi la lecture automatique ne fonctionne pas ?",
    answer: "Vérifiez vos paramètres dans votre profil. Assurez-vous que l'option 'Lecture automatique' est activée. Certains navigateurs peuvent également bloquer la lecture automatique.",
    category: "Lecture",
    tags: ["autoplay", "lecture", "paramètres"]
  },
  {
    id: "5",
    question: "Comment changer la langue de l'interface ?",
    answer: "Rendez-vous dans votre profil et sélectionnez votre langue préférée dans les paramètres. Cette langue sera utilisée pour l'interface et les descriptions des films.",
    category: "Paramètres",
    tags: ["langue", "interface", "profil"]
  },
  {
    id: "6",
    question: "Que faire si un film ne se charge pas ?",
    answer: "Vérifiez votre connexion internet. Essayez de rafraîchir la page (F5). Si le problème persiste, le film pourrait être temporairement indisponible. Contactez le support si nécessaire.",
    category: "Problèmes techniques",
    tags: ["chargement", "vidéo", "erreur"]
  },
  {
    id: "7",
    question: "Comment utiliser la recherche ?",
    answer: "Utilisez la barre de recherche en haut de la page. Tapez le nom du film, acteur, ou genre que vous recherchez. Vous pouvez filtrer entre films et séries TV.",
    category: "Navigation",
    tags: ["recherche", "chercher", "trouver"]
  },
  {
    id: "8",
    question: "L'application est-elle disponible sur mobile ?",
    answer: "Oui ! Notre site web est entièrement responsive et s'adapte parfaitement aux smartphones et tablettes. Vous pouvez l'utiliser directement depuis votre navigateur mobile.",
    category: "Compatibilité",
    tags: ["mobile", "smartphone", "tablette"]
  }
];

const categories = [
  { name: "Tout", icon: HelpCircle },
  { name: "Compte", icon: Settings },
  { name: "Fonctionnalités", icon: Heart },
  { name: "Lecture", icon: Play },
  { name: "Paramètres", icon: Settings },
  { name: "Problèmes techniques", icon: Monitor },
  { name: "Navigation", icon: Search },
  { name: "Compatibilité", icon: Smartphone }
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchTerm === "" || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "Tout" || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold">Centre d'Aide</h1>
        <p className="text-xl text-muted-foreground">
          Trouvez rapidement les réponses à vos questions
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Recherchez votre question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.name)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Questions Fréquentes
          {filteredFAQs.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {filteredFAQs.length} résultat{filteredFAQs.length > 1 ? 's' : ''}
            </Badge>
          )}
        </h2>

        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
              <p className="text-muted-foreground">
                Essayez d'autres mots-clés ou consultez toutes les catégories.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id}>
                <Collapsible
                  open={openItems.includes(faq.id)}
                  onOpenChange={() => toggleItem(faq.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-left text-base font-medium">
                            {faq.question}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {faq.category}
                            </Badge>
                            {faq.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {openItems.includes(faq.id) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <Separator className="mb-4" />
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Besoin d'aide supplémentaire ?
          </CardTitle>
          <CardDescription>
            Notre équipe de support est là pour vous aider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-sm text-muted-foreground">streamflix234m@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div>
                <h4 className="font-medium">Chat en direct</h4>
                <p className="text-sm text-muted-foreground">Disponible 24h/24</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">Guides utiles :</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Guide de démarrage rapide</li>
              <li>• Optimisation de la qualité vidéo</li>
              <li>• Gestion de votre profil</li>
              <li>• Résolution des problèmes courants</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}