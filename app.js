// Theme management
function initializeTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedTheme = localStorage.getItem('theme');
  const theme = storedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
  updateThemeToggleIcon();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  const lightIcon = document.querySelector('.light-icon');
  const darkIcon = document.querySelector('.dark-icon');
  
  if (lightIcon && darkIcon) {
    lightIcon.style.display = isDark ? 'none' : 'inline';
    darkIcon.style.display = isDark ? 'inline' : 'none';
  }
}

// Sidebar toggle functionality
function initializeSidebar() {
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          !sidebar.contains(e.target) && 
          !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}

// Wait for webAPI to be available
function waitForWebAPI() {
  return new Promise((resolve) => {
    if (window.webAPI) {
      resolve();
    } else {
      // Poll for webAPI availability
      const checkAPI = setInterval(() => {
        if (window.webAPI) {
          clearInterval(checkAPI);
          resolve();
        }
      }, 100);
    }
  });
}

// DOM Elements
let BACKEND_URL = 'http://localhost:8000'; // Default fallback
let backendConfig = null;

// Get backend configuration from server
async function initializeBackendConfig() {
  try {
    const response = await fetch('/api/config/backend');
    backendConfig = await response.json();
    BACKEND_URL = backendConfig.apiUrl;
    console.log('Backend configuration loaded:', backendConfig);
    console.log('Using backend URL:', BACKEND_URL);
  } catch (error) {
    console.error('Failed to load backend configuration, using fallback:', error);
    // Keep the default fallback URL
  }
}

const sections = document.querySelectorAll('.section');
const navButtons = document.querySelectorAll('.nav-link');
const loginSection = document.getElementById('login-section');
const loginForm = document.getElementById('login-form');
const dashboardSection = document.getElementById('dashboard-section');
const productsSection = document.getElementById('products-section');
const ordersSection = document.getElementById('orders-section');
const usersSection = document.getElementById('users-section');
const settingsSection = document.getElementById('settings-section');
const productModal = document.getElementById('product-modal');
const orderModal = document.getElementById('order-modal');
const addProductBtn = document.getElementById('add-product-btn');
const productForm = document.getElementById('product-form');
const settingsForm = document.getElementById('settings-form');
const verifyDbBtn = document.getElementById('test-connection');
const userInfoElement = document.getElementById('user-info');

// Enhanced close modal functionality for all modal close buttons
function setupModalCloseButtons() {
  // Close modal buttons
  document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
    // First remove any existing listeners to prevent duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Add the click event listener to the new button
    newBtn.addEventListener('click', () => {
      console.log('Modal close button clicked');
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
      });
    });
  });
  
  // Add global ESC key handler for modals
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(modal => {
        if (!modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
          console.log('Modal closed via ESC key');
        }
      });
    }
  });
}

// Run setup on page load
document.addEventListener('DOMContentLoaded', setupModalCloseButtons);

// Supabase client
let supabase = null;

// Create notification function using modal dialog instead of popups
function showNotification(message, type = 'warning') {
  // Skip empty or default messages
  if (!message || 
      message.trim() === '' || 
      message === 'undefined' || 
      message === null ||
      message.includes('Please configure') || 
      message.includes('Supabase') ||
      message.includes('database') ||
      message.includes('config')) {
    console.log('Skipping notification with message:', message);
    return;
  }
  
  const modal = document.getElementById('notification-modal');
  const modalTitle = document.getElementById('notification-title');
  const modalMessage = document.getElementById('notification-message');
  let modalOkBtn = document.querySelector('#notification-modal .btn-primary');
  let modalCloseBtn = document.querySelector('#notification-modal .close-modal-btn');
  
  // Set title based on notification type
  let title = 'Notification';
  switch (type) {
    case 'success': title = 'Success'; break;
    case 'error': title = 'Error'; break;
    case 'info': title = 'Information'; break;
    case 'warning': title = 'Warning'; break;
  }
  
  // Don't show empty messages
  if (!message || message.trim() === '') {
    console.log('Attempted to show empty notification');
    return;
  }
  
  // Update modal content
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  
  // Apply color styles based on type
  modal.classList.remove('success', 'error', 'info', 'warning');
  modal.classList.add(type);
  
  // Show the modal only if we have actual content
  if (modalMessage.textContent && modalMessage.textContent.trim() !== '') {
    modal.classList.remove('hidden');
  }
  
  // Close modal handlers with improved reliability
  const closeModal = () => {
    modal.classList.add('hidden');
    console.log('Notification modal closed');
  };
  
  // Create fresh button clones to prevent event listener accumulation
  const newOkBtn = modalOkBtn.cloneNode(true);
  const newCloseBtn = modalCloseBtn.cloneNode(true);
  
  // Replace the old buttons with the new clones
  modalOkBtn.parentNode.replaceChild(newOkBtn, modalOkBtn);
  modalCloseBtn.parentNode.replaceChild(newCloseBtn, modalCloseBtn);
  
  // Add handlers to the new buttons
  newOkBtn.addEventListener('click', closeModal);
  newCloseBtn.addEventListener('click', closeModal);
  
  // Update references to the new buttons
  modalOkBtn = document.querySelector('#notification-modal .btn-primary');
  modalCloseBtn = document.querySelector('#notification-modal .close-modal-btn');
}

