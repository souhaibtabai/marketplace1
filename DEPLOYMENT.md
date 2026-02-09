# Marketplace Deployment Guide for Render

This guide will help you deploy the marketplace application on Render with three separate services.

## Architecture

- **Backend API**: Node.js/Express server with PostgreSQL
- **Site Frontend**: React application for customers
- **Dashboard Frontend**: React application for admins/vendors

## Deployment URLs

- Backend: https://marketplacetun.onrender.com
- Site: https://marketplace-site-a8bm.onrender.com
- Dashboard: https://marketplace-dashboard-tfqs.onrender.com

## Prerequisites

1. Render account
2. PostgreSQL database on Render
3. GitHub repository connected to Render

## Step 1: Deploy PostgreSQL Database

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `marketplace-db`
   - Database: `marketplace`
   - User: Auto-generated
   - Region: Choose closest to your users
4. Note down the connection details (Internal Database URL and External Database URL)

## Step 2: Deploy Backend API

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `marketplacetun`
   - **Region**: Same as database
   - **Branch**: `main` or your production branch
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variables:
   
   **Option 1: Using DATABASE_URL (Recommended)**
   ```
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://marketplace-site-a8bm.onrender.com,https://marketplace-dashboard-tfqs.onrender.com
   DATABASE_URL=<your-render-database-internal-url>
   JWT_SECRET=<generate-a-secure-random-string>
   JWT_EXPIRES_IN=24h
   ```
   
   **Option 2: Using Individual Database Parameters**
   ```
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://marketplace-site-a8bm.onrender.com,https://marketplace-dashboard-tfqs.onrender.com
   DB_HOST=<your-postgres-internal-host>
   DB_PORT=5432
   DB_NAME=marketplace
   DB_USER=<your-db-user>
   DB_PASSWORD=<your-db-password>
   JWT_SECRET=<generate-a-secure-random-string>
   JWT_EXPIRES_IN=24h
   ```
   
   > **Note**: The application will automatically retry database connections up to 5 times with exponential backoff if the initial connection fails. This helps with production deployments where the database might not be immediately available.

6. Click "Create Web Service"

## Step 3: Deploy Site Frontend

1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `marketplace-site`
   - **Branch**: `main` or your production branch
   - **Root Directory**: `site`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://marketplacetun.onrender.com
   VITE_DASHBOARD_URL=https://marketplace-dashboard-tfqs.onrender.com
   ```

6. Click "Create Static Site"

## Step 4: Deploy Dashboard Frontend

1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `marketplace-dashboard`
   - **Branch**: `main` or your production branch
   - **Root Directory**: `dashboard`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://marketplacetun.onrender.com
   VITE_SITE_URL=https://marketplace-site-a8bm.onrender.com
   ```

6. Click "Create Static Site"

## Step 5: Verify Deployment

1. Wait for all services to build and deploy
2. Visit the Site URL: https://marketplace-site-a8bm.onrender.com
3. Try to:
   - Register a new account
   - Login
   - Browse products
   - Add items to cart
   - Complete checkout
   - View orders

4. Visit the Dashboard URL: https://marketplace-dashboard-tfqs.onrender.com
5. Login with admin credentials
6. Verify admin functions work

## Database Migration

If you need to run database migrations or seed data:

1. Go to your Backend service in Render
2. Click "Shell" to open a terminal
3. Run your migration commands:
   ```bash
   npm run migrate  # if you have migrations
   ```

## Troubleshooting

### CORS Errors
- Verify CORS_ORIGIN in backend includes both frontend URLs
- Check that environment variables are set correctly

### Database Connection Issues
- Verify DB credentials in backend environment variables
- Use Internal Database URL for better performance
- Check database is in the same region as backend

### Build Failures
- Check build logs in Render dashboard
- Verify package.json has correct scripts
- Ensure all dependencies are listed

### API Not Responding
- Check backend logs in Render dashboard
- Verify environment variables are set
- Check if database connection is successful

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=5000
CORS_ORIGIN=<frontend-urls-comma-separated>
DB_HOST=<postgres-host>
DB_PORT=5432
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>
JWT_SECRET=<secure-random-string>
JWT_EXPIRES_IN=24h
```

### Site Frontend (.env)
```
VITE_API_URL=<backend-url>
VITE_DASHBOARD_URL=<dashboard-url>
```

### Dashboard Frontend (.env)
```
VITE_API_URL=<backend-url>
VITE_SITE_URL=<site-url>
```

## Monitoring

- Monitor service health in Render dashboard
- Set up alerts for service downtime
- Check logs regularly for errors

## Updating

When you push changes to your GitHub repository:
1. Render will automatically trigger a new build
2. Wait for build to complete
3. Verify changes are live

## Security Notes

1. Keep JWT_SECRET secure and never commit it
2. Use strong database passwords
3. Enable HTTPS (Render provides this automatically)
4. Regularly update dependencies
5. Monitor for security vulnerabilities

## Support

For issues:
1. Check Render service logs
2. Review environment variables
3. Check database connectivity
4. Verify CORS configuration
