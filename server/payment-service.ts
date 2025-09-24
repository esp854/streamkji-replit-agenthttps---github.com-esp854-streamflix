import { plans } from "./plans";

// Define types for our payment service
export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface PaymentResponse {
  paymentLink?: string;
  qrCode?: string;
  paymentId?: string;
  success?: boolean;
  approval_url?: string;
  error?: string;
  message?: string;
}

export interface PaymentStatus {
  id: string;
  status: string;
  amount: number;
  currency: string;
  custom_data?: any;
}

// Payment service class to handle different payment providers
export class PaymentService {
  private lygosApiKey: string;
  private lygosApiBaseUrl: string;
  private clientUrl: string;

  constructor() {
    this.lygosApiKey = process.env.LYGOS_API_KEY || '';
    // Use the correct endpoint from environment variables
    // Remove trailing slash and /v1 if present, as we'll add it in the requests
    let baseUrl = process.env.LYGOS_API_BASE_URL || 'https://api.lygosapp.com';
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    if (baseUrl.endsWith('/v1')) {
      baseUrl = baseUrl.slice(0, -3);
    }
    this.lygosApiBaseUrl = baseUrl;
    this.clientUrl = process.env.CLIENT_URL || 'https://your-app-url.onrender.com';
  }

  // Check if the payment service is properly configured
  isConfigured(): boolean {
    return !!this.lygosApiKey && !!this.lygosApiBaseUrl;
  }

  // Create a payment using Lygos
  async createLygosPayment(
    planId: string,
    customerInfo: CustomerInfo,
    userId: string
  ): Promise<PaymentResponse> {
    try {
      // Validate plan
      if (!plans[planId as keyof typeof plans]) {
        throw new Error("Plan invalide");
      }

      const selectedPlan = plans[planId as keyof typeof plans];
      const description = `Abonnement ${selectedPlan.name} - ${selectedPlan.amount} FCFA`;

      // For free plans, no payment is needed - return success immediately
      if (selectedPlan.amount === 0) {
        return {
          success: true,
          message: 'Abonnement gratuit activé avec succès'
        };
      }

      // Check if Lygos is configured
      if (!this.isConfigured()) {
        throw new Error("Service de paiement Lygos non configuré");
      }

      // Log the request data for debugging
      const webhookBase = process.env.BASE_URL || process.env.APP_URL || 'https://your-app-url.onrender.com';
      const requestData = {
        amount: selectedPlan.amount,
        shop_name: `StreamFlix - Plan ${selectedPlan.name}`,
        order_id: `subscription_${userId}_${planId}_${Date.now()}`,
        message: description,
        success_url: `${this.clientUrl}/subscription?payment=success`,
        failure_url: `${this.clientUrl}/subscription?payment=failed`,
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone || ""
        }
      };
      
      console.log('Sending request to Lygos API:', {
        url: `${this.lygosApiBaseUrl}/v1/gateway`,
        headers: {
          "api-key": this.lygosApiKey,
          "Content-Type": "application/json"
        },
        body: requestData
      });

      // Create payment with Lygos using the correct API format
      const response = await fetch(`${this.lygosApiBaseUrl}/v1/gateway`, {
        method: "POST",
        headers: {
          "api-key": this.lygosApiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      console.log('Lygos API response status:', response.status);
      // Convert headers to array properly
      const headersArray: [string, string][] = [];
      response.headers.forEach((value, key) => {
        headersArray.push([key, value]);
      });
      console.log('Lygos API response headers:', headersArray);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lygos API error response:', errorText);
        const errorMessage = `Lygos API error: ${response.status} ${response.statusText} - ${errorText}`;
        throw new Error(errorMessage);
      }

      const paymentData = await response.json();
      console.log('Lygos API success response:', paymentData);
      
      // Map common Lygos response fields
      return {
        paymentLink: paymentData.link || paymentData.payment_url || paymentData.paymentLink,
        approval_url: paymentData.approval_url,
        paymentId: paymentData.id || paymentData.token || paymentData.paymentId,
        qrCode: paymentData.qr_code_url || paymentData.qrCode,
        success: true
      };
    } catch (error: any) {
      console.error("Error creating Lygos payment:", error);
      // Provide more detailed error information
      const errorMessage = error.message || 'Unknown error occurred while creating payment';
      throw new Error(`Erreur lors de la création du paiement: ${errorMessage}`);
    }
  }

  // Check payment status with Lygos
  async checkLygosPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      // Check if Lygos is configured
      if (!this.isConfigured()) {
        throw new Error("Service de paiement Lygos non configuré");
      }

      // Check payment status with Lygos
      const response = await fetch(`${this.lygosApiBaseUrl}/v1/gateway/${paymentId}`, {
        headers: {
          "api-key": this.lygosApiKey,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lygos API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const paymentData = await response.json();
      return paymentData;
    } catch (error: any) {
      console.error("Error checking Lygos payment status:", error);
      throw new Error(`Erreur lors de la vérification du paiement: ${error.message}`);
    }
  }

  // Process webhook from Lygos
  async processLygosWebhook(paymentData: any): Promise<{ success: boolean; message?: string }> {
    try {
      console.log("Processing Lygos webhook:", paymentData);
      
      const { id, status, custom_data } = paymentData;
      
      // Process the payment based on status
      if (status === "completed") {
        // Activate subscription in your database
        if (custom_data && custom_data.userId && custom_data.planId) {
          console.log("Lygos payment completed for payment ID:", id);
          return { success: true, message: "Payment completed successfully" };
        }
      } else if (status === "failed" || status === "cancelled") {
        // Handle failed payment
        console.log("Lygos payment failed or cancelled for payment ID:", id);
        return { success: true, message: "Payment failed or cancelled" };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error processing Lygos webhook:", error);
      throw new Error("Failed to process webhook");
    }
  }
}

// Export a singleton instance of the payment service
export const paymentService = new PaymentService();