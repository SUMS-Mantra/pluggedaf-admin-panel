# Plugged Admin Dashboard

A simple Electron-based admin dashboard for the Plugged E-commerce platform.

## Features

- Product management (add, edit, delete)
- Order management and status updates
- User management
- Dashboard with key metrics
- Secure authentication
- Enhanced notification system
- Database schema verification
- Environment variable management

## Installation

1. Make sure you have Node.js installed (version 16+ recommended)

2. Install dependencies:

```bash
npm install
```

## Running the Application

You can run the application in two ways:

### Using npm from the Plugged_Admin directory

```bash
cd Plugged_Admin
npm start
```

### Using the start script from the root directory

For convenience, a start script is provided in the root directory:

```bash
start-admin.cmd
```

The application will automatically create a sample `.env` file if one doesn't exist.

## Configuration

There are two ways to configure your Supabase connection:

### Using .env file (recommended)

1. Create a `.env` file in the root directory with the following content:
```
# Supabase connection (replace with your actual values)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

2. The app will automatically load these values when it starts

### Using the Settings UI

1. Enter your Supabase URL and API Key in the Settings section

## Troubleshooting

### Database Connection Issues

If you're experiencing database connection issues:

1. Verify your Supabase URL and key in the Settings section
2. Use the "Verify Connection" option from the Database menu
3. Check that your Supabase project is active and the service is running
4. Ensure your IP address is not blocked by Supabase restrictions

### Database Schema Issues

If your database schema verification fails:

1. Use the "Verify Schema" option from the Database menu to get specific errors
2. Make sure all required tables exist in your database:
   - public.products
   - public.orders
   - public.order_items
   - public.profiles
   - public.payment_instructions
   - auth.users
3. Check that your service role key has the necessary permissions

### Environment Variables

If environment variables aren't loading correctly:

1. Make sure the .env file is in the root directory of the application
2. Check that the format is correct (no spaces around the equals sign)
3. Try setting the values directly in the Settings section of the app

### Application Notifications

The application uses modal dialogs for notifications instead of pop-up banners:

- Error messages appear with a red header
- Success messages appear with a green header
- Information messages appear with a blue header
- Warning messages appear with a yellow header

All notifications require manual dismissal by clicking the OK button or close icon.

### Network Issues

The application includes a local implementation of the Supabase client that works in offline mode with limited functionality. This prevents "library not found" errors when there are network connectivity issues. If you experience database-related issues:

1. Check your internet connection
2. Verify that you can access the Supabase website
3. Try reconnecting by saving your settings again

### Startup Behavior

The application is configured for completely silent startup with no notifications:

- All startup notifications are completely suppressed
- Initial load time notifications (first 5 seconds) are blocked
- Extended startup time notifications (first 30 seconds) are filtered
- Only critical errors and user-initiated actions will display notifications
- Multiple content checks prevent empty or system notifications

To configure the application:
1. Open the Settings section
2. Click "Save Settings"
3. Log in with your admin credentials

## Building for Distribution

To build the application for distribution:

```bash
npm run build
```

The packaged application will be available in the `dist` folder.

## Technology Stack

- Electron
- HTML/CSS/JavaScript (vanilla)
- Supabase JS Client
- Electron Store (for configuration)

## File Structure

- `main.js` - Electron main process
- `preload.js` - Preload script for secure IPC communication
- `index.html` - Main application HTML
- `app.js` - Application logic
- `styles.css` - Application styles

## Security

This application implements secure authentication through Supabase. Configuration data and session information are securely stored using electron-store. Communication between the renderer process and the main process is handled through a secure preload script with contextIsolation.
