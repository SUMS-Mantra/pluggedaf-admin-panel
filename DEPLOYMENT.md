# 🚀 PluggedAF Admin Panel - Production Deployment Guide

This guide covers deploying the PluggedAF Admin Panel to various hosting platforms for production use.

## 📋 Pre-Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] Supabase project is configured
- [ ] Environment variables are ready
- [ ] Admin panel tested locally
- [ ] Database schema is verified

## 🔧 Environment Configuration

### Required Environment Variables

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BACKEND_API_URL=https://your-backend-api.onrender.com
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## 🌐 Deployment Options

### Option 1: Render.com (Recommended)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Production ready admin panel"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `pluggedaf-admin-panel`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: `Node`

3. **Set Environment Variables**
   Add these in Render's environment variables section:
   ```
   NODE_ENV=production
   SUPABASE_URL=https://hopjdexiswnondudlojb.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   BACKEND_API_URL=https://pluggedaf-auth-api.onrender.com
   JWT_SECRET=your-jwt-secret
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy from your repository

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd c:\Plugged\Plugged_Admin
   vercel --prod
   ```

3. **Configure Environment Variables**
   In Vercel dashboard, add the same environment variables as above.

### Option 3: Netlify

1. **Build Command**: `npm install`
2. **Publish Directory**: `./`
3. **Environment Variables**: Add the same variables in Netlify dashboard

### Option 4: Heroku

1. **Create Procfile**
   ```
   web: npm start
   ```

2. **Deploy**
   ```bash
   heroku create pluggedaf-admin-panel
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=your-url
   # ... set other environment variables
   git push heroku main
   ```

## 🔒 Security Configuration

### 1. Update CORS Settings
Ensure your backend server allows requests from your admin panel domain:

```javascript
// In your backend server.ts
const allowedOrigins = [
  'https://your-admin-panel-domain.com',
  'https://your-frontend-domain.com'
];
```

### 2. Secure Environment Variables
- Never commit `.env` files to version control
- Use platform-specific environment variable settings
- Rotate JWT secrets regularly
- Use Supabase RLS policies

### 3. HTTPS Only
- Ensure all production deployments use HTTPS
- Update environment variables to use `https://` URLs
- Configure secure headers

## 🧪 Testing Production Deployment

### 1. Backend Connection Test
```bash
npm run test:backend
```

### 2. Manual Testing Checklist
- [ ] Admin panel loads without errors
- [ ] Supabase connection works
- [ ] Can fetch products from backend
- [ ] Can manage orders
- [ ] User management functions
- [ ] Image uploads work
- [ ] Authentication flows correctly

### 3. Performance Testing
- Check page load times
- Verify API response times
- Test with different network conditions

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Admin Panel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
      # Add deployment commands for your platform
```

## 📊 Monitoring & Maintenance

### 1. Health Checks
- Set up uptime monitoring
- Monitor API response times
- Check error logs regularly

### 2. Backup Strategy
- Regular database backups
- Environment variable backups
- Code repository backups

### 3. Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging first

## 🆘 Troubleshooting

### Common Issues

**CORS Errors**
- Check allowed origins in backend
- Verify environment variables
- Ensure HTTPS/HTTP consistency

**API Connection Failures**
- Test backend endpoint directly
- Check environment variables
- Verify network connectivity

**Database Issues**
- Verify Supabase credentials
- Check RLS policies
- Test connection with verification tool

### Support Resources
- Backend API documentation
- Supabase documentation
- Platform-specific deployment guides
- GitHub Issues for bug reports

## ✅ Post-Deployment Verification

1. **Admin Panel Accessibility**
   - Navigate to your deployed URL
   - Verify login functionality
   - Test all major features

2. **Backend Integration**
   - Products management
   - Order processing
   - User management
   - Real-time updates

3. **Performance**
   - Page load times < 3 seconds
   - API calls respond quickly
   - Images load properly

4. **Security**
   - HTTPS enabled
   - Authentication required
   - Proper CORS configuration

---

**🎉 Congratulations! Your PluggedAF Admin Panel is now production-ready!**

For additional support, refer to the main README.md or create an issue in the GitHub repository.
