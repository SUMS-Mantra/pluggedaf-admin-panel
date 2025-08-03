# PluggedAF Admin Website

A modern web-based admin dashboard for the PluggedAF e-commerce platform, converted from the original Electron app.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- A running PluggedAF backend server
- Supabase project with the required database schema

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - The `.env` file should already contain your Supabase credentials
   - Ensure your backend server is running on port 8000
   - Make sure your Supabase project has a storage bucket named `product-images`

3. **Start the Admin Server:**
   ```bash
   npm start
   ```
   Or use the convenient batch file:
   ```bash
   ./start-web.cmd
   ```

4. **Access the Admin Dashboard:**
   Open your browser and navigate to: `http://localhost:3001`

## 📝 Features

### ✅ What's Working

- **Authentication:** Login with admin credentials
- **Dashboard:** View statistics for products, orders, users, and revenue
- **Products Management:**
  - Add new products with image uploads (✅ **FIXED** + Enhanced UX)
  - Edit existing products (✅ **ENHANCED** with loading states)
  - Delete products
  - View product list with proper image scaling
  - Upload up to 4 images per product (✅ **FIXED** + Loading indicators)
  - Support for bestseller marking
- **Orders Management:** 
  - View and manage customer orders
  - Update order status with tracking information (✅ **ENHANCED**)
  - Delete orders with confirmation (✅ **NEW**)
  - Revenue calculation from completed orders only (✅ **ENHANCED**)
- **Users Management:** View user accounts and roles
- **Settings:** Configure Supabase connection
- **Responsive Design:** Works on desktop and mobile devices
- **Dark Mode:** Modern dark theme interface

### ✨ Latest User Experience Improvements

- **🔄 Loading Indicators:** Visual feedback during image uploads and form submissions
- **✅ Success Notifications:** Clear confirmation messages for all actions
- **🎯 Enhanced Product Editing:** Robust form population with image preview loading
- **🚨 Better Error Handling:** Specific error messages and troubleshooting guidance

### 🖼️ Image Upload System

- **Drag & Drop Support:** Upload images by clicking or dragging files
- **Multiple Images:** Support for up to 4 images per product (image1, image2, image3, image4)
- **File Validation:** Automatic validation for image file types and size limits (5MB max)
- **Supabase Storage:** Images are stored in the `product-images` bucket
- **Preview System:** Real-time image previews with remove functionality
- **Proper Scaling:** Images are properly scaled and displayed in the product list

## 🔧 Configuration

### Backend CORS Settings

The backend has been updated to allow connections from `http://localhost:3001`. If you need to run on a different port, update the CORS settings in the backend's `server.ts` file.

### Supabase Storage Setup

Ensure your Supabase project has:
1. A storage bucket named `product-images`
2. Proper RLS policies for file upload/access
3. Public read access for product images

## 🛠️ Development

### File Structure

```
Plugged_Admin/
├── server.js              # Express web server
├── web-api.js             # Web API client (replaces Electron preload)
├── app.js                 # Main application logic
├── index.html             # Main HTML file
├── styles-modern.css      # Modern CSS styles
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
└── start-web.cmd          # Windows startup script
```

### Key Changes from Electron Version

1. **Web Server:** Express.js server replaces Electron main process
2. **API Client:** Web API client replaces Electron IPC
3. **Image Upload:** Direct Supabase storage integration
4. **Responsive Design:** Modern CSS Grid/Flexbox layout
5. **CORS Support:** Backend configured for web access

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure the backend includes `http://localhost:3001` in allowed origins
   - Restart the backend after making CORS changes

2. **Content Security Policy (CSP) Errors:**
   - CSP blocks connections to localhost:8000 (backend) or external resources
   - Fixed in the current version with proper CSP directives
   - If you see CSP errors, check the meta tag in index.html includes your backend URL

3. **Image Upload Fails:**
   - Check Supabase storage bucket exists and is named `product-images`
   - Verify storage policies allow uploads
   - Ensure file size is under 5MB
   - Verify Supabase client is properly initialized (check browser console)
   - **Fixed Issue:** Custom Supabase client now includes storage functionality
   - Look for "Cannot read properties of undefined (reading 'from')" errors - this indicates missing storage API