// Listen for env notification from main process
// Set a flag to prevent showing notifications during startup
let initialLoadComplete = false;
let startupSuppression = true;

// Wait 5 seconds before allowing any automatic notifications
setTimeout(() => { 
  initialLoadComplete = true;
  console.log('Initial load complete, notifications will be allowed');
}, 5000);

// Keep suppressing automatic startup notifications for 30 seconds
setTimeout(() => { 
  startupSuppression = false;
  console.log('Startup suppression disabled, all notifications allowed');
}, 30000);

// Check if user is authenticated
async function checkAuthStatus() {
  if (!supabase) {
    console.error('Supabase client not initialized');
    showSection('login-section');
    return false;
  }
  
  try {
    // Check for existing session but don't auto-login to dashboard
    const session = supabase.auth.getSession();
    
    if (session && session.user) {
      console.log('User session found but require explicit login');
      userInfoElement.textContent = `Session for: ${session.user?.email || 'Admin'}`;
      // Stay on login section - user must click login button
      return true;
    } else {
      console.log('No active session found');
      userInfoElement.textContent = 'Not logged in';
      return false;
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    userInfoElement.textContent = 'Not logged in';
    return false;
  }
}

if (window.webAPI && window.webAPI.onEnvNotification) {
  window.webAPI.onEnvNotification((message, type = 'warning') => {
    // Skip all notifications during initial startup
    if (!initialLoadComplete) {
      console.log(`Suppressed initial notification: ${message}`);
      return;
    }
    
    // Skip automatic notifications during extended startup period
    if (startupSuppression && type !== 'error' && type !== 'success') {
      console.log(`Suppressed startup notification: ${message}`);
      return;
    }
    
    // Show only important notifications
    showNotification(message, type);
  });
}

// Listen for verify database events
document.addEventListener('verifyDatabase', async () => {
  try {
    showNotification('Verifying database schema...', 'info');
    const result = await window.webAPI.verifyDatabase();
    
    if (result.success) {
      showNotification(`Database verification successful! ${result.message}`, 'success');
    } else {
      showNotification(`Database verification failed: ${result.message}`, 'error');
    }
  } catch (error) {
    showNotification(`Error during database verification: ${error.message}`, 'error');
  }
});

// Handle menu verification request
if (window.webAPI && window.webAPI.onVerifyDatabaseRequest) {
  window.webAPI.onVerifyDatabaseRequest(() => {
    const event = new Event('verifyDatabase');
    document.dispatchEvent(event);
  });
}

// Load Supabase configuration on startup
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Wait for webAPI to be available
    await waitForWebAPI();
    
    // Initialize backend configuration
    await initializeBackendConfig();
    
    // Force dark mode only
    document.documentElement.classList.add('dark');
    
    // Initialize sidebar functionality
    initializeSidebar();
    
    // Remove theme toggle since we're dark mode only
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.style.display = 'none';
    }
    
    // Get Supabase configuration from web API
    const config = await window.webAPI.getSupabaseConfig();
    
    if (config.url && config.key) {
      // Initialize Supabase client
      console.log('Attempting to initialize Supabase with config:', { url: config.url, hasKey: !!config.key });
      const success = initializeSupabase(config.url, config.key);
      console.log('Supabase initialization result:', success, 'Client:', !!supabase);
      
      // Don't show notifications on startup
      if (!success) {
        console.log('Failed to initialize database client, but suppressing notification on startup');
      }
      
      // Populate settings form
      document.getElementById('supabase-url').value = config.url;
      document.getElementById('supabase-key').value = config.key;
      
      // ALWAYS require login - show login section first
      showSection('login-section');
      
      // Check authentication status but don't auto-proceed
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        console.log('User not authenticated, staying on login page');
      }
    } else {
      // Show settings section if not configured
      showSection('settings-section');
      showNotification('Please configure your Supabase connection first.', 'info');
    }
  } catch (error) {
    console.error('Error during startup:', error);
    // Don't show any notification on startup
  }
});

// Navigation
navButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.id.replace('nav-', '');
    
    // Update active button
    navButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Show target section
    showSection(`${targetId}-section`);
  });
});

function showSection(sectionId) {
  try {
    // First hide all sections
    sections.forEach(section => {
      section.classList.add('hidden');
    });
    
    // Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
      console.error(`Section not found: ${sectionId}`);
      return;
    }
    
    targetSection.classList.remove('hidden');
    
    // Clear any existing error notifications
    const currentSession = supabase?.auth?.getSession();
    if (!currentSession && sectionId !== 'login-section' && sectionId !== 'settings-section') {
      showNotification('Please log in to continue', 'warning');
      sections.forEach(section => section.classList.add('hidden'));
      document.getElementById('login-section').classList.remove('hidden');
      return;
    }
    
    // Load section-specific data
    if (sectionId === 'dashboard-section') {
      loadDashboardData();
    } else if (sectionId === 'products-section') {
      loadProducts();
    } else if (sectionId === 'orders-section') {
      loadOrders();
    } else if (sectionId === 'users-section') {
      loadUsers();
    }
    
    // Update navigation button state
    const navId = sectionId.replace('-section', '');
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.id === `nav-${navId}`);
    });
  } catch (error) {
    console.error('Error showing section:', error);
    showNotification('Error loading section', 'error');
  }
}

