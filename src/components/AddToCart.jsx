import { useState } from "react";
import './AddToCart.css';

export default function AddToCart({ product }) {
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  function addToCart() {
    // Animation du bouton
    setIsAdding(true);
    
    // Récupérer le panier existant
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Ajouter le produit avec toutes ses informations
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
      quantity: 1,
      addedAt: new Date().toISOString()
    });
    
    // Sauvegarder dans localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Dispatch event pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { itemCount: cart.length } 
    }));

    // Afficher un message de succès
    setMessage(`${product.name} a été ajouté au panier ✅`);

    // Réinitialiser après 3 secondes
    setTimeout(() => {
      setMessage("");
      setIsAdding(false);
    }, 3000);
  }

  return (
    <div className="add-to-cart-wrapper">
      <button 
        className={`btn-add-cart ${isAdding ? 'adding' : ''}`}
        onClick={addToCart}
        disabled={isAdding}
      >
        <svg className="cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>{isAdding ? 'Ajout en cours...' : 'Ajouter au panier'}</span>
      </button>
      
      {message && (
        <div className="success-message">
          <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd"
            />
          </svg>
          {message}
        </div>
      )}
    </div>
  );
}