# Marketplace Site Frontend

This is the customer-facing React application for the marketplace, built with Vite.

## Environment Variables

**IMPORTANT**: You must set the following environment variables for the application to work correctly:

### Required Environment Variables

Create a `.env` file in this directory (or set in Render deployment settings):

```env
VITE_API_URL=https://marketplacetun.onrender.com
VITE_DASHBOARD_URL=https://marketplace-dashboard-tfqs.onrender.com
```

### Local Development

For local development:
```env
VITE_API_URL=http://localhost:5000
VITE_DASHBOARD_URL=http://localhost:5174/dashboard
```

## Deployment on Render

### ⚠️ CRITICAL: Setting Environment Variables in Render

When deploying to Render, you **MUST** set these environment variables in the Render dashboard:

1. Go to your Render dashboard
2. Select the **marketplace-site** static site
3. Go to **Environment** tab
4. Add the following environment variables:
   - `VITE_API_URL` = `https://marketplacetun.onrender.com`
   - `VITE_DASHBOARD_URL` = `https://marketplace-dashboard-tfqs.onrender.com`

5. Click **Save Changes**
6. Render will automatically redeploy with the new environment variables

### Common Issue: Wrong Dashboard URL

**Problem**: When you log in as admin/vendor/livreur, you get redirected to a non-existent URL like `https://marketplace-dashboard.onrender.com/`

**Solution**: This happens when `VITE_DASHBOARD_URL` is not set correctly in Render. Follow the steps above to set it to the correct URL: `https://marketplace-dashboard-tfqs.onrender.com`

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tech Stack

- React + Vite
- TailwindCSS
- React Router
- Axios for API calls
