import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, AlertTriangle, Scale, Shield } from "lucide-react";

export default function Terms() {
  const lastUpdated = "15 septembre 2025";

  const sections = [
    { id: "acceptance", title: "1. Acceptation des conditions", icon: <Scale className="h-4 w-4" /> },
    { id: "definitions", title: "2. Définitions", icon: <FileText className="h-4 w-4" /> },
    { id: "service", title: "3. Description du service", icon: <Shield className="h-4 w-4" /> },
    { id: "account", title: "4. Compte utilisateur", icon: <FileText className="h-4 w-4" /> },
    { id: "subscription", title: "5. Abonnement et paiement", icon: <FileText className="h-4 w-4" /> },
    { id: "usage", title: "6. Utilisation du service", icon: <FileText className="h-4 w-4" /> },
    { id: "content", title: "7. Contenu et propriété intellectuelle", icon: <FileText className="h-4 w-4" /> },
    { id: "prohibited", title: "8. Utilisations interdites", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "privacy", title: "9. Protection des données personnelles", icon: <Shield className="h-4 w-4" /> },
    { id: "responsibility", title: "10. Limitation de responsabilité", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "termination", title: "11. Résiliation", icon: <FileText className="h-4 w-4" /> },
    { id: "modifications", title: "12. Modifications des conditions", icon: <FileText className="h-4 w-4" /> },
    { id: "governing", title: "13. Droit applicable et juridiction", icon: <Scale className="h-4 w-4" /> },
    { id: "contact", title: "14. Contact", icon: <FileText className="h-4 w-4" /> },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold" data-testid="page-title">
              Conditions Générales d'Utilisation
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="page-description">
            Les présentes conditions générales d'utilisation (ci-après les "CGU") régissent l'utilisation 
            du service de streaming vidéo StreamFlix et définissent les droits et obligations des utilisateurs.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Dernière mise à jour : {lastUpdated}</span>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Sommaire</CardTitle>
                <CardDescription>
                  Naviguer dans les conditions générales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className="flex items-center space-x-2 w-full text-left p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                        data-testid={`toc-${section.id}`}
                      >
                        {section.icon}
                        <span className="flex-1">{section.title}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Terms Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Section 1: Acceptation */}
            <Card id="acceptance">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <CardTitle>1. Acceptation des conditions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  En accédant et en utilisant le service StreamFlix, vous acceptez d'être lié par les présentes 
                  conditions générales d'utilisation. Si vous n'acceptez pas ces conditions dans leur intégralité, 
                  vous ne devez pas utiliser notre service.
                </p>
                <p>
                  L'utilisation continue du service après toute modification des CGU constitue votre acceptation 
                  des nouvelles conditions. Il est de votre responsabilité de consulter régulièrement ces conditions 
                  pour prendre connaissance des éventuelles modifications.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Important :</p>
                  <p className="text-muted-foreground">
                    Vous devez être âgé d'au moins 18 ans ou avoir l'autorisation parentale pour utiliser StreamFlix.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Definitions */}
            <Card id="definitions">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>2. Définitions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid gap-4">
                  <div>
                    <p className="font-medium">"Service" :</p>
                    <p className="text-muted-foreground">La plateforme de streaming vidéo StreamFlix accessible via le site web et les applications mobiles.</p>
                  </div>
                  <div>
                    <p className="font-medium">"Utilisateur" :</p>
                    <p className="text-muted-foreground">Toute personne physique ou morale qui accède et utilise le Service.</p>
                  </div>
                  <div>
                    <p className="font-medium">"Contenu" :</p>
                    <p className="text-muted-foreground">L'ensemble des films, séries, documentaires, et autres œuvres audiovisuelles disponibles sur la plateforme.</p>
                  </div>
                  <div>
                    <p className="font-medium">"Compte" :</p>
                    <p className="text-muted-foreground">L'espace personnel de l'Utilisateur créé lors de l'inscription au Service.</p>
                  </div>
                  <div>
                    <p className="font-medium">"Abonnement" :</p>
                    <p className="text-muted-foreground">La souscription payante donnant accès au Contenu pour une durée déterminée.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Service Description */}
            <Card id="service">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>3. Description du service</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  StreamFlix est un service de streaming vidéo qui permet aux utilisateurs de visionner des films, 
                  séries et documentaires en ligne. Le service est accessible 24h/24 et 7j/7, sous réserve des 
                  opérations de maintenance planifiées.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Le service comprend :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Accès illimité au catalogue de contenus disponibles</li>
                    <li>Streaming en haute définition selon votre connexion internet</li>
                    <li>Fonctionnalités de recherche et de recommandation personnalisée</li>
                    <li>Création de listes de favoris et historique de visionnage</li>
                    <li>Accès multi-appareils (ordinateur, tablette, smartphone, smart TV)</li>
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Disponibilité du service :</p>
                  <p className="text-muted-foreground">
                    StreamFlix s'efforce de maintenir une disponibilité optimale du service mais ne peut garantir 
                    un accès ininterrompu. Des interruptions peuvent survenir pour maintenance ou raisons techniques.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Account */}
            <Card id="account">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>4. Compte utilisateur</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Pour utiliser StreamFlix, vous devez créer un compte en fournissant des informations exactes et à jour. 
                  Vous êtes responsable de la confidentialité de vos identifiants de connexion.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Obligations concernant votre compte :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Fournir des informations véridiques lors de l'inscription</li>
                    <li>Maintenir vos informations personnelles à jour</li>
                    <li>Ne pas partager vos identifiants avec des tiers</li>
                    <li>Nous informer immédiatement de toute utilisation non autorisée</li>
                    <li>Être responsable de toutes les activités effectuées depuis votre compte</li>
                  </ul>
                </div>
                <Badge variant="outline" className="w-fit">
                  Un seul compte par personne est autorisé
                </Badge>
              </CardContent>
            </Card>

            {/* Section 5: Subscription */}
            <Card id="subscription">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>5. Abonnement et paiement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  L'accès au contenu StreamFlix nécessite un abonnement payant. Les tarifs et modalités de paiement 
                  sont indiqués sur notre site web et peuvent être modifiés avec un préavis de 30 jours.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Modalités d'abonnement :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Abonnement mensuel renouvelé automatiquement</li>
                    <li>Paiement par carte bancaire ou autres moyens acceptés</li>
                    <li>Facturation le même jour chaque mois</li>
                    <li>Résiliation possible à tout moment sans frais</li>
                    <li>Accès maintenu jusqu'à la fin de la période payée</li>
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Période d'essai :</p>
                  <p className="text-muted-foreground">
                    Une période d'essai gratuite peut être proposée aux nouveaux utilisateurs. Les conditions 
                    spécifiques sont communiquées lors de l'inscription.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Usage */}
            <Card id="usage">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>6. Utilisation du service</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  L'utilisation de StreamFlix est strictement limitée à un usage personnel et non commercial. 
                  Vous acceptez d'utiliser le service conformément aux lois en vigueur et aux présentes conditions.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Utilisations autorisées :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Visionnage personnel du contenu disponible</li>
                    <li>Téléchargement temporaire sur appareils autorisés (selon l'offre)</li>
                    <li>Partage au sein du même foyer (selon limitations de l'abonnement)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Restrictions techniques :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Nombre limité d'appareils connectés simultanément</li>
                    <li>Qualité de streaming adaptée à votre connexion internet</li>
                    <li>Disponibilité géographique selon les droits de diffusion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Section 7: Content */}
            <Card id="content">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>7. Contenu et propriété intellectuelle</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Tout le contenu disponible sur StreamFlix est protégé par des droits d'auteur et autres droits 
                  de propriété intellectuelle. StreamFlix dispose des licences nécessaires pour la diffusion du contenu.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Droits accordés à l'utilisateur :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Droit de visionnage personnel et non commercial</li>
                    <li>Accès limité à la durée de l'abonnement</li>
                    <li>Utilisation conforme aux restrictions géographiques</li>
                  </ul>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <p className="font-medium text-destructive">Interdictions formelles :</p>
                  <ul className="list-disc list-inside space-y-1 text-destructive/80">
                    <li>Reproduction, distribution ou modification du contenu</li>
                    <li>Contournement des mesures de protection technique</li>
                    <li>Extraction, téléchargement permanent ou capture d'écran</li>
                    <li>Diffusion publique ou commerciale du contenu</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Section 8: Prohibited Uses */}
            <Card id="prohibited">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>8. Utilisations interdites</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Les utilisations suivantes du service StreamFlix sont strictement interdites et peuvent entraîner 
                  la suspension ou la résiliation immédiate de votre compte :
                </p>
                <div className="space-y-4">
                  <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    <p className="font-medium text-destructive mb-2">Activités interdites :</p>
                    <ul className="list-disc list-inside space-y-1 text-destructive/80">
                      <li>Piratage, hacking ou tentative d'accès non autorisé</li>
                      <li>Partage de compte en dehors du cercle familial</li>
                      <li>Utilisation de VPN pour contourner les restrictions géographiques</li>
                      <li>Automatisation des accès (bots, scripts)</li>
                      <li>Surcharge intentionnelle des serveurs</li>
                      <li>Reverse engineering du service ou des applications</li>
                      <li>Création de comptes multiples par la même personne</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium text-foreground">Sanctions :</p>
                    <p className="text-muted-foreground">
                      Toute violation de ces interdictions peut entraîner la suspension temporaire ou définitive 
                      du compte, sans remboursement des sommes versées.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 9: Privacy */}
            <Card id="privacy">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>9. Protection des données personnelles</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  La protection de vos données personnelles est une priorité pour StreamFlix. Notre politique 
                  de confidentialité détaille la collecte, l'utilisation et la protection de vos informations.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Données collectées :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Informations d'inscription et de facturation</li>
                    <li>Données d'utilisation et préférences de visionnage</li>
                    <li>Informations techniques (adresse IP, type d'appareil)</li>
                    <li>Données de navigation et interactions avec le service</li>
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Vos droits :</p>
                  <p className="text-muted-foreground">
                    Conformément au RGPD, vous disposez des droits d'accès, de rectification, de suppression, 
                    et de portabilité de vos données. Consultez notre politique de confidentialité pour plus de détails.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 10: Liability */}
            <Card id="responsibility">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <CardTitle>10. Limitation de responsabilité</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  StreamFlix s'efforce de fournir un service de qualité mais ne peut garantir un fonctionnement 
                  parfait en toutes circonstances. Notre responsabilité est limitée dans les conditions suivantes :
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Exclusions de responsabilité :</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Interruptions temporaires du service pour maintenance</li>
                      <li>Problèmes liés à votre connexion internet</li>
                      <li>Incompatibilité avec certains appareils ou navigateurs</li>
                      <li>Modifications du catalogue de contenu par les ayants droit</li>
                      <li>Dommages indirects ou perte de profits</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium text-foreground">Limitation financière :</p>
                    <p className="text-muted-foreground">
                      En cas de responsabilité avérée, l'indemnisation ne peut excéder le montant de l'abonnement 
                      mensuel en cours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 11: Termination */}
            <Card id="termination">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>11. Résiliation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Résiliation par l'utilisateur :</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Possible à tout moment sans frais ni pénalité</li>
                      <li>Effective à la fin de la période de facturation en cours</li>
                      <li>Maintien de l'accès jusqu'à l'expiration de l'abonnement</li>
                      <li>Procédure simple via les paramètres du compte</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Résiliation par StreamFlix :</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>En cas de violation des conditions d'utilisation</li>
                      <li>Pour non-paiement après mise en demeure</li>
                      <li>En cas d'utilisation frauduleuse du service</li>
                      <li>Avec préavis de 30 jours pour convenance</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium text-foreground">Conséquences de la résiliation :</p>
                    <p className="text-muted-foreground">
                      Perte immédiate de l'accès au service et suppression des données de visionnage. 
                      Les données personnelles sont conservées selon notre politique de confidentialité.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 12: Modifications */}
            <Card id="modifications">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>12. Modifications des conditions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  StreamFlix se réserve le droit de modifier les présentes conditions générales d'utilisation. 
                  Les modifications importantes seront communiquées aux utilisateurs.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Procédure de modification :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Notification par email 30 jours avant l'entrée en vigueur</li>
                    <li>Publication de la nouvelle version sur le site web</li>
                    <li>Possibilité de résiliation si refus des nouvelles conditions</li>
                    <li>Acceptation tacite par l'utilisation continue du service</li>
                  </ul>
                </div>
                <Badge variant="outline" className="w-fit">
                  Version actuelle : {lastUpdated}
                </Badge>
              </CardContent>
            </Card>

            {/* Section 13: Governing Law */}
            <Card id="governing">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <CardTitle>13. Droit applicable et juridiction</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Les présentes conditions générales sont régies par le droit français. En cas de litige, 
                  les tribunaux français seront seuls compétents.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Résolution des litiges :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Tentative de résolution amiable privilégiée</li>
                    <li>Médiation possible via les organismes agréés</li>
                    <li>Recours aux tribunaux de Paris en dernier ressort</li>
                    <li>Application du droit de la consommation français</li>
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Consommateurs européens :</p>
                  <p className="text-muted-foreground">
                    Les consommateurs résidant dans l'Union européenne peuvent bénéficier des protections 
                    supplémentaires prévues par leur droit national.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 14: Contact */}
            <Card id="contact">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>14. Contact</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Pour toute question concernant ces conditions générales d'utilisation ou le service StreamFlix, 
                  vous pouvez nous contacter :
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Adresse postale :</p>
                      <p className="text-muted-foreground">
                        StreamFlix SAS<br />
                        Service Juridique<br />
                        123 Rue de la Technologie<br />
                        75001 Paris, France
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email :</p>
                      <p className="text-muted-foreground">legal@streamflix.fr</p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Informations légales :</p>
                  <p className="text-muted-foreground">
                    StreamFlix SAS, société par actions simplifiée au capital de 1 000 000 €, 
                    immatriculée au RCS de Paris sous le numéro 123 456 789, 
                    TVA intracommunautaire : FR12123456789
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}