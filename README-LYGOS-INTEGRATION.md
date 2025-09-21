# Lygos Payment Integration Guide

This guide explains how to integrate Lygos payment gateway into your application for mobile money payments in West Africa.

## 📋 Prerequisites

1. **Lygos Account**: Sign up at [Lygos](https://lygos.app) to get your API keys
2. **API Key**: Obtain your `LYGOS_API_KEY` from the dashboard
3. **Supported Payment Methods**: Orange Money, MTN Mobile Money, Wave

## 🛠️ Backend Implementation

### 1. Environment Configuration

Set your Lygos API key in your environment variables:

```bash
LYGOS_API_KEY=your_actual_api_key_here
```

### 2. Create Payment Endpoint

```typescript
// POST /api/create-payment
const createPayment = async (req, res) => {
  const { plan, customerInfo } = req.body;
  
  const plans = { basic: 2000, standard: 3000, premium: 4000 };
  const amount = plans[plan];

  try {
    const response = await fetch("https://api.lygosapp.com/v1/gateway", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LYGOS_API_KEY}`,
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
      throw new Error(`Lygos API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      paymentLink: data.payment_url,
      qrCode: data.qr_code_url,
      token: data.token
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur création paiement");
  }
};
```

### 3. Check Payment Status

```typescript
// GET /api/check-payment/:payment_token
const checkPaymentStatus = async (req, res) => {
  const { payment_token } = req.params;

  try {
    const response = await fetch(
      `https://api.lygosapp.com/v1/gateway/${payment_token}`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.LYGOS_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Lygos API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({ status: data.status });
  } catch (error) {
    res.status(500).send("Erreur vérification paiement");
  }
};
```

### 4. Webhook Handler

```typescript
// POST /api/webhook/lygos
const handleWebhook = async (req, res) => {
  try {
    const paymentData = req.body;
    const { id, status } = paymentData;
    
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
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};
```

## 🖥️ Frontend Implementation

### React Component Example

```jsx
import { useState } from "react";

const plans = [
  { key: "basic", name: "Basic", price: 2000 },
  { key: "standard", name: "Standard", price: 3000 },
  { key: "premium", name: "Premium", price: 4000 }
];

export default function Payment() {
  const [qrCode, setQrCode] = useState(null);

  const handlePayment = async (planKey) => {
    const res = await fetch("/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        plan: planKey,
        customerInfo: {
          name: "John Doe",
          email: "john@example.com",
          phone: "+22500000000"
        }
      })
    });
    const data = await res.json();
    setQrCode(data.qrCode);
  };

  return (
    <div>
      {plans.map(plan => (
        <div key={plan.key}>
          <h2>{plan.name} - {plan.price} XOF</h2>
          <button onClick={() => handlePayment(plan.key)}>Payer ce plan</button>
        </div>
      ))}

      {qrCode && (
        <div>
          <h3>Scannez le QR code pour payer :</h3>
          <img src={qrCode} alt="QR Code paiement" />
        </div>
      )}
    </div>
  );
}
```

## 🔁 Payment Verification

### Option 1: Polling

Check payment status every 5 seconds:

```javascript
const pollPaymentStatus = async (token) => {
  const pollInterval = setInterval(async () => {
    const res = await fetch(`/api/check-payment/${token}`);
    const data = await res.json();
    
    if (data.status === "completed") {
      clearInterval(pollInterval);
      // Payment successful - activate subscription
    } else if (data.status === "failed" || data.status === "cancelled") {
      clearInterval(pollInterval);
      // Payment failed - show error
    }
  }, 5000);
};
```

### Option 2: Webhooks (Recommended)

Lygos will automatically send payment status updates to your webhook URL.

## ✅ Final Workflow

1. User selects a subscription plan
2. User clicks "Pay" button
3. Backend creates payment via Lygos API
4. QR code or payment link is displayed to user
5. User pays via Orange Money / MTN Mobile Money / Wave
6. Payment is verified either through:
   - Webhook notification (automatic)
   - Polling (manual check)
7. Subscription is activated in your database
8. User receives confirmation

## 💰 Supported Payment Methods

- 🍊 **Orange Money** (Côte d'Ivoire, Senegal, Burkina Faso)
- 📱 **MTN Mobile Money** (Côte d'Ivoire, Ghana, Uganda)
- 🌊 **Wave** (Côte d'Ivoire, Senegal)

## 📞 Support

For issues with the integration, contact:
- Lygos Support: support@lygos.app
- API Documentation: https://docs.lygos.app