// Initialize Supabase client
function initializeSupabase(url, key) {
  console.log('initializeSupabase called with:', { url, hasKey: !!key });
  console.log('Available Supabase objects:', {
    supabaseLocal: !!window.supabaseLocal,
    supabase: !!window.supabase,
    supabaseJs: typeof supabaseJs !== 'undefined'
  });
  
  try {
    // Use our local supabase implementation
    if (window.supabaseLocal) {
      console.log('Using local Supabase client implementation');
      supabase = window.supabaseLocal.createClient(url, key);
      console.log('Created supabase client:', !!supabase, supabase);
      return true;
    } 
    // Try CDN as fallback
    else if (window.supabase) {
      console.log('Using CDN Supabase client');
      supabase = window.supabase.createClient(url, key);
      console.log('Created supabase client:', !!supabase, supabase);
      return true;
    } 
    // Try imported version as last resort
    else if (typeof supabaseJs !== 'undefined') {
      console.log('Using imported Supabase client');
      supabase = supabaseJs.createClient(url, key);
      console.log('Created supabase client:', !!supabase, supabase);
      return true;
    }
    // Error if no client is available, but don't show alert
    else {
      console.error('Supabase client library not available');
      return false;
    }
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return false;
  }
}

// Authentication
async function checkAuthStatus() {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      userInfoElement.textContent = 'Not logged in';
      showSection('login-section');
      return false;
    }
    
    // Verify token with backend
    const response = await fetch(`${BACKEND_URL}/api/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    
    if (!response.ok) {
      localStorage.removeItem('auth_token');
      userInfoElement.textContent = 'Not logged in';
      showSection('login-section');
      return false;
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data?.user) {
      localStorage.removeItem('auth_token');
      userInfoElement.textContent = 'Not logged in';
      showSection('login-section');
      return false;
    }
    
    const user = result.data.user;
    
    if (!user.is_admin) {
      localStorage.removeItem('auth_token');
      userInfoElement.textContent = 'Not logged in as admin';
      showSection('login-section');
      return false;
    }
    
    // User is logged in as admin
    const displayName = user.display_name || `${user.first_name} ${user.last_name}` || user.email;
    userInfoElement.textContent = `Logged in as: ${displayName}`;
    
    // Show dashboard
    showSection('dashboard-section');
    
    // Load dashboard data
    loadDashboardData();
    return true;
  } catch (error) {
    console.error('Auth error:', error);
    localStorage.removeItem('auth_token');
    showSection('login-section');
    return false;
  }
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // Check if Supabase client is initialized
  if (!supabase) {
    showNotification('Database client not initialized. Please check your network connection or configuration.', 'error');
    return;
  }
  
  try {
    // Show loading indicator
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;
    
    // Attempt login using custom auth
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    // Reset button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    
    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }
    
    if (!result.success) {
      throw new Error(result.error || 'Login failed');
    }
    
    // Check admin status
    const user = result.data?.user;
    if (!user || !user.is_admin) {
      showNotification('Access denied. Admin privileges required.', 'error');
      return;
    }
    
    // Store auth token
    localStorage.setItem('auth_token', result.data.session.access_token);
    
    // Update UI with admin info
    const displayName = user.display_name || `${user.first_name} ${user.last_name}` || user.email;
    userInfoElement.textContent = `Logged in as: ${displayName}`;
    showSection('dashboard-section');
    
    // Show success notification
    showNotification(`Welcome ${displayName}!`, 'success');
    
    // Load dashboard data
    loadDashboardData();
  } catch (error) {
    showNotification(`Login error: ${error.message}`, 'error');
  }
});

// Settings form submission
settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = settingsForm.querySelector('button[type="submit"]');
  const verifyBtn = document.getElementById('test-connection');
  const url = document.getElementById('supabase-url').value;
  const key = document.getElementById('supabase-key').value;
  
  // Basic validation
  if (!url || !key) {
    showNotification('Please provide both Supabase URL and key', 'warning');
    return;
  }
  
  try {
    // Show loading state
    submitBtn.disabled = true;
    verifyBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    // Save to web API
    await window.webAPI.setSupabaseConfig({ url, key });
    
    // Initialize Supabase and test connection
    const success = initializeSupabase(url, key);
    
    if (!success) {
      throw new Error('Failed to initialize database client');
    }
    
    // Test connection
    showNotification('Testing database connection...', 'info');
    
    const testResult = await supabase
      .from('profiles')
      .select('id');
      
    if (testResult.error) {
      throw testResult.error;
    }
    
    // Show success message
    showNotification('Settings saved and database connection verified!', 'success');
    
    // Check for active session
    const session = supabase.auth.getSession();
    if (session) {
      showSection('dashboard-section');
    } else {
      showSection('login-section');
    }
  } catch (error) {
    console.error('Settings error:', error);
    showNotification(`Failed to save settings: ${error.message}`, 'error');
  } finally {
    // Reset button states
    submitBtn.disabled = false;
    verifyBtn.disabled = false;
    submitBtn.textContent = 'Save Settings';
  }
  
  // Validate the connection
  try {
    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    showNotification(`Settings saved successfully! Connected to Supabase. Found ${count} products.`, 'success');
    showSection('login-section');
  } catch (error) {
    showNotification(`Error validating Supabase connection: ${error.message}. Please check your credentials.`, 'error');
  }
});

// Verify database button
verifyDbBtn.addEventListener('click', async () => {
  try {
    verifyDbBtn.disabled = true;
    verifyDbBtn.textContent = 'Testing...';
    
    // Show notification that we're starting verification
    showNotification('Testing database connection...', 'info');
    
    const result = await window.webAPI.verifyDatabase();
    
    if (result.success) {
      showNotification(`Database connection successful! ${result.message}`, 'success');
    } else {
      showNotification(`Database connection failed: ${result.message}`, 'error');
    }
  } catch (error) {
    showNotification(`Error during database connection test: ${error.message}`, 'error');
  } finally {
    verifyDbBtn.disabled = false;
    verifyDbBtn.textContent = 'Test Connection';
  }
});

// Dashboard data loading
async function loadDashboardData() {
  try {
    if (!supabase) {
      showNotification('Database client not initialized', 'error');
      return;
    }
    
    // Update UI to show loading state
    document.getElementById('total-products').textContent = 'Loading...';
    document.getElementById('total-users').textContent = 'Loading...';
    document.getElementById('total-orders').textContent = 'Loading...';
    document.getElementById('total-revenue').textContent = 'Loading...';
    
    // Load products count
    const productsResult = await supabase
      .from('products')
      .select('id');
    
    if (productsResult.error) {
      console.error('Products query error:', productsResult.error);
      document.getElementById('total-products').textContent = 'Error';
    } else {
      const productsCount = productsResult.data ? productsResult.data.length : 0;
      document.getElementById('total-products').textContent = productsCount;
    }
    
    // Load users count from profiles table
    const usersResult = await supabase
      .from('profiles')
      .select('id');
    if (usersResult.error) {
      console.error('Users query error:', usersResult.error);
      document.getElementById('total-users').textContent = 'Error';
    } else {
      const usersCount = usersResult.data ? usersResult.data.length : 0;
      document.getElementById('total-users').textContent = usersCount;
    }
    
    // Load orders count and revenue (only count completed orders for revenue)
    const ordersResult = await supabase
      .from('orders')
      .select('id, total_amount, status');
    
    if (ordersResult.error) {
      console.error('Orders query error:', ordersResult.error);
      document.getElementById('total-orders').textContent = 'Error';
      document.getElementById('total-revenue').textContent = 'Error';
    } else {
      const ordersCount = ordersResult.data ? ordersResult.data.length : 0;
      document.getElementById('total-orders').textContent = ordersCount;
      
      // Calculate total revenue - only include completed orders
      let totalRevenue = 0;
      let completedOrdersCount = 0;
      if (ordersResult.data && ordersResult.data.length > 0) {
        ordersResult.data.forEach(order => {
          if (order.status && order.status.toLowerCase() === 'completed') {
            const amount = parseFloat(order.total_amount) || 0;
            totalRevenue += amount;
            completedOrdersCount++;
          }
        });
      }
      document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)} (${completedOrdersCount} completed)`;
    }
    
    // Load products
    loadProducts();
    
    // Load orders
    loadOrders();
    
    // Load users
    loadUsers();
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    alert(`Error loading data: ${error.message}`);
  }
}

