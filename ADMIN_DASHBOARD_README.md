# Nouveau Panneau d'Administration

## Vue d'ensemble

Cette mise à jour complète du panneau d'administration offre une interface utilisateur améliorée avec toutes les fonctionnalités nécessaires pour gérer efficacement la plateforme de streaming.

## Fonctionnalités principales

### 1. Tableau de Bord
- Statistiques en temps réel (utilisateurs actifs, vues quotidiennes/hebdomadaires)
- Activité récente (nouveaux films, nouveaux utilisateurs, abonnements actifs)
- Actions rapides pour accéder rapidement aux fonctionnalités principales

### 2. Gestion des Contenus
- Recherche intégrée via l'API TMDB pour les films et séries
- Ajout de contenu avec support pour les liens Odysee
- Gestion des langues (VF, VOSTFR, VO) et des qualités (SD, HD, 4K)
- Visualisation du contenu existant

### 3. Gestion des Utilisateurs
- Liste complète des utilisateurs avec filtres
- Détails des utilisateurs (rôle, date d'inscription)
- Modification des rôles (utilisateur/administrateur)
- Suspension des utilisateurs

### 4. Gestion des Abonnements
- Vue d'ensemble des abonnements actifs
- Historique complet des paiements
- Filtrage par plan d'abonnement (Gratuit, Basic, Standard, Premium, VIP)
- Suivi des statuts (actif, annulé, expiré)

### 5. Modération
- Journal de sécurité en temps réel
- Surveillance des tentatives de connexion échouées
- Détection des attaques par force brute
- Suivi des accès administrateurs
- Détection des violations XSS
- Bouton d'actualisation pour rafraîchir les journaux

### 6. Notifications
- Envoi de notifications individuelles aux utilisateurs
- Envoi d'annonces à tous les utilisateurs
- Support pour différents types de notifications (info, succès, avertissement, erreur)

### 7. Gestion des Bannières
- Configuration de la bannière de paiement
- Gestion du titre, de la description, de l'image
- Réglage de la priorité et activation/désactivation

### 8. Collections
- Gestion des collections de films/séries
- Visualisation du contenu des collections

### 9. Statistiques
- Vue d'ensemble des métriques clés
- Répartition des abonnements par plan
- Suivi des revenus et des vues

### 10. Sécurité
- Tableau de bord de sécurité avec statistiques
- Protection CSRF
- Authentification JWT sécurisée
- Journalisation complète des événements de sécurité

## Améliorations par rapport à l'ancienne version

1. **Interface utilisateur moderne** : Design amélioré avec une navigation par onglets plus intuitive
2. **Performances** : Optimisations pour un chargement plus rapide des données
3. **Fonctionnalités étendues** : Ajout de nouvelles fonctionnalités comme l'envoi d'annonces
4. **Meilleure organisation** : Regroupement logique des fonctionnalités
5. **Actualisation en temps réel** : Boutons d'actualisation pour les données critiques
6. **Gestion améliorée des erreurs** : Meilleurs messages d'erreur et feedback utilisateur

## Technologies utilisées

- React avec TypeScript
- TanStack Query pour la gestion des données
- Composants UI modernes (Card, Table, Dialog, etc.)
- API RESTful pour la communication backend

## Utilisation

Pour accéder au nouveau panneau d'administration, rendez-vous sur `/admin` en tant qu'utilisateur administrateur.

L'ancien panneau d'administration redirige automatiquement vers la nouvelle version.