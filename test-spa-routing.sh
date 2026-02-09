#!/bin/bash

# Test script to verify SPA routing works correctly locally
# This simulates what happens in production when someone navigates to /login?logout=true

echo "🧪 Testing SPA Routing Configuration"
echo "===================================="
echo ""

# Check if _redirects file exists
echo "1️⃣  Checking _redirects file..."
if [ -f "site/public/_redirects" ]; then
    echo "✅ site/public/_redirects exists"
    echo "   Content: $(cat site/public/_redirects)"
else
    echo "❌ site/public/_redirects NOT FOUND"
    exit 1
fi

if [ -f "dashboard/public/_redirects" ]; then
    echo "✅ dashboard/public/_redirects exists"
    echo "   Content: $(cat dashboard/public/_redirects)"
else
    echo "❌ dashboard/public/_redirects NOT FOUND"
    exit 1
fi

echo ""

# Build the site
echo "2️⃣  Building site frontend..."
cd site
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Site build successful"
else
    echo "❌ Site build failed"
    exit 1
fi

# Check if _redirects is in dist
if [ -f "dist/_redirects" ]; then
    echo "✅ dist/_redirects exists in build output"
    echo "   Content: $(cat dist/_redirects)"
else
    echo "❌ dist/_redirects NOT in build output"
    exit 1
fi

# Check if 200.html exists
if [ -f "dist/200.html" ]; then
    echo "✅ dist/200.html exists (SPA fallback)"
else
    echo "⚠️  dist/200.html not found (optional)"
fi

cd ..
echo ""

# Build the dashboard
echo "3️⃣  Building dashboard frontend..."
cd dashboard
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Dashboard build successful"
else
    echo "❌ Dashboard build failed"
    exit 1
fi

# Check if _redirects is in dist
if [ -f "dist/_redirects" ]; then
    echo "✅ dist/_redirects exists in build output"
else
    echo "❌ dist/_redirects NOT in build output"
    exit 1
fi

cd ..
echo ""

# Test with preview server
echo "4️⃣  Testing with Vite preview server..."
echo "   Starting server on port 4173..."
cd site
npm run preview -- --port 4173 > /dev/null 2>&1 &
PREVIEW_PID=$!
sleep 3

# Test various routes
echo ""
echo "   Testing routes:"

# Test root
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/)
if [ "$HTTP_CODE" == "200" ]; then
    echo "   ✅ / → $HTTP_CODE"
else
    echo "   ❌ / → $HTTP_CODE (expected 200)"
fi

# Test /login
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/login)
if [ "$HTTP_CODE" == "200" ]; then
    echo "   ✅ /login → $HTTP_CODE"
else
    echo "   ❌ /login → $HTTP_CODE (expected 200)"
fi

# Test /login?logout=true (THE KEY TEST)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4173/login?logout=true")
if [ "$HTTP_CODE" == "200" ]; then
    echo "   ✅ /login?logout=true → $HTTP_CODE ⭐"
else
    echo "   ❌ /login?logout=true → $HTTP_CODE (expected 200) ⚠️"
fi

# Test /home
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/home)
if [ "$HTTP_CODE" == "200" ]; then
    echo "   ✅ /home → $HTTP_CODE"
else
    echo "   ❌ /home → $HTTP_CODE (expected 200)"
fi

# Test /shops
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/shops)
if [ "$HTTP_CODE" == "200" ]; then
    echo "   ✅ /shops → $HTTP_CODE"
else
    echo "   ❌ /shops → $HTTP_CODE (expected 200)"
fi

# Test /products
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/products)
if [ "$HTTP_CODE" == "200" ]; then
    echo "   ✅ /products → $HTTP_CODE"
else
    echo "   ❌ /products → $HTTP_CODE (expected 200)"
fi

# Clean up
kill $PREVIEW_PID > /dev/null 2>&1
cd ..

echo ""
echo "===================================="
echo "🎉 Local SPA Routing Tests Complete!"
echo ""
echo "✨ If all tests passed above, the SPA routing configuration is correct."
echo "📝 The issue is likely with Render deployment, not the code."
echo "📖 See DEBUG_404_ERROR.md for deployment troubleshooting steps."
echo ""
