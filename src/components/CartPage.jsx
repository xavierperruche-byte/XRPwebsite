import { useState, useEffect } from "react";
import './CartPage.css';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger le panier depuis localStorage
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(savedCart);
      setIsLoading(false);
    };

    loadCart();

    // Écouter les mises à jour du panier
    window.addEventListener('cartUpdated', loadCart);
    window.addEventListener('storage', loadCart);

    return () => {
      window.removeEventListener('cartUpdated', loadCart);
      window.removeEventListener('storage', loadCart);
    };
  }, []);

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { itemCount: newCart.length } 
    }));
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const clearCart = () => {
    if (confirm("Êtes-vous sûr de vouloir vider votre panier ?")) {
      setCart([]);
      localStorage.removeItem("cart");
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { itemCount: 0 } 
      }));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  };

  const handleCheckout = () => {
    // Redirection vers la page de paiement
    window.location.href = '/checkout';
  };

  if (isLoading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Chargement du panier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Hero Section */}
      <section className="cart-hero">
        <div className="hero-content">
          <h1 className="hero-title">Mon Panier</h1>
          <p className="hero-subtitle">
            {cart.length === 0 
              ? "Votre panier est vide" 
              : `${cart.length} article${cart.length > 1 ? 's' : ''} dans votre panier`
            }
          </p>
        </div>
      </section>

      <div className="cart-container">
        {cart.length === 0 ? (
          // Panier vide
          <div className="empty-cart">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <h2>Votre panier est vide</h2>
            <p>Découvrez nos produits et commencez vos achats</p>
            <a href="/catalog" className="btn-browse">
              Voir le catalogue
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </a>
          </div>
        ) : (
          // Panier avec produits
          <div className="cart-grid">
            {/* Liste des produits */}
            <div className="cart-items">
              <div className="cart-header">
                <h2>Articles ({cart.length})</h2>
                <button onClick={clearCart} className="btn-clear">
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Vider le panier
                </button>
              </div>

              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-id">Réf: {item.id}</p>
                    <div className="item-price-mobile">
                      <span className="price-amount">{item.price}</span>
                      <span className="price-currency">{item.currency}</span>
                    </div>
                  </div>

                  <div className="item-quantity">
                    <label>Quantité</label>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                        className="qty-btn"
                        disabled={(item.quantity || 1) <= 1}
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                        </svg>
                      </button>
                      <input 
                        type="number" 
                        value={item.quantity || 1}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                        className="qty-input"
                        min="1"
                      />
                      <button 
                        onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                        className="qty-btn"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="item-price">
                    <span className="price-amount">{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                    <span className="price-currency">{item.currency}</span>
                  </div>

                  <button 
                    onClick={() => removeItem(index)}
                    className="btn-remove"
                    aria-label="Supprimer"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Récapitulatif */}
            <div className="cart-summary">
              <h2>Récapitulatif</h2>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Sous-total</span>
                  <span className="summary-value">
                    {calculateTotal().toFixed(2)} {cart[0]?.currency || 'CHF'}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Livraison</span>
                  <span className="summary-value free">Gratuite</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span className="summary-value">
                    {calculateTotal().toFixed(2)} {cart[0]?.currency || 'CHF'}
                  </span>
                </div>
              </div>

              <button onClick={handleCheckout} className="btn-checkout">
                Procéder au paiement
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>

              <a href="/catalog" className="btn-continue">
                Continuer mes achats
              </a>

              <div className="trust-section">
                <div className="trust-item">
                  <svg className="trust-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Paiement sécurisé</span>
                </div>
                <div className="trust-item">
                  <svg className="trust-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"></path>
                  </svg>
                  <span>Livraison gratuite</span>
                </div>
                <div className="trust-item">
                  <svg className="trust-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span>Garantie satisfait</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Produits recommandés */}
        {cart.length > 0 && (
          <div className="recommendations">
            <h2>Vous aimerez aussi</h2>
            <p className="recommendations-subtitle">Découvrez nos autres produits</p>
            <div className="recommendations-grid">
              {/* Vous pouvez charger d'autres produits ici */}
              <a href="/catalog" className="recommendation-card">
                <div className="recommendation-content">
                  <h3>Découvrir le catalogue</h3>
                  <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}