4. **Database Connection Issues:**
   - Verify Supabase credentials in `.env` file
   - Check database schema matches expected structure
   - Test connection using the Settings page
   - Look for "Supabase client not initialized" errors in browser console

### Required Database Tables

The admin dashboard expects these tables in your Supabase database:
- `products` (with image1, image2, image3, image4 columns)
- `orders`
- `order_items`
- `profiles`
- `payment_instructions`
- `sessions`

## 📱 Usage

1. **Login:** Use admin credentials to access the dashboard
2. **Add Products:** Click "Add Product" and fill in details with images
3. **Manage Orders:** View and update order statuses
4. **User Management:** View registered users and their roles
5. **Settings:** Configure database connection and test connectivity

## 🔐 Security

- Environment variables for sensitive configuration
- Secure file upload validation
- Admin-only access controls
- CORS protection for API endpoints

## 📦 Production Deployment

For production deployment:
1. Update CORS settings to include your production domain
2. Set proper environment variables
3. Configure Supabase storage policies
4. Use a process manager like PM2 for the Node.js server
5. Set up SSL/HTTPS with a reverse proxy (nginx/Apache)

## ⚡ Performance

- Optimized image loading with proper scaling
- Lazy loading for large product lists
- Efficient Supabase queries with proper indexing
- Modern CSS for fast rendering

## 🔧 Recent Fixes (Latest Update)

### Image Upload System - ✅ RESOLVED
- **Issue:** `TypeError: Cannot read properties of undefined (reading 'from')` during image uploads
- **Root Cause:** Custom Supabase client was missing storage API implementation
- **Solution:** Added complete storage functionality to custom Supabase client including:
  - `storage.from(bucket).upload()` method for file uploads
  - `storage.from(bucket).getPublicUrl()` method for accessing uploaded files
  - Proper error handling and response formatting
- **Result:** Image uploads now work correctly with URL storage in database

### User Experience Enhancements - ✅ NEW
- **Loading States:** Added visual loading indicators for:
  - Image upload process with spinner animation
  - Product form submission with button state changes
  - Product loading when editing with progress feedback
- **Success Notifications:** Enhanced feedback system with:
  - Individual image upload success messages
  - Product creation/update confirmations
  - Image loading confirmation when editing products
- **Error Handling:** Improved error reporting with:
  - Specific error messages for different failure types
  - Validation feedback for file types and sizes
  - Network connectivity status indicators

### Product Editing System - ✅ ENHANCED
- **Robust Data Loading:** Enhanced product editing with:
  - Comprehensive field validation and error checking
  - Proper image loading with progress tracking
  - Debug logging for troubleshooting
  - Graceful handling of missing or invalid data
- **Form State Management:** Improved form handling with:
  - Loading states during save operations
  - Button state management to prevent double-submission
  - Form reset functionality for clean editing experience

### Content Security Policy - ✅ RESOLVED  
- **Issue:** CSP blocking backend API calls and external resources
- **Solution:** Updated CSP meta tag to include proper directives for:
  - Backend API connections (`localhost:8000`)
  - Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`)
  - Supabase services (`*.supabase.co`)
- **Result:** All external resources now load properly

### Orders Management System - ✅ ENHANCED
- **Delete Functionality:** Added order deletion with:
  - Confirmation modal with order details
  - Warning messages about permanent deletion
  - Cascading deletion of order items
  - Loading states and success feedback
- **Revenue Calculation Fix:** Updated dashboard to:
  - Only count completed orders in total revenue
  - Show count of completed orders alongside revenue
  - Exclude pending, cancelled, or refunded orders from revenue totals
- **Enhanced UI:** Improved orders table with:
  - Wider actions column to accommodate delete button
  - Color-coded delete button for better visibility
  - Consistent table header ordering

### Database Integration - ✅ ENHANCED
- Added comprehensive debugging for Supabase initialization
- Enhanced error reporting for troubleshooting
- Added proper validation for image URL storage in database
- Improved hidden input field management for form data
