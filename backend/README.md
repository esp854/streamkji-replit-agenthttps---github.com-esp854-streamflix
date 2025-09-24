# Système de Paiement Automatisé avec Lygos

Ce système permet de générer automatiquement des liens de paiement et des QR codes pour tous les plans d'abonnement sans avoir besoin de les créer manuellement sur Lygos.

## 🚀 Fonctionnalités

- Création automatique de paiements pour tous les plans
- Génération de liens de paiement et QR codes
- Vérification automatique du statut des paiements
- Support pour Orange Money, MTN Mobile Money et Wave
- Architecture entièrement automatisée

## 📋 Prérequis

1. **Compte Lygos** : Inscrivez-vous sur [Lygos](https://lygos.app) pour obtenir votre clé API
2. **Clé API** : Configurez votre `LYGOS_API_KEY` dans les variables d'environnement
3. **Node.js** : Version 14 ou supérieure

## 🛠️ Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du dossier backend :

```env
LYGOS_API_KEY=votre_cle_api_lygos_ici
```

## ▶️ Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

Le serveur démarrera sur le port spécifié par la variable d'environnement PORT, ou sur le port 3000 par défaut.

## 📡 Endpoints API

### Créer un Paiement
```http
POST /api/create-payment
```

**Body :**
```json
{
  "planKey": "basic" // ou "standard", "premium", "vip"
}
```

**Réponse :**
```json
{
  "paymentLink": "https://pay.lygos.app/xxx",
  "qrCode": "https://api.lygos.app/qr/xxx",
  "paymentId": "pay_xxx"
}
```

### Vérifier le Statut d'un Paiement
```http
GET /api/check-payment/:paymentId
```

**Réponse :**
```json
{
  "status": "completed" // ou "pending", "failed"
}
```

## 🎯 Workflow

1. **L'utilisateur choisit un plan** sur le site
2. **Frontend envoie** le `planKey` au backend
3. **Backend appelle** l'API Lygos pour créer le paiement
4. **Lygos retourne** le lien de paiement, QR code et ID
5. **Frontend affiche** le QR code pour que l'utilisateur paie
6. **Système vérifie** automatiquement le statut du paiement
7. **Activation automatique** de l'abonnement quand le paiement est réussi

## ➕ Ajout de Nouveaux Plans

Pour ajouter un nouveau plan, il suffit de l'ajouter au tableau `plans` dans `routes/payment.js` :

```javascript
const plans = [
  // ... plans existants
  { key: "gold", name: "Gold", price: 15000 }
];
```

Aucun changement supplémentaire n'est nécessaire - tout est automatique !

## 📱 Méthodes de Paiement Supportées

- 🍊 **Orange Money** (Côte d'Ivoire, Sénégal, Burkina Faso)
- 📱 **MTN Mobile Money** (Côte d'Ivoire, Ghana, Ouganda)
- 🌊 **Wave** (Côte d'Ivoire, Sénégal)

## 🔧 Dépannage

### Erreurs Courantes

- **"Plan invalide"** : Vérifiez que le `planKey` existe dans le tableau `plans`
- **"Erreur création paiement"** : Vérifiez votre `LYGOS_API_KEY`
- **"Erreur vérification paiement"** : Vérifiez que le `paymentId` est correct

### Logs

Toutes les erreurs sont enregistrées dans la console pour faciliter le débogage.

## 📞 Support

Pour toute question sur l'intégration :
- Documentation Lygos : https://docs.lygos.app
- Support Lygos : support@lygos.app

```

```

```
# Backend Lygos Payment

Backend pour l'intégration des paiements Lygos avec Express.js

## 🚀 Démarrage

```
npm install
npm start
```

Le serveur démarrera sur le port spécifié par la variable d'environnement PORT, ou sur le port 3000 par défaut.

## 🗄️ Configuration de la Base de Données

Pour utiliser une base de données PostgreSQL avec Render, configurez la variable d'environnement `DATABASE_URL` :

```
DATABASE_URL=postgresql://username:password@host:port/database
```

Le code backend utilise `DATABASE_URL` avec la configuration SSL appropriée pour Render :

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false // important pour Render
  },
});

```

