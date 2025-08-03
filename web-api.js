// Web API client - replaces Electron preload functionality
window.webAPI = {
  // Backend API configuration
  backendConfig: null,

  // Initialize backend configuration
  async initBackendConfig() {
    if (!this.backendConfig) {
      try {
        const response = await fetch('/api/config/backend');
        this.backendConfig = await response.json();
        console.log('Backend config loaded:', this.backendConfig);
        
        // Additional validation
        if (!this.backendConfig.apiUrl) {
          throw new Error('No backend API URL configured');
        }
        
      } catch (error) {
        console.error('Failed to load backend config:', error);
        // Fallback to production URL directly from environment or hardcoded
        this.backendConfig = {
          apiUrl: 'https://plugged-backend.onrender.com',
          environment: 'production',
          isProduction: true
        };
        console.log('Using fallback backend config:', this.backendConfig);
      }
    }
    return this.backendConfig;
  },

  // Get backend API URL
  async getBackendUrl() {
    const config = await this.initBackendConfig();
    return config.apiUrl;
  },

  // Configuration management
  async getSupabaseConfig() {
    try {
      const response = await fetch('/api/config/supabase');
      return await response.json();
    } catch (error) {
      console.error('Failed to get Supabase config:', error);
      return { url: '', key: '' };
    }
  },

  async setSupabaseConfig(config) {
    try {
      const response = await fetch('/api/config/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to set Supabase config:', error);
      return { success: false, error: error.message };
    }
  },

  // Session management
  async saveSession(session) {
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session })
      });
      const result = await response.json();
      localStorage.setItem('sessionId', result.sessionId);
      return result;
    } catch (error) {
      console.error('Failed to save session:', error);
      return { success: false, error: error.message };
    }
  },

  async getSession() {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return null;
      
      const response = await fetch(`/api/session/${sessionId}`);
      const result = await response.json();
      return result.session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  },

  async clearSession() {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        await fetch(`/api/session/${sessionId}`, {
          method: 'DELETE'
        });
      }
      localStorage.removeItem('sessionId');
      return { success: true };
    } catch (error) {
      console.error('Failed to clear session:', error);
      return { success: false, error: error.message };
    }
  },

  // Database verification
  async verifyDatabase() {
    try {
      const response = await fetch('/api/verify-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to verify database:', error);
      return { success: false, message: error.message };
    }
  },

  // Event handling (simplified for web)
  onEnvNotification(callback) {
    // In web version, we'll use custom events
    window.addEventListener('env-notification', (event) => {
      callback(event.detail.message, event.detail.type);
    });
  },

  onVerifyDatabaseRequest(callback) {
    window.addEventListener('verify-database-request', () => {
      callback();
    });
  },

  // Utility functions for web compatibility
  showNotification(message, type = 'info') {
    const event = new CustomEvent('env-notification', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  },

  requestDatabaseVerification() {
    const event = new CustomEvent('verify-database-request');
    window.dispatchEvent(event);
  },

  // Backend API integration methods
  async callBackendAPI(endpoint, options = {}) {
    try {
      const baseUrl = await this.getBackendUrl();
      const url = `${baseUrl}${endpoint}`;
      
      // Get auth token if available
      const session = await this.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Backend API call failed:', error);
      throw error;
    }
  },

  // Backend API methods
  async testBackendConnection() {
    try {
      // First try through our server's test endpoint
      const serverResponse = await fetch('/api/test-backend');
      const serverResult = await serverResponse.json();
      
      if (serverResult.success) {
        return { success: true, data: serverResult };
      }
      
      // If that fails, try direct connection
      const result = await this.callBackendAPI('/api/health');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBackendProducts() {
    try {
      const result = await this.callBackendAPI('/api/products');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBackendOrders() {
    try {
      const result = await this.callBackendAPI('/api/orders');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBackendUsers() {
    try {
      const result = await this.callBackendAPI('/api/users');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const result = await this.callBackendAPI(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Initialize the web API when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Web API initialized');
});
