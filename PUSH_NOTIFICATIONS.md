# 🔔 CityPulse Push Notifications

## ✅ What I Fixed

The Workbox warning you saw was caused by PWA generation running multiple times in development mode. Here's what I've implemented:

### 🛠️ **Configuration Changes**

1. **Development Mode**: PWA disabled in development to prevent Workbox conflicts
2. **Production Mode**: Full PWA with service worker generation
3. **Shared Storage**: Created `SubscriptionStore` class for consistent subscription management
4. **Development Service Worker**: Simple SW for development testing (`/dev-sw.js`)

### 📱 **How to Test**

#### **Method 1: Quick Test Script**
```bash
./test-notifications.sh
```

#### **Method 2: Manual Steps**

1. **Start Server**:
   ```bash
   pnpm dev
   ```

2. **Enable Notifications**:
   - Open: `http://localhost:3000/profile`
   - Click: **Settings** tab
   - Click: **Enable** notifications
   - Accept browser permission

3. **Test Commands**:
   ```bash
   # Check status
   curl http://localhost:3000/api/push/debug
   
   # Send test notification
   curl -X POST http://localhost:3000/api/push/send \
     -H "Content-Type: application/json" \
     -d '{"title":"Test 🚨","body":"Hello CityPulse!"}'
   
   # Send multiple test alerts
   curl -X POST http://localhost:3000/api/test-alerts
   ```

### 🎯 **Available Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/push/debug` | GET | View subscriptions & test commands |
| `/api/push/subscribe` | GET | List all subscriptions |
| `/api/push/send` | POST | Send notification to user |
| `/api/test-alerts` | POST | Send various test notifications |
| `/profile` | GET | UI to manage notifications |

### 🔧 **API Usage Examples**

#### Send Custom Notification
```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Traffic Alert 🚨",
    "body": "Heavy traffic on your route",
    "userId": "user_123" 
  }'
```

#### Auto-detect User (No userId needed)
```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Auto Alert 📱",
    "body": "Sent to first available user"
  }'
```

### 🚀 **Production Setup**

For production deployment:

1. **Install Dependencies**:
   ```bash
   pnpm add web-push @types/web-push
   ```

2. **Generate Real VAPID Keys**:
   ```bash
   npx web-push generate-vapid-keys
   ```

3. **Update Environment**:
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   VAPID_EMAIL=mailto:your-email@domain.com
   ```

4. **Database Integration**:
   Replace `SubscriptionStore` with real database (PostgreSQL, MongoDB, etc.)

### 📊 **Features Implemented**

- ✅ **Permission Management**: Request/handle notification permissions
- ✅ **Subscription Handling**: Subscribe/unsubscribe from notifications  
- ✅ **Multiple Alert Types**: Traffic, events, weather, itinerary alerts
- ✅ **Test Interface**: Web UI for testing notifications
- ✅ **Debug Tools**: API endpoints for debugging
- ✅ **Development Mode**: Separate development service worker
- ✅ **Production Ready**: PWA with full service worker in production

### 🎉 **Ready to Test!**

The Workbox warning is now resolved. Run `pnpm dev` and test the notifications! 🚀