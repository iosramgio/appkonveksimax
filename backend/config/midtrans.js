const axios = require("axios");
const crypto = require("crypto");

/**
 * Midtrans Payment Gateway Configuration
 */
class MidtransClient {
  constructor() {
    this.isProduction = process.env.MIDTRANS_PRODUCTION === "true";
    this.serverKey = process.env.MIDTRANS_SERVER_KEY;
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY;
    this.baseUrl = this.isProduction
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";
  }

  /**
   * Create charge for virtual account payment
   * @param {Object} chargeParams - Charge parameters
   * @returns {Promise} - API response
   */
  async createVirtualAccountCharge(chargeParams) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/charge`,
        chargeParams,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${Buffer.from(this.serverKey + ":").toString(
              "base64"
            )}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Midtrans VA charge error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Get transaction status from Midtrans
   * @param {string} transactionId - Midtrans transaction ID
   * @returns {Promise} - API response
   */
  async getTransactionStatus(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v2/${transactionId}/status`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${Buffer.from(this.serverKey + ":").toString(
              "base64"
            )}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Midtrans status error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Verify notification signature from Midtrans
   * @param {Object} notification - Notification data
   * @returns {boolean} - Is notification valid
   */
  verifyNotification(notification) {
    if (!notification || !notification.signature_key) {
      return false;
    }

    try {
      // Reconstruct the signature
      const orderId = notification.order_id;
      const statusCode = notification.status_code;
      const grossAmount = notification.gross_amount;
      const serverKey = this.serverKey;

      const data = `${orderId}${statusCode}${grossAmount}${serverKey}`;
      const expectedSignature = crypto
        .createHash("sha512")
        .update(data)
        .digest("hex");

      return expectedSignature === notification.signature_key;
    } catch (error) {
      console.error("Midtrans notification verification error:", error);
      return false;
    }
  }

  /**
   * Cancel transaction
   * @param {string} transactionId - Midtrans transaction ID
   * @returns {Promise} - API response
   */
  async cancelTransaction(transactionId) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/${transactionId}/cancel`,
        {},
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(this.serverKey + ":").toString(
              "base64"
            )}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Midtrans cancel error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Get Midtrans client configuration for frontend
   * @returns {Object} - Client configuration
   */
  getClientConfig() {
    return {
      clientKey: this.clientKey,
      isProduction: this.isProduction,
      baseUrl: this.isProduction
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js",
    };
  }

  /**
   * Create Snap token for payment
   * @param {Object} transactionDetails - Transaction details
   * @returns {Promise} - API response with Snap token
   */
  async createSnapToken(transactionDetails) {
    try {
      console.log("Midtrans configuration:", {
        isProduction: this.isProduction,
        baseUrl: this.baseUrl,
        serverKey: this.serverKey ? "Set" : "Not Set"
      });

      const apiUrl = this.isProduction
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions";

      const authHeader = `Basic ${Buffer.from(this.serverKey + ":").toString("base64")}`;

      console.log("Sending request to Midtrans:", {
        url: apiUrl,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader
        },
        data: transactionDetails
      });

      const response = await axios.post(
        apiUrl,
        transactionDetails,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader
          },
        }
      );

      console.log("Midtrans response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Midtrans Snap token error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new MidtransClient();
