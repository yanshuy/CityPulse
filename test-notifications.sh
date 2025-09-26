#!/bin/bash

echo "🚀 CityPulse Push Notification Testing Guide"
echo "============================================="

echo ""
echo "📋 Quick Test Steps:"
echo "1. Start development server: pnpm dev"
echo "2. Open browser: http://localhost:3000/profile"
echo "3. Go to Settings tab → Enable notifications"
echo "4. Use the test commands below"

echo ""
echo "🔧 Test Commands:"
echo ""

echo "📊 Check subscription status:"
echo "curl http://localhost:3000/api/push/debug"

echo ""
echo "📱 Send test notification (auto-detect user):"
echo 'curl -X POST http://localhost:3000/api/push/send \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"title":"Test Alert 🚨","body":"Hello from CityPulse!"}'"'"

echo ""
echo "🎯 Send multiple test alerts:"
echo "curl -X POST http://localhost:3000/api/test-alerts"

echo ""
echo "📋 View all subscriptions:"
echo "curl http://localhost:3000/api/push/subscribe"

echo ""
echo "🧹 Clear all subscriptions (for testing):"
echo "curl -X POST http://localhost:3000/api/push/debug"

echo ""
echo "💡 Troubleshooting:"
echo "- If notifications don't work, check browser console (F12)"
echo "- Make sure to accept permission when prompted"
echo "- Use /profile → Settings to manage notifications"
echo "- Check Network tab in DevTools for API calls"

echo ""
echo "🌟 Ready to test! Start with: pnpm dev"