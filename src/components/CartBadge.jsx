import { useState, useEffect } from "react";
import './CartBadge.css';

export default function CartBadge() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Fonction pour mettre à jour le compteur
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setItemCount(cart.length);
    };

    // Mise à jour initiale
    updateCount();

    // Écouter les événements de mise à jour du panier
    window.addEventListener('cartUpdated', updateCount);
    
    // Écouter les changements de localStorage (pour la synchronisation entre onglets)
    window.addEventListener('storage', updateCount);

    // Nettoyage
    return () => {
      window.removeEventListener('cartUpdated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  return (
    <a href="/cart" className="cart-badge-link">
      <svg 
        className="cart-badge-icon" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="cart-badge-count">{itemCount}</span>
      )}
    </a>
  );
}