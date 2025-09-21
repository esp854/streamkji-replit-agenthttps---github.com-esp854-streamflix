import { useState } from "react";
import axios from "axios";

const plans = [
  { key: "basic", name: "Basic", price: 2000 },
  { key: "standard", name: "Standard", price: 5000 },
  { key: "premium", name: "Premium", price: 10000 }
];

export default function Payment() {
  const [qrCode, setQrCode] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [status, setStatus] = useState("");

  const handlePayment = async (planKey) => {
    try {
      const res = await axios.post("http://localhost:5000/api/create-payment", { planKey });
      setQrCode(res.data.qrCode);
      setPaymentId(res.data.paymentId);
      setStatus("");
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      alert("Erreur lors de la création du paiement");
    }
  };

  const checkPayment = async () => {
    if (!paymentId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/check-payment/${paymentId}`);
      setStatus(res.data.status); // completed, pending, failed
      
      // Si le paiement est réussi, activer l'abonnement
      if (res.data.status === "completed") {
        alert("Paiement réussi ! Votre abonnement a été activé.");
        // Ici, vous pouvez appeler une fonction pour activer l'abonnement dans votre base de données
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du paiement:", error);
      alert("Erreur lors de la vérification du paiement");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Choisissez un plan d'abonnement :</h1>
      
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {plans.map(plan => (
          <div 
            key={plan.key} 
            style={{ 
              border: "1px solid #ddd", 
              borderRadius: "8px", 
              padding: "20px", 
              width: "200px",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            <h2>{plan.name}</h2>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>{plan.price} XOF</p>
            <button 
              onClick={() => handlePayment(plan.key)}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Choisir ce plan
            </button>
          </div>
        ))}
      </div>

      {qrCode && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <h3>Scannez le QR code pour payer :</h3>
          <img src={qrCode} alt="QR Code paiement" style={{ width: "200px", height: "200px" }} />
          <p>
            <a 
              href={qrCode} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Ouvrir le QR code dans un nouvel onglet
            </a>
          </p>
          <button 
            onClick={checkPayment}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "10px"
            }}
          >
            Vérifier le statut du paiement
          </button>
        </div>
      )}

      {status && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h3>Statut du paiement : 
            <span style={{ 
              color: status === "completed" ? "#28a745" : 
                     status === "pending" ? "#ffc107" : "#dc3545",
              fontWeight: "bold"
            }}>
              {" "}{status}
            </span>
          </h3>
        </div>
      )}
    </div>
  );
}