// Products Management
async function loadProducts() {
  try {
    if (!supabase) {
      showNotification('Supabase client not initialized', 'error');
      return;
    }
    
    const productsResult = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (productsResult.error) throw productsResult.error;
    const products = productsResult.data || [];
    
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '';
    
    if (products.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
          <div class="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p class="text-lg font-medium">No products found</p>
            <p class="text-sm">Add your first product to get started</p>
          </div>
        </td>`;
      productsList.appendChild(row);
      return;
    }
    
    products.forEach(product => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>
          <div class="product-info">
            ${product.image1 ? `
              <div class="product-image">
                <img 
                  src="${product.image1}" 
                  alt="${product.name}" 
                  onerror="this.style.display='none';"
                />
              </div>
            ` : ''}
            <div class="product-details">
              <h3 class="product-name">
                ${product.name}
                ${product.is_bestseller ? '<span class="bestseller-badge">Bestseller</span>' : ''}
              </h3>
              <p class="product-description">
                ${product.description || 'No description'}
              </p>
            </div>
          </div>
        </td>
        <td>
          ${product.category || 'Uncategorized'}
        </td>
        <td class="text-right">
          $${parseFloat(product.price).toFixed(2)}
        </td>
        <td class="text-right">
          $${parseFloat(product.retail_price || 0).toFixed(2)}
        </td>
        <td class="text-right">
          <div class="action-buttons">
            <button class="btn-edit" data-id="${product.id}">Edit</button>
            <button class="btn-delete" data-id="${product.id}">Delete</button>
          </div>
        </td>
      `;
      
      productsList.appendChild(row);
      
      // Add event listeners to buttons
      row.querySelector('.btn-edit').addEventListener('click', () => {
        editProduct(product);
      });
      
      row.querySelector('.btn-delete').addEventListener('click', async () => {
        if (confirm(`Are you sure you want to delete ${product.name}?`)) {
          await deleteProduct(product.id);
        }
      });
    });
  } catch (error) {
    console.error('Error loading products:', error);
    alert(`Error loading products: ${error.message}`);
  }
}

