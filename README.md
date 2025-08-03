# PluggedAF Admin Panel

🚀 **Web-based Administration Interface for PluggedAF E-commerce Platform**

A modern, responsive admin panel built for managing your PluggedAF e-commerce store. This web application provides a comprehensive dashboard for managing products, orders, users, and analytics.

## ✨ Features

### 📦 Product Management
- ✅ Add, edit, and delete products
- 🖼️ Multi-image upload (up to 4 images per product)
- 📊 Inventory tracking with stock quantity
- 🏷️ Category management
- ⭐ Bestseller designation
- 💰 Pricing management (retail vs. sale price)

### 📋 Order Management
- 📱 View and track all orders
- 🔄 Update order status (pending, processing, shipped, delivered)
- 👤 Customer information access
- 💵 Order total and item details
- 📅 Order date and status history

### 👥 User Management
- 👤 View all registered users
- 🔐 Manage user roles and permissions
- 📊 User activity monitoring
- 🛡️ Account status management

### 📈 Dashboard & Analytics
- 📊 Real-time sales metrics
- 📈 Revenue tracking
- 👥 User growth statistics
- 📦 Inventory alerts
- 🚨 Low stock notifications

### 🔒 Security Features
- 🔐 Secure authentication system
- 🛡️ Role-based access control
- 🔑 Environment variable configuration
- 🌐 CORS protection
- 📝 Activity logging

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/SUMS-Mantra/pluggedaf-admin-panel.git
cd pluggedaf-admin-panel
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file in the root directory:
```env
# Supabase connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Custom port (default: 3001)
PORT=3001
```

4. **Start the application:**
```bash
npm start
```

The admin panel will be available at `http://localhost:3001`

### Alternative Start Methods

**Using the convenience script:**
```bash
start-admin.cmd  # Windows
```

**Using the web interface:**
```bash
npm run web
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `PORT` | Server port (default: 3001) | ❌ |

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Set up the database schema** by running the provided SQL scripts:
   - Product tables
   - Order management tables
   - User management tables
   - Cart functionality tables

3. **Configure Storage** for product images:
   - Create a `product-images` bucket
   - Set up proper RLS policies
   - Enable public read access

4. **Get your credentials:**
   - Project URL: `https://your-project.supabase.co`
   - Service Role Key: Found in Settings > API

### Configuration Methods

**Method 1: Environment File (Recommended)**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Method 2: Settings UI**
Navigate to the Settings section in the admin panel and enter your credentials directly.

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/6366f1/ffffff?text=Dashboard+Overview)

### Product Management
![Products](https://via.placeholder.com/800x400/10b981/ffffff?text=Product+Management)

### Order Tracking
![Orders](https://via.placeholder.com/800x400/f59e0b/ffffff?text=Order+Management)

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Tailwind CSS, Custom CSS
- **Backend Integration:** Supabase (PostgreSQL)
- **File Storage:** Supabase Storage
- **Authentication:** Supabase Auth
- **Runtime:** Node.js + Express
- **Image Processing:** Client-side upload with validation

## 📁 Project Structure

```
pluggedaf-admin-panel/
├── 📄 index.html              # Main admin interface
├── 🎨 styles.css              # Core styling
├── 🎨 styles-modern.css       # Modern UI components
├── ⚡ app.js                  # Main application logic
├── 🌐 web-api.js              # API communication layer
├── 🗄️ supabase.js             # Supabase client setup
├── 🔧 server.js               # Express server for web mode
├── 📦 package.json            # Dependencies and scripts
├── 🔒 .env                    # Environment configuration
├── 📚 README.md               # This file
└── 🚀 start-admin.cmd         # Windows start script
```

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Deployment

1. **Set environment variables** in your hosting platform
2. **Build the project** (if applicable)
3. **Start the server:**
```bash
npm run start:prod
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 API Endpoints

The admin panel communicates with your PluggedAF backend API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | Fetch all products |
| `/api/products` | POST | Create new product |
| `/api/products/:id` | PUT | Update product |
| `/api/products/:id` | DELETE | Delete product |
| `/api/orders` | GET | Fetch all orders |
| `/api/orders/:id` | PUT | Update order status |
| `/api/users` | GET | Fetch all users |
| `/api/users/:id` | PUT | Update user role |

## 🔧 Troubleshooting

### Common Issues

**🔌 Database Connection Issues**
- ✅ Verify Supabase URL and service role key
- ✅ Check Supabase project status
- ✅ Use "Verify Connection" in Database menu
- ✅ Ensure IP address isn't blocked

**📦 Product Image Upload Issues**
- ✅ Check Supabase storage bucket configuration
- ✅ Verify RLS policies for `product-images` bucket
- ✅ Ensure public read access is enabled
- ✅ Check file size limits (max 5MB per image)

**🔐 Authentication Problems**
- ✅ Verify service role key has proper permissions
- ✅ Check Supabase authentication settings
- ✅ Ensure admin user exists in users table

**🌐 CORS Issues**
- ✅ Update CORS settings in backend server
- ✅ Add admin panel URL to allowed origins
- ✅ Check browser console for CORS errors

### Database Schema Verification

Use the built-in schema verification tool:
1. Go to Database → Verify Schema
2. The system will check for required tables and columns
3. Follow suggested fixes for any missing components

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and formatting
- Add comments for complex functionality
- Test thoroughly before submitting PR
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** Check this README and inline code comments
- **Issues:** Report bugs via GitHub Issues
- **Questions:** Create a discussion thread
- **Email:** Contact the development team

## 🔗 Related Projects

- **[PluggedAF Frontend](https://github.com/SUMS-Mantra/pluggedaf-frontend)** - Customer-facing e-commerce site
- **[PluggedAF Backend](https://github.com/SUMS-Mantra/pluggedaf-backend)** - API server and business logic
- **[PluggedAF Mobile](https://github.com/SUMS-Mantra/pluggedaf-mobile)** - Mobile application

## ⭐ Acknowledgments

- Built with ❤️ for the PluggedAF e-commerce platform
- Powered by Supabase for backend infrastructure
- UI inspired by modern admin dashboard designs
- Thanks to all contributors and testers

---

**Made with ⚡ by the PluggedAF Team**

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
