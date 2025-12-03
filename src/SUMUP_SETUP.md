# Guide de configuration SumUp pour We The Agency

## 📋 Prérequis

1. Un compte SumUp (créez-en un sur https://sumup.com)
2. Accès au Dashboard SumUp
3. Node.js et npm installés

## 🔑 Étape 1 : Obtenir vos clés API SumUp

### 1.1 Créer un compte de test

1. Connectez-vous à votre compte SumUp : https://me.sumup.com
2. Cliquez sur le menu déroulant entre "Support" et votre profil
3. Sélectionnez "Test Account"
4. Votre compte est maintenant en mode test

### 1.2 Générer une clé API

1. Allez sur https://developer.sumup.com/
2. Connectez-vous avec votre compte SumUp
3. Allez dans "API Keys" ou "Dashboard"
4. Créez une nouvelle clé API
5. Notez votre clé API (format: `sk_test_...` pour test, `sk_live_...` pour production)
6. Notez votre Merchant Code

## ⚙️ Étape 2 : Configuration du projet

### 2.1 Créer le fichier .env

Créez un fichier `.env` à la racine de votre projet :

```bash
# Copiez .env.example vers .env
cp .env.example .env
```

### 2.2 Remplir les variables d'environnement

Éditez le fichier `.env` :

```bash
# Mode Test
SUMUP_API_KEY=sk_test_VOTRE_VRAIE_CLE_API
SUMUP_MERCHANT_CODE=VOTRE_VRAI_CODE_MARCHAND

# URL de votre site
PUBLIC_SITE_URL=https://we-theagency.com
```

### 2.3 Ajouter .env au .gitignore

Assurez-vous que `.env` est dans votre `.gitignore` :

```
.env
.env.local
.env.production
```

## 📁 Étape 3 : Structure des fichiers

Vérifiez que vous avez tous ces fichiers :

```
src/
├── pages/
│   ├── checkout.astro                    ✅ Page de paiement
│   ├── checkout/
│   │   └── success.astro                 ✅ Page de confirmation
│   └── api/
│       └── create-sumup-checkout.ts      ✅ API endpoint
├── components/
│   ├── CheckoutForm.jsx                  ✅ Composant React
│   └── CheckoutForm.css                  ✅ Styles
.env                                       ✅ Variables d'environnement
.env.example                              ✅ Exemple de config
```

## 🧪 Étape 4 : Tester l'intégration

### 4.1 Mode Test

En mode test, SumUp ne traite pas de vrais paiements.

**Cartes de test SumUp :**

```
Carte Visa (succès):
Numéro: 4111 1111 1111 1111
CVV: 123
Expiration: toute date future

Carte (échec):
Numéro: 4000 0000 0000 0002
CVV: 123
Expiration: toute date future
```

### 4.2 Tester le flux complet

1. Ajoutez un produit au panier
2. Allez sur `/cart`
3. Cliquez sur "Procéder au paiement"
4. Remplissez le formulaire
5. Vérifiez vos informations
6. Cliquez sur "Payer"
7. Vous serez redirigé vers la page de paiement SumUp
8. Utilisez une carte de test
9. Vous serez redirigé vers `/checkout/success`

## 🚀 Étape 5 : Passer en production

### 5.1 Basculer vers les clés de production

Dans votre `.env` :

```bash
# Mode Production
SUMUP_API_KEY=sk_live_VOTRE_CLE_PRODUCTION
SUMUP_MERCHANT_CODE=VOTRE_CODE_PRODUCTION
PUBLIC_SITE_URL=https://wetheagency.fr
```

### 5.2 Vérifications avant la mise en production

- [ ] Les clés API de production sont configurées
- [ ] Le webhook est configuré (optionnel)
- [ ] Les emails de confirmation fonctionnent
- [ ] Le panier se vide après paiement
- [ ] La page de succès s'affiche correctement
- [ ] Les montants sont corrects (avec bonne devise)
- [ ] SSL/HTTPS est actif sur votre site

## 🔔 Étape 6 : Configuration des webhooks (optionnel)

Les webhooks permettent à SumUp de notifier votre serveur en temps réel.

### 6.1 Créer un endpoint webhook

Créez `src/pages/api/sumup-webhook.ts` :

```typescript
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.json();
  
  // Vérifier la signature (recommandé en production)
  // const signature = request.headers.get('X-SumUp-Signature');
  
  console.log('SumUp Webhook:', payload);
  
  // Traiter selon l'événement
  switch (payload.event_type) {
    case 'PAYMENT_INSTRUMENT_SUCCESSFUL':
      // Paiement réussi
      // Mettre à jour votre base de données
      break;
    case 'PAYMENT_INSTRUMENT_FAILED':
      // Paiement échoué
      break;
  }
  
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### 6.2 Configurer dans le dashboard SumUp

1. Allez sur https://developer.sumup.com/
2. Section "Webhooks"
3. Ajoutez l'URL : `https://wetheagency.fr/api/sumup-webhook`
4. Sélectionnez les événements : `checkout.*`

## 📧 Étape 7 : Emails de confirmation (recommandé)

### 7.1 Utiliser votre système d'email existant

Dans `create-sumup-checkout.ts`, ajoutez après la création du checkout :

```typescript
// Envoyer email de confirmation
await fetch('/contact-handler.php', {
  method: 'POST',
  body: JSON.stringify({
    to: formData.email,
    subject: 'Confirmation de commande - We The Agency',
    message: `
      Bonjour ${formData.firstName},
      
      Votre commande ${checkoutData.checkout_reference} a été créée.
      Montant: ${checkoutData.amount} ${checkoutData.currency}
      
      Cordialement,
      L'équipe We The Agency
    `
  })
});
```

## 🐛 Dépannage

### Erreur : "SumUp API credentials not configured"

**Solution :** Vérifiez que les variables d'environnement sont bien définies dans `.env`

### Erreur : "Failed to create SumUp checkout"

**Solutions :**
1. Vérifiez que votre clé API est valide
2. Vérifiez que le Merchant Code est correct
3. Vérifiez que le montant est > 0
4. Vérifiez que la devise est supportée (CHF, EUR, etc.)

### Le paiement ne se lance pas

**Solutions :**
1. Ouvrez la console (F12) pour voir les erreurs
2. Vérifiez que l'API endpoint `/api/create-sumup-checkout` existe
3. Vérifiez les logs du serveur

### Redirect ne fonctionne pas

**Solution :** Vérifiez que `return_url` et `redirect_url` pointent vers votre domaine

## 📚 Ressources

- Documentation SumUp : https://developer.sumup.com/
- API Reference : https://developer.sumup.com/api
- Support SumUp : integration@sumup.com
- Dashboard : https://me.sumup.com

## ✅ Checklist finale

- [ ] Compte SumUp créé et vérifié
- [ ] Clés API obtenues (test et production)
- [ ] Fichier `.env` configuré
- [ ] Test en mode sandbox réussi
- [ ] Cartes de test validées
- [ ] Page de succès fonctionnelle
- [ ] Panier vidé après paiement
- [ ] Emails de confirmation (optionnel)
- [ ] Webhooks configurés (optionnel)
- [ ] Clés de production configurées
- [ ] Tests en production validés

---

**🎉 Votre intégration SumUp est prête !**

Pour toute question : wepopup@wepopup.net