// Add Product button
addProductBtn.addEventListener('click', () => {
  // Reset form for new product
  productForm.reset();
  document.getElementById('product-id').value = '';
  document.getElementById('product-modal-title').textContent = 'Add New Product';
  
  // Clear image previews
  resetImageUploadSlots();
  
  // Show modal
  productModal.classList.remove('hidden');
});

// Image upload functionality
function setupImageUpload() {
  const imageSlots = document.querySelectorAll('.image-upload-slot');
  
  imageSlots.forEach((slot, index) => {
    const fileInput = slot.querySelector('input[type="file"]');
    const slotNumber = index + 1;
    
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await handleImageUpload(file, slotNumber, slot);
      }
    });
  });
}

async function handleImageUpload(file, slotNumber, slotElement) {
  try {
    console.log(`Starting upload for image ${slotNumber}:`, file.name);
    
    // Check if Supabase client is initialized
    if (!supabase) {
      console.error('Supabase client not initialized');
      console.log('Current supabase value:', supabase);
      console.log('Available objects:', {
        supabaseLocal: !!window.supabaseLocal,
        supabase: !!window.supabase
      });
      showNotification('Database connection not available. Please check settings.', 'error');
      return;
    }
    
    console.log('Supabase client available:', !!supabase, 'Has storage:', !!supabase.storage);
    
    // Show loading state
    slotElement.classList.add('uploading');
    slotElement.innerHTML = `
      <div class="upload-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Uploading...</div>
      </div>
    `;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      slotElement.classList.remove('uploading');
      resetImageSlot(slotElement, slotNumber);
      showNotification('Please select a valid image file', 'error');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      slotElement.classList.remove('uploading');
      resetImageSlot(slotElement, slotNumber);
      showNotification('Image file must be less than 5MB', 'error');
      return;
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    console.log(`Uploading file: ${fileName}`);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      slotElement.classList.remove('uploading');
      resetImageSlot(slotElement, slotNumber);
      showNotification(`Failed to upload image: ${error.message}`, 'error');
      return;
    }
    
    console.log('Upload successful:', data);
    
    // Get public URL
    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    
    const imageUrl = publicData.publicUrl;
    console.log(`Image ${slotNumber} public URL:`, imageUrl);
    
    // Remove loading state and update slot with preview
    slotElement.classList.remove('uploading');
    updateImageSlot(slotElement, imageUrl, slotNumber);
    
    showNotification(`Image ${slotNumber} uploaded successfully!`, 'success');
    
  } catch (error) {
    console.error('Error uploading image:', error);
    slotElement.classList.remove('uploading');
    resetImageSlot(slotElement, slotNumber);
    showNotification(`Error uploading image: ${error.message}`, 'error');
  }
}

function updateImageSlot(slotElement, imageUrl, slotNumber) {
  slotElement.classList.add('has-image');
  slotElement.innerHTML = `
    <input type="file" accept="image/*">
    <img src="${imageUrl}" alt="Product image ${slotNumber}" class="image-preview">
    <button type="button" class="image-remove-btn" onclick="removeImage(this, ${slotNumber})">×</button>
    <input type="hidden" id="product-image${slotNumber}-url" value="${imageUrl}">
  `;
  
  // Re-attach file input event listener
  const newFileInput = slotElement.querySelector('input[type="file"]');
  newFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, slotNumber, slotElement);
    }
  });
}

function removeImage(button, slotNumber) {
  const slot = button.closest('.image-upload-slot');
  resetImageSlot(slot, slotNumber);
}

function resetImageSlot(slotElement, slotNumber) {
  slotElement.classList.remove('has-image');
  slotElement.innerHTML = `
    <input type="file" id="image${slotNumber}" accept="image/*">
    <input type="hidden" id="product-image${slotNumber}-url" value="">
    <svg class="image-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
    <div class="image-upload-text">
      <div>Upload Image ${slotNumber}</div>
      ${slotNumber === 1 ? '<div class="text-xs">(Primary)</div>' : ''}
    </div>
  `;
  
  // Re-attach event listener
  const fileInput = slotElement.querySelector('input[type="file"]');
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, slotNumber, slotElement);
    }
  });
}

function resetImageUploadSlots() {
  const imageSlots = document.querySelectorAll('.image-upload-slot');
  imageSlots.forEach((slot, index) => {
    resetImageSlot(slot, index + 1);
  });
}

// Initialize image upload when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupImageUpload();
});

