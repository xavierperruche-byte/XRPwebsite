import { useState } from "react";

export default function AddToCart({ product }) {
  const [message, setMessage] = useState("");

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));

    // Afficher un message temporaire
    setMessage(`${product.name} a été ajouté au panier ✅`);

    // Effacer le message après 3 secondes
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div>
      <button onClick={addToCart}>Ajouter au panier</button>
      {message && <p style={{ color: "green", marginTop: "8px" }}>{message}</p>}
    </div>
  );
}