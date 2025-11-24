export async function post({ request }: { request: Request }) {
  const body = await request.json();

  // Exemple avec SumUp
  const res = await fetch("https://api.sumup.com/v0.1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.SUMUP_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: body.amount,
      currency: "EUR",
      checkout_reference: body.productId,
      description: "Commande Astro Shop"
    })
  });

  const checkout = await res.json();
  return new Response(JSON.stringify({ checkout_url: checkout.checkout_url }), {
    status: 200
  });
}