// Product form submission
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Get submit button and add loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block;"></div>Saving...';
  
  try {
    const getValue = (id, fallback = '') => {
      const el = document.getElementById(id);
      return el ? el.value : fallback;
    };
    const getChecked = (id) => {
      const el = document.getElementById(id);
      return el ? el.checked : false;
    };
    
    const productId = getValue('product-id');
    const currentTimestamp = new Date().toISOString();
    const isEditing = !!productId;
    
    // Show loading notification
    showNotification(isEditing ? 'Updating product...' : 'Creating product...', 'info');
    
    // Get image URLs from uploaded images
    const getImageUrl = (slotNumber) => {
      const hiddenInput = document.getElementById(`product-image${slotNumber}-url`);
      const url = hiddenInput ? hiddenInput.value : '';
      console.log(`Image ${slotNumber} URL:`, url); // Debug logging
      return url;
    };
    
    let product = {
      name: getValue('product-name'),
      description: getValue('product-description'),
      price: parseFloat(getValue('product-price', '0')),
      retail_price: parseFloat(getValue('product-retail-price', '0')),
      category: getValue('product-category'),
      is_bestseller: getChecked('product-bestseller'),
      image1: getImageUrl(1),
      image2: getImageUrl(2),
      image3: getImageUrl(3),
      image4: getImageUrl(4),
      updated_at: currentTimestamp
    };
    
    console.log('Product data being saved:', product); // Debug logging
    
    let error;
    if (productId) {
      // Fetch original product
      const { data: original, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (fetchError) throw fetchError;
      // Only update fields that are not blank, otherwise keep original
      Object.keys(product).forEach(key => {
        if (product[key] === '' || product[key] === null || (typeof product[key] === 'number' && isNaN(product[key]))) {
          product[key] = original[key];
        }
      });
      const { error: updateError } = await supabase
        .from('products')
        .update(product)
        .eq('id', productId);
      error = updateError;
    } else {
      // Insert new product with created_at timestamp
      product.created_at = currentTimestamp;
      const { error: insertError } = await supabase
        .from('products')
        .insert([product]);
      error = insertError;
    }
    
    if (error) throw error;
    
    // Success!
    productModal.classList.add('hidden');
    showNotification(isEditing ? 'Product updated successfully!' : 'Product created successfully!', 'success');
    
    // Refresh data
    loadProducts();
    loadDashboardData();
    
  } catch (error) {
    console.error('Error saving product:', error);
    showNotification(`Error saving product: ${error.message}`, 'error');
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});// Edit product
function editProduct(product) {
  console.log('Editing product:', product);
  
  try {
    const productModal = document.getElementById('product-modal');
    
    // Helper function to safely set values
    const setValue = (id, value) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = value || '';
        console.log(`Set ${id} to:`, value);
      } else {
        console.warn(`Element with id ${id} not found`);
      }
    };
    
    const setChecked = (id, value) => {
      const el = document.getElementById(id);
      if (el) {
        el.checked = !!value;
        console.log(`Set ${id} checked to:`, !!value);
      } else {
        console.warn(`Element with id ${id} not found`);
      }
    };
    
    // Populate form fields
    setValue('product-id', product.id);
    setValue('product-name', product.name);
    setValue('product-description', product.description);
    setValue('product-price', product.price);
    setValue('product-retail-price', product.retail_price);
    setValue('product-category', product.category);
    setChecked('product-bestseller', product.is_bestseller);
    
    // Clear any previous state
    resetImageUploadSlots();
    
    // Set existing images with loading feedback
    showNotification('Loading product images...', 'info');
    
    const images = [product.image1, product.image2, product.image3, product.image4];
    let loadedImages = 0;
    
    images.forEach((imageUrl, index) => {
      if (imageUrl && imageUrl.trim()) {
        const slotNumber = index + 1;
        const slot = document.querySelector(`.image-upload-slot[data-slot="${slotNumber}"]`);
        if (slot) {
          console.log(`Loading image ${slotNumber}:`, imageUrl);
          updateImageSlot(slot, imageUrl, slotNumber);
          loadedImages++;
        }
      }
    });
    
    // Update modal title and show
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    
    if (productModal) {
      productModal.classList.remove('hidden');
      productModal.style.overflowY = 'auto';
      productModal.style.maxHeight = '90vh';
    }
    
    // Show success message
    if (loadedImages > 0) {
      showNotification(`Product loaded with ${loadedImages} image(s)`, 'success');
    } else {
      showNotification('Product loaded successfully', 'success');
    }
    
  } catch (error) {
    console.error('Error loading product for editing:', error);
    showNotification('Error loading product details', 'error');
  }
}

// Delete product
async function deleteProduct(productId) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
    
    // Reload products
    loadProducts();
    
    // Reload dashboard data
    loadDashboardData();
  } catch (error) {
    console.error('Error deleting product:', error);
    alert(`Error deleting product: ${error.message}`);
  }
}

// Orders Management
async function loadOrders() {
  try {
    if (!supabase) {
      showNotification('Database client not initialized', 'error');
      return;
    }
    const ordersResult = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (ordersResult.error) {
      console.error('Orders query error:', ordersResult.error);
      alert(`Error loading orders: ${ordersResult.error.message}`);
      return;
    }
    const orders = ordersResult.data || [];
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';
    if (orders.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" style="text-align: center;">No orders found</td>';
      ordersList.appendChild(row);
      return;
    }
    for (const order of orders) {
      let customerName = 'Unknown Customer';
      let customerEmail = 'No email';
      if (order.user_id) {
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('display_name, first_name, last_name, email')
          .eq('id', order.user_id)
          .single();
        if (user) {
          customerName = user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
          customerEmail = user.email || 'No email';
        }
      }
      const row = document.createElement('tr');
      const date = new Date(order.created_at).toLocaleDateString();
      row.innerHTML = `
        <td>${order.id.substring(0, 8).toUpperCase()}</td>
        <td>
          <div>${customerName}</div>
          <div style="font-size: 0.8em; color: #666;">${customerEmail}</div>
        </td>
        <td>${date}</td>
        <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
        <td>
          <span class="status-badge ${order.status.toLowerCase().replace(/_/g, '-')}">
            ${order.status.replace(/_/g, ' ')}
          </span>
        </td>
        <td>
          <button class="btn-view" data-id="${order.id}">View</button>
          <button class="btn-edit" data-id="${order.id}">Update Status</button>
          <button class="btn-delete" data-id="${order.id}" style="background-color: var(--error-color); margin-left: 4px;">Delete</button>
        </td>
      `;
      ordersList.appendChild(row);
      row.querySelector('.btn-view').addEventListener('click', () => {
        viewOrderDetails(order.id);
      });
      row.querySelector('.btn-edit').addEventListener('click', () => {
        updateOrderStatus(order);
      });
      row.querySelector('.btn-delete').addEventListener('click', () => {
        deleteOrder(order);
      });
    }
  } catch (error) {
    console.error('Error loading orders:', error);
    alert(`Error loading orders: ${error.message}`);
  }
}

