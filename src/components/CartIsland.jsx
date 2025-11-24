import { useState } from "react";

export default function CartIsland({ product }) {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: product.price, productId: product.id })
    });
    const data = await res.json();
    window.location.href = data.checkout_url; // Redirection vers SumUp/Wero
  }

  return (
    <button disabled={loading} onClick={checkout}>
      {loading ? "Redirection..." : "Acheter maintenant"}
    </button>
  );
}