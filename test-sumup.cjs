// test-sumup.js
// Script pour tester votre configuration SumUp

// Charger les variables d'environnement
require('dotenv').config();

const SUMUP_API_KEY = process.env.SUMUP_API_KEY;

if (!SUMUP_API_KEY) {
  console.error('❌ SUMUP_API_KEY non trouvée dans .env');
  process.exit(1);
}

console.log('🔑 Clé API trouvée:', SUMUP_API_KEY.substring(0, 15) + '...');

// Test de connexion à l'API SumUp
async function testSumUpConnection() {
  try {
    console.log('\n🔄 Test de connexion à SumUp...\n');

    // Récupérer les informations du compte marchand
    const response = await fetch('https://api.sumup.com/v0.1/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUMUP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erreur API:', error);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    console.log('✅ Connexion réussie !');
    console.log('\n📊 Informations de votre compte:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Merchant Code:', data.merchant_code || '❌ MANQUANT !');
    console.log('Email:', data.email || 'N/A');
    console.log('Pays:', data.country_code || 'N/A');
    console.log('Devise:', data.currency_code || 'N/A');
    console.log('Mobile:', data.mobile_phone || 'N/A');
    console.log('\n📋 Données complètes du profil:');
    console.log(JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!data.merchant_code) {
      console.log('⚠️  ATTENTION: merchant_code est manquant !');
      console.log('💡 Solutions possibles:');
      console.log('1. Votre compte SumUp n\'est peut-être pas complètement activé');
      console.log('2. Essayez d\'utiliser pay_to_email à la place');
      console.log('3. Contactez le support SumUp\n');
      
      // Test avec pay_to_email
      if (data.email) {
        console.log('🔄 Test de création de checkout avec pay_to_email...\n');
        await testCheckoutWithEmail(data.email);
      }
    } else {
      console.log('🎉 Votre configuration SumUp est correcte !');
      console.log('✅ Vous pouvez maintenant tester les paiements\n');
      
      // Test de création de checkout
      await testCheckoutCreation(data.merchant_code);
    }

    return data;

  } catch (error) {
    console.error('\n❌ Erreur de connexion:');
    console.error('Message:', error.message);
    console.error('\n💡 Vérifications:');
    console.error('1. Votre clé API est-elle correcte ?');
    console.error('2. Êtes-vous en mode test ou production ?');
    console.error('3. La clé commence-t-elle par sk_test_ ou sk_live_ ?');
    console.error('4. Avez-vous créé la clé sur https://me.sumup.com ?');
    process.exit(1);
  }
}

// Test de création de checkout avec merchant_code
async function testCheckoutCreation(merchantCode) {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 Test de création de checkout...\n');

    const checkoutPayload = {
      checkout_reference: `TEST-${Date.now()}`,
      amount: 10.00,
      currency: 'CHF',
      merchant_code: merchantCode,
      description: 'Test checkout',
      return_url: 'http://localhost:4321/checkout/success',
      redirect_url: 'http://localhost:4321/checkout/success',
    };

    console.log('Payload envoyé:');
    console.log(JSON.stringify(checkoutPayload, null, 2));

    const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUMUP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutPayload),
    });

    console.log('\nStatut de la réponse:', response.status);

    const result = await response.json();
    console.log('\nRéponse SumUp:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Checkout créé avec succès !');
      console.log('ID:', result.id);
      console.log('URL:', `https://api.sumup.com/v0.1/checkouts/${result.id}`);
    } else {
      console.log('\n❌ Échec de création du checkout');
      console.log('Erreur:', result.message || result.error_code);
    }

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
  }
}

// Test avec pay_to_email à la place
async function testCheckoutWithEmail(email) {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 Test avec pay_to_email au lieu de merchant_code...\n');

    const checkoutPayload = {
      checkout_reference: `TEST-${Date.now()}`,
      amount: 10.00,
      currency: 'CHF',
      pay_to_email: email,
      description: 'Test checkout avec email',
      return_url: 'http://localhost:4321/checkout/success',
      redirect_url: 'http://localhost:4321/checkout/success',
    };

    console.log('Payload envoyé:');
    console.log(JSON.stringify(checkoutPayload, null, 2));

    const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUMUP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutPayload),
    });

    console.log('\nStatut de la réponse:', response.status);

    const result = await response.json();
    console.log('\nRéponse SumUp:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Checkout créé avec pay_to_email !');
      console.log('💡 Utilisez pay_to_email dans votre intégration');
    } else {
      console.log('\n❌ Échec avec pay_to_email aussi');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

// Lancer le test
testSumUpConnection();