// View order details
async function viewOrderDetails(orderId) {
  try {
    if (!supabase) {
      showNotification('Database client not initialized', 'error');
      return;
    }
    // Fetch order by ID
    const orderResult = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (orderResult.error || !orderResult.data) {
      throw new Error(orderResult.error?.message || 'Order not found');
    }
    const order = orderResult.data;
    let customerName = 'Unknown Customer';
    let customerEmail = 'No email';
    if (order.user_id) {
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('display_name, first_name, last_name, email')
        .eq('id', order.user_id)
        .single();
      if (user) {
        customerName = user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
        customerEmail = user.email || 'No email';
      }
    }
    // Populate order details modal
    const detailsContent = document.getElementById('order-details-content');
    detailsContent.innerHTML = `
      <div><strong>Order ID:</strong> ${order.id}</div>
      <div><strong>Customer:</strong> ${customerName} (${customerEmail})</div>
      <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</div>
      <div><strong>Status:</strong> ${order.status.replace(/_/g, ' ')}</div>
      <div><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</div>
      <div><strong>Payment Method:</strong> ${order.payment_method}</div>
      <div><strong>Payment Reference:</strong> ${order.payment_reference || 'N/A'}</div>
      <div><strong>Shipping Address:</strong> ${JSON.stringify(order.shipping_address)}</div>
      <!-- Add more fields as needed -->
    `;
    document.getElementById('order-modal').classList.remove('hidden');
  } catch (error) {
    console.error('Error fetching order details:', error);
    showNotification(`Error fetching order details: ${error.message}`, 'error');
  }
}

