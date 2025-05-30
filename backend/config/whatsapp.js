const axios = require("axios");

/**
 * WhatsApp API configuration for Fonnte
 * This handles the connection to the WhatsApp API service
 */
class WhatsAppConfig {
  constructor() {
    this.apiKey = process.env.FONNTE_API_KEY;
    this.baseUrl = process.env.FONNTE_API_URL || "https://api.fonnte.com/send";
    this.sender = process.env.FONNTE_SENDER || "";
    this.deviceId = process.env.FONNTE_DEVICE_ID || "";
    this.initialized = false;
  }

  /**
   * Initialize the WhatsApp API connection
   * Verifies the API key and device status
   */
  async initialize() {
    try {
      if (!this.apiKey) {
        console.warn(
          "WhatsApp API key not provided. WhatsApp notifications will be disabled."
        );
        return false;
      }

      // Check connection to Fonnte API
      const response = await axios.get(`https://api.fonnte.com/device`, {
        headers: {
          Authorization: this.apiKey,
        },
      });

      if (response.data && response.data.status) {
        console.log("WhatsApp API connected successfully");
        this.initialized = true;

        // Store device info if available
        if (response.data.device && response.data.device.length > 0) {
          const device = response.data.device[0];
          this.deviceId = device.id;
          this.sender = device.number;
          console.log(`Using WhatsApp device: ${this.sender}`);
        }

        return true;
      } else {
        console.error("WhatsApp API connection failed:", response.data);
        return false;
      }
    } catch (error) {
      console.error(
        "WhatsApp API initialization error:",
        error.response?.data || error.message
      );
      return false;
    }
  }

  /**
   * Send a WhatsApp message
   * @param {string} phone - Recipient phone number (with country code)
   * @param {string} message - Message content
   * @param {Object} options - Additional options (delay, schedule, etc.)
   * @returns {Promise} - Response from API
   */
  async sendMessage(phone, message, options = {}) {
    try {
      if (!this.initialized && !(await this.initialize())) {
        throw new Error("WhatsApp API not initialized");
      }

      // Clean phone number - remove spaces, dashes, etc.
      const cleanPhone = this._cleanPhoneNumber(phone);

      if (!cleanPhone) {
        throw new Error("Invalid phone number");
      }

      // Prepare request data
      const data = {
        target: cleanPhone,
        message,
        sender: this.sender || undefined,
        ...options,
      };

      // Send request to Fonnte API
      const response = await axios.post(this.baseUrl, data, {
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.status) {
        return {
          success: true,
          messageId: response.data.id,
          detail: response.data,
        };
      } else {
        throw new Error(
          response.data?.reason || "Failed to send WhatsApp message"
        );
      }
    } catch (error) {
      console.error(
        "WhatsApp message sending error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.reason || error.message,
      };
    }
  }

  /**
   * Send a WhatsApp message with image
   * @param {string} phone - Recipient phone number
   * @param {string} imageUrl - URL of the image
   * @param {string} caption - Image caption (optional)
   * @returns {Promise} - Response from API
   */
  async sendImageMessage(phone, imageUrl, caption = "") {
    try {
      if (!this.initialized && !(await this.initialize())) {
        throw new Error("WhatsApp API not initialized");
      }

      const cleanPhone = this._cleanPhoneNumber(phone);

      if (!cleanPhone) {
        throw new Error("Invalid phone number");
      }

      // Prepare request data for image
      const data = {
        target: cleanPhone,
        url: imageUrl,
        caption: caption,
        sender: this.sender || undefined,
      };

      // Send request to Fonnte API (different endpoint for media)
      const response = await axios.post(
        "https://api.fonnte.com/send_image",
        data,
        {
          headers: {
            Authorization: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status) {
        return {
          success: true,
          messageId: response.data.id,
          detail: response.data,
        };
      } else {
        throw new Error(
          response.data?.reason || "Failed to send WhatsApp image message"
        );
      }
    } catch (error) {
      console.error(
        "WhatsApp image message error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.reason || error.message,
      };
    }
  }

  /**
   * Clean phone number by removing non-numeric characters and adding country code
   * @param {string} phone - Phone number to clean
   * @returns {string|null} - Cleaned phone number or null if invalid
   * @private
   */
  _cleanPhoneNumber(phone) {
    if (!phone) return null;

    // Remove non-numeric characters
    let cleaned = phone.replace(/\D/g, "");

    // Ensure it starts with country code (assume Indonesia/62 if not specified)
    if (cleaned.startsWith("0")) {
      // Replace leading 0 with 62 (Indonesia)
      cleaned = "62" + cleaned.substring(1);
    } else if (!cleaned.startsWith("62") && !cleaned.startsWith("1")) {
      // Add 62 if no country code (default to Indonesia)
      cleaned = "62" + cleaned;
    }

    return cleaned;
  }
}

// Export singleton instance
module.exports = new WhatsAppConfig();
