// Web API client - replaces Electron preload functionality
window.webAPI = {
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
  }
};

// Initialize the web API when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Web API initialized');
});