// Update order status
async function updateOrderStatus(order) {
  if (!supabase) {
    showNotification('Database client not initialized', 'error');
    return;
  }
  
  // Define standard status options (exact database constraint values)
  const statusOptions = [
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'payment_processing', label: 'Payment Processing' },
    { value: 'payment_confirmed', label: 'Payment Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];
  
  // Create a modal for status update
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content notification-modal-content">
      <div class="modal-header">
        <h3>Update Order Status</h3>
        <button type="button" class="close-modal-btn" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="status-update-form">
          <p class="order-info">
            <strong>Order ID:</strong> ${order.id}<br>
            <strong>Current Status:</strong> 
            <span class="status-badge ${order.status.toLowerCase().replace(/_/g, '-')}">
              ${order.status.replace(/_/g, ' ')}
            </span>
          </p>
          
          <div class="form-group">
            <label for="status-select">Select new status:</label>
            <select id="status-select" class="status-select">
              ${statusOptions.map(status => `
                <option value="${status.value}" ${status.value === order.status ? 'selected' : ''}>
                  ${status.label}
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary close-btn">Cancel</button>
        <button type="button" class="btn primary-btn confirm-btn">Update Status</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.classList.remove('hidden');
  
  // Handle button clicks
  const closeButtons = modal.querySelectorAll('.close-btn, .close-modal-btn');
  const confirmButton = modal.querySelector('.confirm-btn');
  
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.remove();
    });
  });
  
  confirmButton.addEventListener('click', async () => {
    const statusSelect = document.getElementById('status-select');
    const newStatus = statusSelect.value;
    
    try {
      // Show loading state
      confirmButton.disabled = true;
      confirmButton.textContent = 'Updating...';

      // Prepare update data
      const updateData = { status: newStatus };

      // Ask for additional information based on status
      if (newStatus === 'shipped') {
        modal.remove(); // Close current modal
        
        const trackingNumber = prompt('Enter tracking number (optional):');
        const estimatedDelivery = prompt('Enter estimated delivery date (YYYY-MM-DD, optional):');
        
        if (trackingNumber) {
          updateData.tracking_number = trackingNumber;
        }
        if (estimatedDelivery && /^\d{4}-\d{2}-\d{2}$/.test(estimatedDelivery)) {
          updateData.estimated_delivery_date = estimatedDelivery;
        }
      }
      
      // Make API call to backend instead of direct Supabase
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (result.success) {
        showNotification(`Order status updated to ${newStatus}`, 'success');
        modal.remove();
        loadOrders(); // Refresh the orders list
      } else {
        throw new Error(result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification(`Error updating order status: ${error.message}`, 'error');
      
      // Reset button state
      confirmButton.disabled = false;
      confirmButton.textContent = 'Update Status';
    }
  });
}

// Delete Order
async function deleteOrder(order) {
  if (!supabase) {
    showNotification('Database client not initialized', 'error');
    return;
  }
  
  // Create confirmation modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content notification-modal-content">
      <div class="modal-header">
        <h3>Delete Order</h3>
        <button type="button" class="close-modal-btn" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="delete-confirmation">
          <p class="order-info">
            <strong>Order ID:</strong> ${order.id}<br>
            <strong>Amount:</strong> $${parseFloat(order.total_amount).toFixed(2)}<br>
            <strong>Status:</strong> 
            <span class="status-badge ${order.status.toLowerCase().replace(/_/g, '-')}">
              ${order.status.replace(/_/g, ' ')}
            </span>
          </p>
          <div class="warning-message" style="background-color: var(--error-color); color: white; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <strong>⚠️ Warning:</strong> This action cannot be undone. The order and all related data will be permanently deleted.
          </div>
          <p><strong>Are you sure you want to delete this order?</strong></p>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary close-modal-btn">Cancel</button>
        <button type="button" class="btn btn-danger" id="confirm-delete-btn">Delete Order</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'flex';
  
  // Close modal handlers
  const closeButtons = modal.querySelectorAll('.close-modal-btn');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => modal.remove());
  });
  
  // Delete confirmation handler
  const confirmButton = modal.querySelector('#confirm-delete-btn');
  confirmButton.addEventListener('click', async () => {
    try {
      // Show loading state
      confirmButton.disabled = true;
      confirmButton.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block;"></div>Deleting...';
      
      showNotification('Deleting order...', 'info');
      
      // Delete order items first (if they exist in a separate table)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.warn('Error deleting order items (may not exist):', itemsError);
        // Continue with order deletion even if items deletion fails
      }
      
      // Delete the main order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      
      if (orderError) {
        throw orderError;
      }
      
      showNotification('Order deleted successfully', 'success');
      modal.remove();
      
      // Refresh the orders list and dashboard data
      loadOrders();
      loadDashboardData();
      
    } catch (error) {
      console.error('Error deleting order:', error);
      showNotification(`Error deleting order: ${error.message}`, 'error');
      
      // Reset button state
      confirmButton.disabled = false;
      confirmButton.textContent = 'Delete Order';
    }
  });
}

// Users Management
async function loadUsers() {
  try {
    if (!supabase) {
      showNotification('Database client not initialized', 'error');
      return;
    }
    const usersResult = await supabase
      .from('profiles')
      .select('*');
    if (usersResult.error) {
      console.error('Users query error:', usersResult.error);
      showNotification(`Error loading users: ${usersResult.error.message}`, 'error');
      return;
    }
    const users = usersResult.data || [];
    const usersList = document.getElementById('users-list');
    if (!usersList) {
      console.error('Users list element not found');
      return;
    }
    usersList.innerHTML = '';
    if (users.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="5" class="text-center py-8">
          <div class="text-gray-500 dark:text-gray-400">
            No users found. Users will appear here after they register.
          </div>
        </td>`;
      usersList.appendChild(row);
      return;
    }
    users.forEach(user => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
      let displayName = 'N/A';
      if (user.display_name) {
        displayName = user.display_name;
      } else if (user.first_name || user.last_name) {
        displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      }
      const shortId = user.id ? user.id.substring(0, 8) : 'N/A';
      row.innerHTML = `
        <td class="py-3 px-4">
          <span class="font-mono text-sm" title="${user.id}">${shortId}...</span>
        </td>
        <td class="py-3 px-4">${user.email}</td>
        <td class="py-3 px-4">${displayName}</td>
        <td class="py-3 px-4">
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.is_admin 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }">
            ${user.is_admin ? 'Admin' : 'Customer'}
          </span>
        </td>
        <td class="py-3 px-4">
          <button class="btn-secondary btn-sm" data-id="${user.id}" data-admin="${user.is_admin}">
            ${user.is_admin ? 'Remove Admin' : 'Make Admin'}
          </button>
        </td>
      `;
      usersList.appendChild(row);
      row.querySelector('.btn-secondary').addEventListener('click', () => {
        updateUserRole(user);
      });
    });
  } catch (error) {
    console.error('Error loading users:', error);
    showNotification(`Error loading users: ${error.message}`, 'error');
  }
}

// Update user role
async function updateUserRole(user) {
  const isCurrentlyAdmin = user.is_admin;
  const userIdentifier = user.display_name || `${user.first_name} ${user.last_name}` || user.email;
  
  const confirmMessage = isCurrentlyAdmin 
    ? `Remove admin privileges for ${userIdentifier}?`
    : `Make ${userIdentifier} an admin?`;
    
  if (confirm(confirmMessage)) {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        showNotification('Authentication required', 'error');
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}/api/users/${user.id}/admin-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAdmin: !isCurrentlyAdmin })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update user role');
      }
      
      showNotification(
        `User ${userIdentifier} ${isCurrentlyAdmin ? 'removed from' : 'added to'} admin role successfully!`,
        'success'
      );
      
      // Reload users
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      showNotification(`Error updating user role: ${error.message}`, 'error');
    }
  }
}

// Enable scrolling for the entire product modal content
if (productModal) {
  const modalContent = productModal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.style.overflowY = 'auto';
    modalContent.style.maxHeight = '90vh';
  }
}
