# 🔧 Fix Dashboard URL Redirect Issue

## Problem

When you log in to the site (https://marketplace-site-a8bm.onrender.com) as an admin, vendor, or livreur, you get redirected to:
```
https://marketplace-dashboard.onrender.com/  ❌ WRONG URL (404 - Page Not Found)
```

Instead of the correct dashboard URL:
```
https://marketplace-dashboard-tfqs.onrender.com/  ✅ CORRECT URL
```

## Root Cause

The `VITE_DASHBOARD_URL` environment variable is not set (or set incorrectly) in your Render deployment for the **Site** service.

## Solution

You need to set the correct environment variable in Render. Follow these steps:

### Step 1: Access Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Sign in to your account

### Step 2: Configure Site Service

1. Find and click on your **marketplace-site** service (the one deployed at https://marketplace-site-a8bm.onrender.com)
2. Click on the **Environment** tab in the left sidebar

### Step 3: Add/Update Environment Variables

Add or update these environment variables:

| Variable Name | Value |
|---------------|-------|
| `VITE_API_URL` | `https://marketplacetun.onrender.com` |
| `VITE_DASHBOARD_URL` | `https://marketplace-dashboard-tfqs.onrender.com` |

**IMPORTANT**: 
- Make sure there are NO trailing slashes in the URLs
- The dashboard URL must be exactly: `https://marketplace-dashboard-tfqs.onrender.com`
- NOT: `https://marketplace-dashboard.onrender.com` (this is wrong)

### Step 4: Save and Redeploy

1. Click **Save Changes** button
2. Render will automatically trigger a new deployment
3. Wait for the deployment to complete (usually 2-5 minutes)

### Step 5: Verify the Fix

1. Clear your browser cache or open an incognito/private window
2. Go to https://marketplace-site-a8bm.onrender.com
3. Log in with admin credentials
4. You should now be redirected to: `https://marketplace-dashboard-tfqs.onrender.com` ✅

## How to Verify Environment Variables Are Set

After deployment completes:

1. Go to your site service in Render
2. Click **Environment** tab
3. Verify both `VITE_API_URL` and `VITE_DASHBOARD_URL` are listed
4. Verify `VITE_DASHBOARD_URL` shows: `https://marketplace-dashboard-tfqs.onrender.com`

## Why This Happens

Vite uses environment variables at **build time**, not runtime. When you deploy a static site on Render:
- Environment variables must be set BEFORE the build
- If not set, the code uses the default fallback (localhost for development)
- The variables are embedded into the built JavaScript files during `npm run build`

That's why you need to set them in Render's dashboard and redeploy.

## Additional Notes

- This same issue can occur with `VITE_API_URL` if it's not set correctly
- Always double-check your environment variables in Render after any deployment
- If you change environment variables, you must redeploy for changes to take effect

## Still Having Issues?

If the problem persists after following these steps:

1. Check the browser console for errors (F12 → Console tab)
2. Verify the deployment build logs in Render
3. Make sure you cleared your browser cache
4. Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
