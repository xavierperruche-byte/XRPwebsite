import { useState, useEffect } from "react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);

  // Charger le panier depuis localStorage
  function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
  }

  useEffect(() => {
    loadCart();
  }, []);

  // Supprimer un article par son index
  function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.splice(index, 1); // Retirer l’élément
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartItems(cart); // Mettre à jour l’état
  }

  // Vider complètement le panier
  function clearCart() {
    localStorage.removeItem("cart");
    setCartItems([]);
  }

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      <h1>🛒 Mon panier</h1>
      {cartItems.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <ul>
          {cartItems.map((item, i) => (
            <li key={i}>
              {item.name} — {item.price} {item.currency}
              <button
                style={{ marginLeft: "10px", color: "red" }}
                onClick={() => removeItem(i)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
      <h2>Total : {total.toFixed(2)} EUR</h2>

      {cartItems.length > 0 && (
        <button
          style={{ marginTop: "10px", backgroundColor: "orange" }}
          onClick={clearCart}
        >
          Vider le panier
        </button>
      )}
    </div>
  );
}