// Electron main process
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('Environment variables loaded from .env file');
  }
} else {
  // Create a sample .env file if it doesn't exist
  console.log('Creating sample .env file...');
  const sampleEnv = [
    '# Supabase connection (replace with your actual values)',
    'SUPABASE_URL=https://your-project.supabase.co',
    'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key'
  ].join('\n');
  
  try {
    fs.writeFileSync(envPath, sampleEnv);
    console.log('Sample .env file created. Please update it with your real values.');
  } catch (error) {
    console.error('Error creating sample .env file:', error);
  }
}

// Initialize the store for persistent data (like Supabase keys and auth)
const store = new Store();

// Set default values from environment variables if they exist
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  if (!store.has('supabase.url') || !store.has('supabase.key')) {
    console.log('Setting default Supabase config from environment variables');
    store.set('supabase.url', process.env.SUPABASE_URL);
    store.set('supabase.key', process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
}

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      devTools: true, // Always enable DevTools
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'Plugged Admin Dashboard'
  });

  // Load the index.html of the app
  mainWindow.loadFile('index.html');

  // Open the DevTools automatically if developing
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
  
  // Run tests if in test mode
  if (process.argv.includes('--test-supabase')) {
    const { testSupabaseConnection } = require('./test-supabase');
    const { verifyDatabaseSchema } = require('./db-verify');
    const url = store.get('supabase.url') || '';
    const key = store.get('supabase.key') || '';
    
    if (url && key) {
      console.log('Running Supabase connection test...');
      testSupabaseConnection(url, key);
      
      // Also verify database schema
      verifyDatabaseSchema(url, key)
        .then(result => {
          if (result.success) {
            console.log('✅ Database verification successful');
          } else {
            console.error('❌ Database verification failed:', result.message);
          }
        })
        .catch(err => {
          console.error('Database verification error:', err);
        });
    } else {
      console.log('Supabase configuration not found. Please configure in the app settings.');
    }
  }

  // Create the application menu
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'toggleDevTools', label: 'Developer Tools' }
      ]
    },
    {
      label: 'Database',
      submenu: [
        { 
          label: 'Verify Connection',
          click: async () => {
            if (!mainWindow) return;
            
            const { testSupabaseConnection } = require('./test-supabase');
            const url = store.get('supabase.url') || process.env.SUPABASE_URL || '';
            const key = store.get('supabase.key') || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
            
            if (!url || !key) {
              mainWindow.webContents.send('show-env-notification', 
                'Supabase configuration not found. Please configure in Settings.', 'error');
              return;
            }
            
            // Use notification only when user explicitly requests this action
            mainWindow.webContents.send('show-env-notification', 
              'Testing database connection...', 'info');
            
            try {
              await testSupabaseConnection(url, key);
              mainWindow.webContents.send('show-env-notification', 
                'Database connection successful!', 'success');
            } catch (error) {
              mainWindow.webContents.send('show-env-notification', 
                `Database connection failed: ${error.message}`, 'error');
            }
          }
        },
        { 
          label: 'Verify Schema',
          click: async () => {
            if (!mainWindow) return;
            
            // Send verification request to renderer
            mainWindow.webContents.send('verifyDatabase');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  
  // Just log configuration status - NO notifications at startup
  setTimeout(() => {
    if (!mainWindow) return;
    
    try {
      // Check configuration status silently
      const hasDefaultUrl = !process.env.SUPABASE_URL || 
                            process.env.SUPABASE_URL === 'https://your-project.supabase.co';
      const hasDefaultKey = !process.env.SUPABASE_SERVICE_ROLE_KEY || 
                            process.env.SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key';
      
      const hasStoredUrl = !!store.get('supabase.url');
      const hasStoredKey = !!store.get('supabase.key');
      
      // Log status only - no UI notifications
      console.log('Configuration status:');
      console.log(`- Environment URL: ${hasDefaultUrl ? 'default/missing' : 'configured'}`);
      console.log(`- Environment Key: ${hasDefaultKey ? 'default/missing' : 'configured'}`);
      console.log(`- Stored URL: ${hasStoredUrl ? 'configured' : 'missing'}`);
      console.log(`- Stored Key: ${hasStoredKey ? 'configured' : 'missing'}`);
    } catch (error) {
      console.error('Error checking configuration:', error);
      // Don't show any UI notification
    }
  }, 2000);
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay active until the user quits explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window when the dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handler for getting Supabase configuration
ipcMain.handle('getSupabaseConfig', () => {
  // Prioritize stored configuration, but fallback to environment variables
  const storedUrl = store.get('supabase.url');
  const storedKey = store.get('supabase.key');
  
  // Use stored values if they exist, otherwise use environment variables
  const url = storedUrl || process.env.SUPABASE_URL || '';
  const key = storedKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  const isConfigured = !!url && !!key;
  
  // Log where the configuration is coming from
  if (isConfigured) {
    const source = storedUrl && storedKey ? 'stored configuration' : 'environment variables';
    console.log(`Using Supabase configuration from ${source}`);
  }
  
  return { url, key, isConfigured };
});

// IPC handler for setting Supabase configuration
ipcMain.handle('setSupabaseConfig', (event, { url, key }) => {
  store.set('supabase.url', url);
  store.set('supabase.key', key);
  return { success: true };
});

// IPC handlers for session management
ipcMain.handle('saveSession', (event, session) => {
  store.set('auth.session', session);
  return { success: true };
});

ipcMain.handle('getSession', () => {
  return store.get('auth.session') || null;
});

ipcMain.handle('clearSession', () => {
  store.delete('auth.session');
  return { success: true };
});

// IPC handler for database verification
ipcMain.handle('verifyDatabase', async (event) => {
  const { verifyDatabaseSchema } = require('./db-verify');
  const url = store.get('supabase.url') || '';
  const key = store.get('supabase.key') || '';
  
  if (!url || !key) {
    return { 
      success: false, 
      message: 'Supabase configuration not found. Please configure in the app settings.' 
    };
  }
  
  try {
    return await verifyDatabaseSchema(url, key);
  } catch (error) {
    return { 
      success: false, 
      message: `Database verification error: ${error.message}` 
    };
  }
});
