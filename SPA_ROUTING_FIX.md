# 🔧 Fix 404 Error for SPA Routing on Render

## Problem

When accessing the site at https://marketplace-site-a8bm.onrender.com, you might encounter:
- **404 (Not Found)** errors in the browser console
- Error message: `GET https://marketplace-site-a8bm.onrender.com/login?logout=true 404 (Not Found)`
- Routes like `/login?logout=true`, `/home`, `/shops`, etc. return 404 errors

This happens when:
1. You directly visit a URL like `https://marketplace-site-a8bm.onrender.com/home`
2. You refresh the page while on any route other than the root
3. You're redirected from the dashboard with query parameters like `?logout=true`

## Root Cause

This is a common issue with **Single Page Applications (SPAs)** deployed on static hosting:

1. When you visit `https://marketplace-site-a8bm.onrender.com/home`, the server tries to find a file at `/home`
2. Since this is a React SPA, there's no actual `/home` file - only `index.html` and JavaScript bundles
3. The server returns a 404 error because it can't find the requested file
4. React Router never gets a chance to handle the route client-side

## Solution

The fix is to add a `_redirects` file that tells Render (and other hosting providers like Netlify) to always serve `index.html` for any route, allowing React Router to handle the routing client-side.

### What Was Changed

1. **Added `/site/public/_redirects` file** with the following content:
   ```
   /* /index.html 200
   ```

2. **How It Works:**
   - The `/*` pattern matches ALL routes
   - `/index.html` is the file to serve for all matched routes
   - `200` is the HTTP status code (success)
   - This tells the server: "For any URL path, serve index.html with a 200 status"
   - Once index.html loads, React Router takes over and handles the client-side routing

### Why This Works

- **Before:** Server tries to find actual files → 404 for non-existent files
- **After:** Server always serves index.html → React app loads → React Router handles the route

### Deployment

When you build the site with `npm run build`, Vite automatically copies files from the `public/` folder to the `dist/` folder, including the `_redirects` file.

On Render:
1. The build process runs `npm run build`
2. The `_redirects` file is included in the `dist/` folder
3. Render detects the `_redirects` file and applies the routing rules
4. All routes now work correctly!

## How to Verify the Fix

After deployment:

1. **Test Direct URL Access:**
   - Visit `https://marketplace-site-a8bm.onrender.com/home` directly
   - Visit `https://marketplace-site-a8bm.onrender.com/login?logout=true`
   - All routes should load without 404 errors

2. **Test Refresh:**
   - Navigate to any page in the app
   - Refresh the browser (F5 or Ctrl+R)
   - The page should reload correctly without 404 errors

3. **Check Console:**
   - Open browser DevTools (F12)
   - Go to the Console tab
   - No 404 errors should appear for route navigation

## Additional Notes

### For Other Hosting Providers

The `_redirects` file works on:
- ✅ Render
- ✅ Netlify
- ✅ Cloudflare Pages

For other providers, you may need different configurations:

**Vercel:** Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Why Public Folder?

Vite automatically copies all files in the `public/` directory to the root of the `dist/` folder during build. This is the recommended place for:
- Static assets that don't need processing
- Configuration files like `_redirects`, `robots.txt`, `sitemap.xml`
- Favicon and other meta files

## Troubleshooting

If you still see 404 errors after deploying:

1. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or open an incognito/private window

2. **Verify Build Output:**
   - Check that `dist/_redirects` exists after running `npm run build`
   - Run: `ls -la site/dist/` to see the file

3. **Check Render Deployment:**
   - Go to Render Dashboard → Your Site Service
   - Click on the latest deployment
   - Verify the build succeeded
   - Check if the `_redirects` file is included in the deployed files

4. **Test Locally:**
   - Build: `npm run build`
   - Preview: `npm run preview`
   - Test routes: Visit http://localhost:4173/login?logout=true

## Related Issues

This fix also resolves:
- Direct URL navigation not working
- Refresh causing 404 errors
- Shared links not loading correctly
- Browser back/forward button issues on deployed app

## References

- [Vite Static Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [Render SPA Routing](https://render.com/docs/deploy-create-react-app#using-client-side-routing)
- [React Router Documentation](https://reactrouter.com/en/main/start/faq#what-is-client-side-routing)
