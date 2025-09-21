// examples/lygos-payment-example.ts
// Example of how to integrate Lygos payment in your application

import express from "express";

// Backend: Create payment endpoint
const router = express.Router();
const LYGOS_API_KEY = process.env.LYGOS_API_KEY || "your_lygos_api_key_here";

// Subscription plans
const plans = { 
  basic: 2000, 
  standard: 3000, 
  premium: 4000 
};

// 1. Create payment endpoint
router.post("/create-payment", async (req, res) => {
  const { plan, customerInfo } = req.body;
  
  const amount = plans[plan as keyof typeof plans];

  try {
    // Call Lygos API to create payment
    const response = await fetch("https://api.lygosapp.com/v1/gateway", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${LYGOS_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: `Plan ${plan}`,
        description: `Abonnement ${plan}`,
        amount: amount,
        currency: "XOF",
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone || ""
        },
        success_url: "https://yourwebsite.com/success",
        cancel_url: "https://yourwebsite.com/cancel",
        webhook_url: "https://yourwebsite.com/api/webhook/lygos"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lygos API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    res.json({
      paymentLink: data.payment_url,
      qrCode: data.qr_code_url,
      token: data.token
    });

  } catch (error: any) {
    console.error("Lygos API error:", error.message);
    res.status(500).json({ 
      error: "Erreur lors de la création du paiement",
      details: error.message
    });
  }
});

// 2. Check payment status endpoint
router.get("/check-payment/:payment_token", async (req, res) => {
  const { payment_token } = req.params;

  try {
    const response = await fetch(
      `https://api.lygosapp.com/v1/gateway/${payment_token}`,
      { 
        headers: { 
          "Authorization": `Bearer ${LYGOS_API_KEY}` 
        } 
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lygos API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    res.json({ 
      status: data.status,
      paymentData: data
    });
  } catch (error: any) {
    console.error("Lygos API error:", error.message);
    res.status(500).json({ 
      error: "Erreur lors de la vérification du paiement",
      details: error.message
    });
  }
});

// 3. Webhook endpoint to receive payment notifications
router.post("/webhook/lygos", async (req, res) => {
  try {
    const paymentData = req.body;
    const { id, status } = paymentData;
    
    console.log("Lygos webhook received:", paymentData);
    
    // Process the payment based on status
    if (status === "completed") {
      // Activate subscription in your database
      // Send confirmation email
      console.log("Payment completed for token:", id);
    } else if (status === "failed" || status === "cancelled") {
      // Handle failed payment
      console.log("Payment failed or cancelled for token:", id);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;

// Frontend React component example
/*
import { useState } from "react";

const plans = [
  { key: "basic", name: "Basic", price: 2000 },
  { key: "standard", name: "Standard", price: 3000 },
  { key: "premium", name: "Premium", price: 4000 }
];

export default function Payment() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "" });
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handlePayment = async (planKey) => {
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          plan: planKey,
          customerInfo: customerInfo
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création du paiement");
      }
      
      setPaymentData(data);
      
      // Start polling for payment status
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/check-payment/${data.token}`);
        const statusData = await statusRes.json();
        
        if (!statusRes.ok) {
          throw new Error(statusData.error || "Erreur lors de la vérification du paiement");
        }
        
        setPaymentStatus(statusData.status);
        
        if (statusData.status === "completed") {
          clearInterval(pollInterval);
          alert("Paiement réussi!");
        } else if (statusData.status === "failed" || statusData.status === "cancelled") {
          clearInterval(pollInterval);
          alert("Paiement échoué ou annulé");
        }
      }, 5000); // Check every 5 seconds
    } catch (error) {
      console.error("Payment error:", error);
      alert("Erreur lors de la création du paiement: " + error.message);
    }
  };

  return (
    <div>
      <h1>Choisissez votre plan</h1>
      
      {plans.map(plan => (
        <div key={plan.key} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
          <h2>{plan.name} - {plan.price} XOF</h2>
          <button onClick={() => handlePayment(plan.key)}>Payer ce plan</button>
        </div>
      ))}

      {paymentData && (
        <div>
          <h3>Scannez le QR code pour payer :</h3>
          <img src={paymentData.qrCode} alt="QR Code paiement" />
          <p>Ou cliquez sur le lien : <a href={paymentData.paymentLink} target="_blank">Payer maintenant</a></p>
          
          {paymentStatus && (
            <div>
              <p>Status du paiement: {paymentStatus}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
*/

// Usage instructions:
// 1. Set your LYGOS_API_KEY in environment variables
// 2. Use the backend endpoints to create payments and check status
// 3. Implement the frontend component to display plans and QR codes
// 4. Handle webhooks to automatically process completed payments