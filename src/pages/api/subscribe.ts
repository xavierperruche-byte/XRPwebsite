// src/pages/api/subscribe.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const email = data.email;

    if (!email) {
      return new Response(JSON.stringify({ error: "L'adresse email est requise." }), { status: 400 });
    }

    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const SERVER = process.env.MAILCHIMP_SERVER;

    // URL de l'API de Mailchimp pour ajouter un membre
    const url = `https://${SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`user:${API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed', // Utilisez 'pending' si vous voulez activer le Double Opt-In (confirmation par mail)
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Gérer le cas où l'utilisateur est déjà inscrit
      if (result.title === "Member Exists") {
        return new Response(JSON.stringify({ error: "Vous êtes déjà inscrit à la newsletter !" }), { status: 400 });
      }
      return new Response(JSON.stringify({ error: result.detail || "Une erreur est survenue avec Mailchimp." }), { status: response.status });
    }

    return new Response(JSON.stringify({ message: "Inscription réussie !" }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Erreur interne du serveur." }), { status: 500 });
  }
};