export const POST = async ({ request }) => {
  try {
    const body = await request.json();

    // On envoie les données du formulaire directement à Render
    const response = await fetch('https://robot001.onrender.com/run', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chasseur_goal: body.chasseur_goal,
        chasseur_backstory: body.chasseur_backstory,
        expert_goal: body.expert_goal,
        expert_backstory: body.expert_backstory
      })
    });

    if (!response.ok) {
        throw new Error(`Erreur Render: ${response.statusText}`);
    }

    const data = await response.json();
    
    // On renvoie le résultat de l'IA à l'interface
    return new Response(JSON.stringify(data), { status: 200 });

  } catch (error) {
    console.error("Erreur relayée:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
