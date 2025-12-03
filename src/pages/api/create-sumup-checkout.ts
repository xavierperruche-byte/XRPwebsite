// src/pages/api/create-sumup-checkout.ts

export const POST = async ({ request }) => {
  try {
    const { checkoutData, formData, cart } = await request.json();
    
    // Validation des données
    if (!checkoutData.amount || checkoutData.amount <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Montant invalide' 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('=== CRÉATION CHECKOUT SUMUP ===');
    console.log('Montant:', checkoutData.amount);
    console.log('Devise:', checkoutData.currency);
    console.log('Référence:', checkoutData.checkout_reference);

    // Préparer les données pour SumUp
    const sumupPayload = {
      checkout_reference: checkoutData.checkout_reference,
      amount: Number(checkoutData.amount).toFixed(2), // Format: "10.50"
      currency: checkoutData.currency,
      pay_to_email: import.meta.env.SUMUP_MERCHANT_EMAIL,
      description: checkoutData.description || `Commande ${cart.length} article(s)`,
      return_url: checkoutData.redirect_url,
      // Ajout des informations client si disponibles
      ...(formData.email && {
        customer_email: formData.email
      }),
      ...(formData.phone && {
        customer_phone: formData.phone
      })
    };

    console.log('Payload envoyé à SumUp:', JSON.stringify(sumupPayload, null, 2));

    // Appel API SumUp
    const sumupResponse = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.SUMUP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(sumupPayload)
    });

    // Gestion des erreurs
    if (!sumupResponse.ok) {
      const errorText = await sumupResponse.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      console.error('❌ ERREUR SUMUP API:');
      console.error('Status:', sumupResponse.status);
      console.error('Response:', errorData);
      
      // Messages d'erreur spécifiques
      let errorMessage = 'Erreur lors de la création du checkout';
      
      if (sumupResponse.status === 401) {
        errorMessage = 'Token d\'authentification invalide ou expiré';
      } else if (sumupResponse.status === 404) {
        errorMessage = 'Endpoint API non trouvé - vérifiez l\'URL et vos credentials';
      } else if (sumupResponse.status === 422) {
        errorMessage = errorData.message || 'Données de paiement invalides';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: errorData,
          status: sumupResponse.status
        }), 
        { 
          status: sumupResponse.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const checkoutResult = await sumupResponse.json();
    
    console.log('✅ Checkout créé avec succès:', checkoutResult.id);

    // Construction de l'URL de paiement
    const checkoutUrl = `https://pay.sumup.com/${checkoutResult.id}`;
    
    console.log('URL de paiement:', checkoutUrl);

    // TODO: Sauvegarder la commande dans votre base de données
    // await saveOrder({
    //   checkoutId: checkoutResult.id,
    //   reference: checkoutData.checkout_reference,
    //   customer: formData,
    //   cart: cart,
    //   amount: checkoutData.amount,
    //   currency: checkoutData.currency,
    //   status: 'pending',
    //   createdAt: new Date()
    // });

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkoutUrl: checkoutUrl,
        checkoutId: checkoutResult.id,
        reference: checkoutData.checkout_reference
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ ERREUR SERVEUR:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erreur serveur lors du traitement du paiement',
        message: error.message 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};