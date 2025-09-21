import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Calendar, Eye, Database, Lock, UserCheck, Download, Trash2, Settings, Mail, Scale } from "lucide-react";

export default function Privacy() {
  const lastUpdated = "15 septembre 2025";

  const sections = [
    { id: "introduction", title: "1. Introduction", icon: <Shield className="h-4 w-4" /> },
    { id: "controller", title: "2. Responsable de traitement", icon: <UserCheck className="h-4 w-4" /> },
    { id: "data-collected", title: "3. Données collectées", icon: <Database className="h-4 w-4" /> },
    { id: "purposes", title: "4. Finalités du traitement", icon: <Eye className="h-4 w-4" /> },
    { id: "legal-basis", title: "5. Base légale", icon: <Shield className="h-4 w-4" /> },
    { id: "sharing", title: "6. Partage des données", icon: <Database className="h-4 w-4" /> },
    { id: "retention", title: "7. Durée de conservation", icon: <Calendar className="h-4 w-4" /> },
    { id: "security", title: "8. Sécurité des données", icon: <Lock className="h-4 w-4" /> },
    { id: "rights", title: "9. Vos droits RGPD", icon: <Settings className="h-4 w-4" /> },
    { id: "cookies", title: "10. Cookies et traceurs", icon: <Eye className="h-4 w-4" /> },
    { id: "minors", title: "11. Protection des mineurs", icon: <Shield className="h-4 w-4" /> },
    { id: "transfers", title: "12. Transferts internationaux", icon: <Database className="h-4 w-4" /> },
    { id: "updates", title: "13. Modifications", icon: <Settings className="h-4 w-4" /> },
    { id: "contact", title: "14. Contact et réclamations", icon: <Mail className="h-4 w-4" /> },
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
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold" data-testid="page-title">
              Politique de Confidentialité
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="page-description">
            StreamFlix s'engage à protéger votre vie privée et vos données personnelles. Cette politique 
            explique comment nous collectons, utilisons et protégeons vos informations conformément au RGPD.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Dernière mise à jour : {lastUpdated}</span>
            </div>
            <Badge variant="outline">Conforme RGPD</Badge>
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
                  Navigation rapide dans la politique
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

          {/* Privacy Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Section 1: Introduction */}
            <Card id="introduction">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>1. Introduction</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Chez StreamFlix, nous accordons une importance primordiale à la protection de votre vie privée 
                  et au respect de vos données personnelles. Cette politique de confidentialité vous informe de 
                  la manière dont nous collectons, utilisons, stockons et protégeons vos informations personnelles.
                </p>
                <p>
                  Cette politique s'applique à tous les utilisateurs de notre service de streaming vidéo, 
                  accessible via notre site web et nos applications mobiles. Elle est conforme au Règlement 
                  Général sur la Protection des Données (RGPD) et à la loi française "Informatique et Libertés".
                </p>
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <p className="font-medium text-primary">Engagement StreamFlix :</p>
                  <p className="text-foreground">
                    Nous nous engageons à traiter vos données avec transparence, loyauté et dans le respect 
                    de vos droits fondamentaux.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Controller */}
            <Card id="controller">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <CardTitle>2. Responsable de traitement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Le responsable du traitement de vos données personnelles est :
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="space-y-2">
                    <p><strong>Raison sociale :</strong> StreamFlix SAS</p>
                    <p><strong>Siège social :</strong> 123 Rue de la Technologie, 75001 Paris, France</p>
                    <p><strong>RCS :</strong> Paris 123 456 789</p>
                    <p><strong>SIRET :</strong> 12345678901234</p>
                    <p><strong>TVA :</strong> FR12123456789</p>
                    <p><strong>Contact DPO :</strong> dpo@streamflix.fr</p>
                  </div>
                </div>
                <p>
                  Notre Délégué à la Protection des Données (DPO) est votre interlocuteur privilégié pour 
                  toute question relative à la protection de vos données personnelles et à l'exercice de vos droits.
                </p>
              </CardContent>
            </Card>

            {/* Section 3: Data Collected */}
            <Card id="data-collected">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>3. Données collectées</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Nous collectons différents types de données personnelles selon vos interactions avec notre service :
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">3.1. Données d'identification et de contact</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Nom et prénom</li>
                      <li>Adresse email</li>
                      <li>Date de naissance (pour vérification d'âge)</li>
                      <li>Pays de résidence</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3.2. Données de facturation</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Informations de paiement (traitées par nos partenaires sécurisés)</li>
                      <li>Historique des transactions</li>
                      <li>Statut d'abonnement</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3.3. Données d'utilisation du service</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Contenus visionnés et durée de visionnage</li>
                      <li>Préférences et évaluations</li>
                      <li>Historique de navigation sur la plateforme</li>
                      <li>Listes de favoris et signets</li>
                      <li>Paramètres de compte et préférences</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3.4. Données techniques</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Adresse IP et géolocalisation approximative</li>
                      <li>Type d'appareil et système d'exploitation</li>
                      <li>Navigateur web et version</li>
                      <li>Résolution d'écran et qualité de streaming</li>
                      <li>Données de connexion et de performance</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Mode de collecte :</p>
                  <p className="text-muted-foreground">
                    Ces données sont collectées directement lors de votre inscription, de votre utilisation 
                    du service, ou automatiquement par le biais de technologies web (cookies, pixels).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Purposes */}
            <Card id="purposes">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <CardTitle>4. Finalités du traitement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Vos données personnelles sont traitées pour les finalités suivantes :
                </p>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium mb-1">4.1. Exécution du contrat de service</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Création et gestion de votre compte utilisateur</li>
                      <li>Fourniture du service de streaming vidéo</li>
                      <li>Gestion des abonnements et facturation</li>
                      <li>Support client et assistance technique</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-secondary pl-4">
                    <h4 className="font-medium mb-1">4.2. Amélioration du service</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Personnalisation des recommandations de contenu</li>
                      <li>Optimisation de la qualité de streaming</li>
                      <li>Analyse des usages pour améliorer l'expérience utilisateur</li>
                      <li>Développement de nouvelles fonctionnalités</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-accent pl-4">
                    <h4 className="font-medium mb-1">4.3. Communication marketing (avec consentement)</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Envoi de newsletters et actualités du service</li>
                      <li>Notifications de nouveaux contenus</li>
                      <li>Offres promotionnelles personnalisées</li>
                      <li>Enquêtes de satisfaction</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-muted pl-4">
                    <h4 className="font-medium mb-1">4.4. Obligations légales</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Respect des obligations comptables et fiscales</li>
                      <li>Lutte contre la fraude et les impayés</li>
                      <li>Réponse aux demandes des autorités compétentes</li>
                      <li>Conservation pour la défense de nos droits</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Legal Basis */}
            <Card id="legal-basis">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>5. Base légale du traitement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Conformément au RGPD, chaque traitement de données personnelles doit reposer sur une base légale :
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="bg-green-500 p-1 rounded-full">
                      <UserCheck className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Exécution du contrat (Art. 6.1.b RGPD)</p>
                      <p className="text-muted-foreground text-xs">
                        Gestion de compte, fourniture du service, facturation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="bg-blue-500 p-1 rounded-full">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Intérêt légitime (Art. 6.1.f RGPD)</p>
                      <p className="text-muted-foreground text-xs">
                        Amélioration du service, sécurité, lutte contre la fraude
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="bg-purple-500 p-1 rounded-full">
                      <Eye className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Consentement (Art. 6.1.a RGPD)</p>
                      <p className="text-muted-foreground text-xs">
                        Marketing, cookies non essentiels, géolocalisation précise
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div className="bg-orange-500 p-1 rounded-full">
                      <Scale className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Obligation légale (Art. 6.1.c RGPD)</p>
                      <p className="text-muted-foreground text-xs">
                        Conservation comptable, réponse aux autorités
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Retrait du consentement :</p>
                  <p className="text-muted-foreground">
                    Vous pouvez retirer votre consentement à tout moment pour les traitements qui en dépendent, 
                    sans affecter la licéité du traitement fondé sur le consentement effectué avant le retrait.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Data Sharing */}
            <Card id="sharing">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>6. Partage des données</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Nous ne vendons jamais vos données personnelles. Nous pouvons cependant les partager 
                  dans les cas suivants :
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">6.1. Prestataires de services</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Hébergement et infrastructure cloud (AWS, Google Cloud)</li>
                      <li>Processeurs de paiement (Lygos)</li>
                      <li>Services d'analyse et de mesure d'audience</li>
                      <li>Support client et communication</li>
                      <li>Sécurité et protection contre la fraude</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Ces prestataires sont liés par des accords de confidentialité stricts et ne peuvent 
                      utiliser vos données que pour les services qu'ils nous fournissent.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">6.2. Obligations légales</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Autorités judiciaires ou administratives sur demande légale</li>
                      <li>Organismes de lutte contre la fraude</li>
                      <li>Administration fiscale selon les obligations légales</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">6.3. Partenaires commerciaux (avec consentement)</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Studios et distributeurs de contenu pour la personnalisation</li>
                      <li>Partenaires marketing pour des offres conjointes</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <p className="font-medium text-destructive">Garanties de protection :</p>
                  <p className="text-foreground">
                    Tous nos partenaires et prestataires sont sélectionnés selon des critères stricts de 
                    sécurité et de conformité RGPD. Des accords de sous-traitance détaillés encadrent ces relations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 7: Retention */}
            <Card id="retention">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>7. Durée de conservation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités 
                  pour lesquelles elles ont été collectées :
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Type de données</th>
                        <th className="text-left p-3 font-medium">Durée de conservation</th>
                        <th className="text-left p-3 font-medium">Finalité</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="p-3">Données de compte actif</td>
                        <td className="p-3">Durée de l'abonnement</td>
                        <td className="p-3">Fourniture du service</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Données de facturation</td>
                        <td className="p-3">10 ans</td>
                        <td className="p-3">Obligations comptables</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Historique de visionnage</td>
                        <td className="p-3">3 ans après résiliation</td>
                        <td className="p-3">Amélioration du service</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Données de connexion</td>
                        <td className="p-3">1 an</td>
                        <td className="p-3">Sécurité et lutte contre la fraude</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Données marketing</td>
                        <td className="p-3">3 ans sans interaction</td>
                        <td className="p-3">Communication commerciale</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Suppression automatique :</p>
                  <p className="text-muted-foreground">
                    À l'expiration des durées de conservation, vos données sont automatiquement supprimées 
                    de nos systèmes, sauf obligation légale contraire.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 8: Security */}
            <Card id="security">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>8. Sécurité des données</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  La sécurité de vos données personnelles est notre priorité absolue. Nous mettons en œuvre 
                  des mesures techniques et organisationnelles appropriées pour protéger vos informations :
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">8.1. Mesures techniques</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Chiffrement SSL/TLS pour tous les transferts de données</li>
                      <li>Chiffrement au repos des données sensibles</li>
                      <li>Authentification multi-facteurs pour les accès administrateurs</li>
                      <li>Surveillance continue et détection d'intrusions</li>
                      <li>Sauvegardes sécurisées et redondantes</li>
                      <li>Tests de sécurité réguliers et audits de code</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">8.2. Mesures organisationnelles</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Politique de sécurité interne stricte</li>
                      <li>Formation régulière du personnel à la sécurité</li>
                      <li>Accès aux données sur la base du besoin d'en connaître</li>
                      <li>Procédures de gestion des incidents de sécurité</li>
                      <li>Audits de sécurité par des tiers indépendants</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">8.3. Certifications et conformité</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">ISO 27001</Badge>
                      <Badge variant="outline">SOC 2 Type II</Badge>
                      <Badge variant="outline">RGPD</Badge>
                      <Badge variant="outline">PCI DSS</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">En cas d'incident :</p>
                  <p className="text-muted-foreground">
                    En cas de violation de données susceptible d'engendrer un risque élevé pour vos droits 
                    et libertés, nous vous en informerons dans les 72 heures conformément au RGPD.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 9: Rights */}
            <Card id="rights">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>9. Vos droits RGPD</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
                </p>
                
                <div className="grid gap-4">
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Eye className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Droit d'accès (Art. 15)</h4>
                      <p className="text-muted-foreground">
                        Obtenir une copie de vos données personnelles et des informations sur leur traitement.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Settings className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Droit de rectification (Art. 16)</h4>
                      <p className="text-muted-foreground">
                        Corriger ou mettre à jour vos données personnelles inexactes ou incomplètes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Trash2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Droit d'effacement (Art. 17)</h4>
                      <p className="text-muted-foreground">
                        Demander la suppression de vos données dans certaines conditions légales.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Lock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Droit de limitation (Art. 18)</h4>
                      <p className="text-muted-foreground">
                        Limiter le traitement de vos données dans certains cas spécifiques.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Download className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Droit à la portabilité (Art. 20)</h4>
                      <p className="text-muted-foreground">
                        Recevoir vos données dans un format structuré et les transférer à un autre responsable.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Droit d'opposition (Art. 21)</h4>
                      <p className="text-muted-foreground">
                        Vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <p className="font-medium text-primary mb-2">Comment exercer vos droits :</p>
                  <div className="space-y-2">
                    <p className="text-foreground">• Directement dans les paramètres de votre compte StreamFlix</p>
                    <p className="text-foreground">• Par email à : dpo@streamflix.fr</p>
                    <p className="text-foreground">• Par courrier postal à l'adresse du siège social</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Délai de réponse : 1 mois (extensible à 3 mois si nécessaire)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 10: Cookies */}
            <Card id="cookies">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <CardTitle>10. Cookies et traceurs</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  StreamFlix utilise des cookies et technologies similaires pour améliorer votre expérience 
                  et analyser l'utilisation de notre service :
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">10.1. Cookies essentiels (sans consentement)</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Authentification et gestion de session</li>
                      <li>Sécurité et protection contre la fraude</li>
                      <li>Préférences techniques (langue, qualité vidéo)</li>
                      <li>Fonctionnement du panier et du processus de commande</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">10.2. Cookies analytiques (avec consentement)</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Google Analytics (statistiques d'audience anonymisées)</li>
                      <li>Mesure de performance et optimisation du service</li>
                      <li>Tests A/B pour améliorer l'interface utilisateur</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">10.3. Cookies marketing (avec consentement)</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Personnalisation des recommandations de contenu</li>
                      <li>Publicité ciblée sur les réseaux sociaux</li>
                      <li>Retargeting et mesure de l'efficacité publicitaire</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">Gestion des cookies :</p>
                    <Button size="sm" variant="outline" data-testid="button-cookie-settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres cookies
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Vous pouvez modifier vos préférences de cookies à tout moment dans les paramètres 
                    de votre compte ou via le bandeau de consentement.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 11: Minors */}
            <Card id="minors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>11. Protection des mineurs</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  StreamFlix accorde une attention particulière à la protection des données des mineurs 
                  conformément à la réglementation en vigueur :
                </p>
                
                <div className="space-y-4">
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Mineurs de moins de 15 ans</h4>
                    <ul className="list-disc list-inside space-y-1 text-orange-700 dark:text-orange-300">
                      <li>Autorisation parentale obligatoire pour l'inscription</li>
                      <li>Vérification de l'identité du représentant légal</li>
                      <li>Contrôle parental renforcé sur le contenu accessible</li>
                      <li>Limitation des données collectées au strict nécessaire</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Mineurs de 15 à 18 ans</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                      <li>Inscription autonome possible avec vérification d'âge</li>
                      <li>Information claire sur le traitement des données</li>
                      <li>Possibilité de retrait du consentement à tout moment</li>
                      <li>Contrôle parental optionnel selon les préférences familiales</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Mesures de protection spécifiques :</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Interface simplifiée pour la gestion de la vie privée</li>
                      <li>Pas de profilage publicitaire pour les mineurs</li>
                      <li>Suppression facilitée des données à la majorité</li>
                      <li>Formation du personnel au contact avec les mineurs</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 12: International Transfers */}
            <Card id="transfers">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>12. Transferts internationaux</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Certaines de vos données peuvent être transférées en dehors de l'Union européenne 
                  dans le cadre de nos services :
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">12.1. Pays de destination</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>États-Unis (serveurs cloud AWS, Google Cloud)</li>
                      <li>Canada (centres de données de secours)</li>
                      <li>Royaume-Uni (services d'analyse)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">12.2. Garanties de protection</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950">Clauses contractuelles types (CCT)</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">Certifications adequacy (UK)</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">Privacy Shield successors</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Engagement de protection :</p>
                  <p className="text-muted-foreground">
                    Tous les transferts sont encadrés par des garanties appropriées assurant un niveau 
                    de protection équivalent à celui de l'Union européenne.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 13: Updates */}
            <Card id="updates">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>13. Modifications de la politique</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Cette politique de confidentialité peut être modifiée pour refléter les évolutions 
                  de nos services, de la réglementation ou de nos pratiques :
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Procédure de modification :</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Notification par email 30 jours avant l'entrée en vigueur</li>
                    <li>Publication sur notre site web avec mise en évidence des changements</li>
                    <li>Possibilité de consulter les versions antérieures</li>
                    <li>Droit de résiliation en cas de désaccord avec les modifications</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">Historique des versions :</p>
                  <div className="space-y-1 text-muted-foreground text-xs">
                    <p>• Version 3.0 - 15 septembre 2025 (actuelle)</p>
                    <p>• Version 2.1 - 12 mars 2025</p>
                    <p>• Version 2.0 - 25 mai 2024 (adaptation RGPD)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 14: Contact */}
            <Card id="contact">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>14. Contact et réclamations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Pour toute question relative à cette politique de confidentialité ou à l'exercice 
                  de vos droits, vous pouvez nous contacter :
                </p>
                
                <div className="grid gap-4">
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Délégué à la Protection des Données</h4>
                      <p className="text-muted-foreground">dpo@streamflix.fr</p>
                      <p className="text-xs text-muted-foreground">Réponse sous 1 mois maximum</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Settings className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Service Client</h4>
                      <p className="text-muted-foreground">support@streamflix.fr</p>
                      <p className="text-xs text-muted-foreground">Pour les questions générales sur votre compte</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Courrier postal</h4>
                      <p className="text-muted-foreground">
                        StreamFlix - Service DPO<br />
                        123 Rue de la Technologie<br />
                        75001 Paris, France
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">Autorité de contrôle :</p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation 
                    auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs mt-2">
                    <strong>CNIL</strong><br />
                    3 Place de Fontenoy - TSA 80715<br />
                    75334 Paris Cedex 07<br />
                    Tél : 01 53 73 22 22<br />
                    <a href="https://www.cnil.fr" className="underline">www.cnil.fr</a>
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