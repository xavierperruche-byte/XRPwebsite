import { useState, useEffect } from "react";
import './CheckoutForm.css';

export default function CheckoutForm() {
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1); // 1: Info, 2: Review, 3: Payment, 4: Success
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'CH',
    acceptTerms: false,
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    setIsLoading(false);

    // Rediriger si le panier est vide
    if (savedCart.length === 0) {
      setTimeout(() => {
        window.location.href = '/catalog';
      }, 2000);
    }
  }, []);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep1 = () => {
    const required = ['firstName', 'lastName', 'email', 'phone'];
    for (let field of required) {
      if (!formData[field]) {
        setError(`Le champ ${field} est requis`);
        return false;
      }
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email invalide");
      return false;
    }

    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    
    if (step === 2 && !formData.acceptTerms) {
      setError("Vous devez accepter les conditions générales");
      return;
    }

    setError(null);
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    setError(null);
  };

  const handleSumUpPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const total = calculateTotal();
      const currency = cart[0]?.currency || 'CHF';
      
      // Créer un checkout SumUp
      const checkoutData = {
        checkout_reference: `ORDER-${Date.now()}`,
        amount: total,
        currency: currency,
        description: `Commande We The Agency - ${cart.length} article(s)`,
        redirect_url: `${window.location.origin}/checkout/success`,
        customer: {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone
        }
      };

      // Appeler votre API backend qui communique avec SumUp
      const response = await fetch('/api/create-sumup-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutData,
          formData,
          cart
        })
      });

      const result = await response.json();

      if (result.success && result.checkoutUrl) {
        // Rediriger vers la page de paiement SumUp
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error(result.error || 'Erreur lors de la création du paiement');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Une erreur est survenue lors du paiement');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="checkout-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
          <h2>Votre panier est vide</h2>
          <p>Redirection vers le catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Hero */}
      <section className="checkout-hero">
        <div className="hero-content">
          <h1 className="hero-title">Finaliser ma commande</h1>
          <p className="hero-subtitle">Paiement sécurisé par SumUp</p>
        </div>
      </section>

      <div className="checkout-container">
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">
              {step > 1 ? (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              ) : '1'}
            </div>
            <span className="step-label">Informations</span>
          </div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">
              {step > 2 ? (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              ) : '2'}
            </div>
            <span className="step-label">Vérification</span>
          </div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span className="step-label">Paiement</span>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
            {error}
          </div>
        )}

        <div className="checkout-grid">
          {/* Formulaire */}
          <div className="checkout-form">
            
            {/* Step 1: Informations */}
            {step === 1 && (
              <div className="form-section">
                <h2>Vos informations</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Prénom *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Nom *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Téléphone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="company">Entreprise (optionnel)</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>

                <h3>Adresse de facturation</h3>

                <div className="form-group">
                  <label htmlFor="address">Adresse</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">Ville</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="postalCode">Code postal</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="country">Pays</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="CH">Suisse</option>
                    <option value="FR">France</option>
                    <option value="DE">Allemagne</option>
                    <option value="IT">Italie</option>
                    <option value="AT">Autriche</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button onClick={handleNextStep} className="btn-next">
                    Continuer
                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="form-section">
                <h2>Vérification de votre commande</h2>
                
                <div className="review-section">
                  <h3>Informations personnelles</h3>
                  <div className="review-data">
                    <p><strong>Nom:</strong> {formData.firstName} {formData.lastName}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Téléphone:</strong> {formData.phone}</p>
                    {formData.company && <p><strong>Entreprise:</strong> {formData.company}</p>}
                  </div>
                </div>

                {formData.address && (
                  <div className="review-section">
                    <h3>Adresse de facturation</h3>
                    <div className="review-data">
                      <p>{formData.address}</p>
                      <p>{formData.postalCode} {formData.city}</p>
                      <p>{formData.country}</p>
                    </div>
                  </div>
                )}

                <div className="review-section">
                  <h3>Articles commandés</h3>
                  <div className="review-items">
                    {cart.map((item, index) => (
                      <div key={index} className="review-item">
                        <img src={item.image} alt={item.name} />
                        <div className="review-item-details">
                          <h4>{item.name}</h4>
                          <p>Quantité: {item.quantity || 1}</p>
                        </div>
                        <div className="review-item-price">
                          {(item.price * (item.quantity || 1)).toFixed(2)} {item.currency}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="terms-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                    />
                    <span>
                      J'accepte les <a href="/terms" target="_blank">conditions générales</a> et 
                      la <a href="/privacy" target="_blank">politique de confidentialité</a>
                    </span>
                  </label>
                </div>

                <div className="form-actions">
                  <button onClick={handlePreviousStep} className="btn-back">
                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Retour
                  </button>
                  <button onClick={handleNextStep} className="btn-next" disabled={!formData.acceptTerms}>
                    Continuer vers le paiement
                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="form-section">
                <h2>Paiement sécurisé</h2>
                
                <div className="payment-info">
                  <div className="payment-provider">
                    <img src="/images/logo_sumup.svg" alt="SumUp" className="sumup-logo" />
                    <p>Votre paiement est sécurisé par SumUp</p>
                  </div>

                  <div className="payment-methods">
                    <h3>Méthodes de paiement acceptées</h3>
                    <div className="payment-icons">
                      {/* Visa */}
                      <div className="payment-card visa">
                        <svg width="80px" height="80px" viewBox="0 0 141.732 141.732" xmlns="http://www.w3.org/2000/svg">
                          <g
                            fill="#2566af"
                            id="g4">
                            <path
                              d="m 62.935,89.571 h -9.733 l 6.083,-37.384 h 9.734 z M 45.014,52.187 35.735,77.9 34.637,72.363 34.638,72.365 31.363,55.553 c 0,0 -0.396,-3.366 -4.617,-3.366 h -15.34 l -0.18,0.633 c 0,0 4.691,0.976 10.181,4.273 l 8.456,32.479 H 40.004 L 55.489,52.187 Z m 76.555,37.384 h 8.937 l -7.792,-37.385 h -7.824 c -3.613,0 -4.493,2.786 -4.493,2.786 L 95.881,89.571 h 10.146 l 2.029,-5.553 h 12.373 z m -10.71,-13.224 5.114,-13.99 2.877,13.99 z m -14.217,-15.17 1.389,-8.028 c 0,0 -4.286,-1.63 -8.754,-1.63 -4.83,0 -16.3,2.111 -16.3,12.376 0,9.658 13.462,9.778 13.462,14.851 0,5.073 -12.075,4.164 -16.06,0.965 l -1.447,8.394 c 0,0 4.346,2.111 10.986,2.111 6.642,0 16.662,-3.439 16.662,-12.799 0,-9.72 -13.583,-10.625 -13.583,-14.851 0.001,-4.227 9.48,-3.684 13.645,-1.389 z"
                              id="path2" />
                          </g>
                          <path
                            d="M 34.638,72.364 31.363,55.552 c 0,0 -0.396,-3.366 -4.617,-3.366 h -15.34 l -0.18,0.633 c 0,0 7.373,1.528 14.445,7.253 6.762,5.472 8.967,12.292 8.967,12.292 z"
                            fill="#e6a540"
                            id="path6" />
                          <path
                            fill="none"
                            d="M 0,0 H 141.732 V 141.732 H 0 Z"
                            id="path8" />
                        </svg>
                        <span><p>Visa</p></span>
                      </div>
                      
                      {/* Mastercard */}
                      <div className="payment-card mastercard">
                        <svg width="80px" height="80px" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
                          <rect width="48" height="32" rx="4" fill="#EB001B"/>
                          <circle cx="19" cy="16" r="8" fill="#FF5F00"/>
                          <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
                        </svg>
                        <span><p>Mastercard</p></span>
                      </div>                    
                    </div>
                  </div>

                  <div className="security-badges">
                    <div className="badge-item">
                      <svg className="badge-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                      </svg>
                      <span>Paiement SSL sécurisé</span>
                    </div>
                    <div className="badge-item">
                      <svg className="badge-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span>Protection acheteur</span>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button onClick={handlePreviousStep} className="btn-back">
                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Retour
                  </button>
                  <button 
                    onClick={handleSumUpPayment} 
                    className="btn-pay"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="mini-loader"></div>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        Payer {calculateTotal().toFixed(2)} {cart[0]?.currency || 'CHF'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Récapitulatif */}
          <div className="order-summary">
            <h2>Récapitulatif</h2>
            
            <div className="summary-items">
              {cart.map((item, index) => (
                <div key={index} className="summary-item">
                  <div className="summary-item-info">
                    <h4>{item.name}</h4>
                    <p>Qté: {item.quantity || 1}</p>
                  </div>
                  <div className="summary-item-price">
                    {(item.price * (item.quantity || 1)).toFixed(2)} {item.currency}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Sous-total</span>
                <span>{calculateTotal().toFixed(2)} {cart[0]?.currency || 'CHF'}</span>
              </div>
              <div className="summary-row">
                <span>TVA (incluse)</span>
                <span>0.00 {cart[0]?.currency || 'CHF'}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{calculateTotal().toFixed(2)} {cart[0]?.currency || 'CHF'}</span>
              </div>
            </div>

            <div className="summary-help">
              <p>Besoin d'aide ?</p>
              <a href="/contact">Contactez-nous</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}