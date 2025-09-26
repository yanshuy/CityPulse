"use client"

import { useState, useEffect } from 'react'
import { Bell, BellOff, TestTube, AlertCircle, CheckCircle } from 'lucide-react'
import { PushNotificationService } from '@/lib/push-notifications'

export default function NotificationSettings() {
    const [isEnabled, setIsEnabled] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [loading, setLoading] = useState(false)
    const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const [error, setError] = useState<string>('')

    const pushService = PushNotificationService.getInstance()

    useEffect(() => {
        checkNotificationStatus()
    }, [])

    const checkNotificationStatus = async () => {
        if (!('Notification' in window)) {
            setError('Push notifications are not supported in this browser')
            return
        }

        try {
            setPermission(Notification.permission)

            await pushService.init()
            const subscription = await pushService.getSubscription()
            setIsEnabled(!!subscription)
        } catch (error) {
            console.error('Error checking notification status:', error)
            setError('Failed to check notification status')
        }
    }

    const toggleNotifications = async () => {
        setLoading(true)
        setError('')

        try {
            if (isEnabled) {
                // Disable notifications
                const success = await pushService.unsubscribe()
                if (success) {
                    setIsEnabled(false)
                } else {
                    setError('Failed to disable notifications')
                }
            } else {
                // Enable notifications
                const permission = await pushService.requestPermission()
                setPermission(permission)

                if (permission === 'granted') {
                    const subscription = await pushService.subscribe()
                    setIsEnabled(!!subscription)
                    if (!subscription) {
                        setError('Failed to subscribe to notifications')
                    }
                } else if (permission === 'denied') {
                    setError('Notification permission denied. Please enable in browser settings.')
                } else {
                    setError('Notification permission not granted')
                }
            }
        } catch (error) {
            console.error('Error toggling notifications:', error)
            setError('Failed to toggle notifications')
        } finally {
            setLoading(false)
        }
    }

    const sendTestNotification = async () => {
        if (!isEnabled) return

        setTestStatus('sending')
        setError('')

        try {
            const userId = localStorage.getItem('citypulse_user_id')

            const response = await fetch('/api/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'CityPulse Test 🚨',
                    body: 'This is a test notification! Your push notifications are working correctly.',
                    userId: userId,
                    tag: 'test-notification',
                    icon: '/icons/icon-192x192.svg',
                    url: '/'
                })
            })

            const result = await response.json()

            if (response.ok) {
                setTestStatus('success')
                setTimeout(() => setTestStatus('idle'), 3000)
            } else {
                setTestStatus('error')
                setError(result.error || 'Failed to send test notification')
                setTimeout(() => setTestStatus('idle'), 3000)
            }
        } catch (error) {
            console.error('Error sending test notification:', error)
            setTestStatus('error')
            setError('Network error sending test notification')
            setTimeout(() => setTestStatus('idle'), 3000)
        }
    }

    if (!('Notification' in window)) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">
                        Push notifications are not supported in this browser.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        {isEnabled ? (
                            <Bell className="h-5 w-5 text-yellow-500" />
                        ) : (
                            <BellOff className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                            <h3 className="font-medium text-gray-900">Push Notifications</h3>
                            <p className="text-sm text-gray-600">
                                Get real-time alerts for traffic, events, and updates
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={toggleNotifications}
                        disabled={loading}
                        className={`
              px-4 py-2 rounded-lg font-medium transition-colors text-sm
              ${isEnabled
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                        {loading ? 'Loading...' : isEnabled ? 'Enabled' : 'Enable'}
                    </button>
                </div>

                {/* Permission status */}
                <div className="text-xs text-gray-500 mb-2">
                    Permission: <span className={`
            font-medium
            ${permission === 'granted' ? 'text-green-600' : ''}
            ${permission === 'denied' ? 'text-red-600' : ''}
            ${permission === 'default' ? 'text-yellow-600' : ''}
          `}>
                        {permission}
                    </span>
                </div>
            </div>

            {/* Error display */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Browser permission denied help */}
            {permission === 'denied' && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700">
                        Notifications are blocked. To enable:
                        <br />• Chrome: Click the 🔒 icon in address bar → Notifications → Allow
                        <br />• Firefox: Click the shield icon → Permissions → Notifications → Allow
                    </p>
                </div>
            )}

            {/* Test notification button */}
            {isEnabled && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">Test Notifications</h4>
                    <p className="text-sm text-gray-600 mb-3">
                        Send a test notification to verify everything is working
                    </p>

                    <button
                        onClick={sendTestNotification}
                        disabled={testStatus === 'sending'}
                        className={`
              w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
              ${testStatus === 'success'
                                ? 'bg-green-100 text-green-800'
                                : testStatus === 'error'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-400 text-black hover:bg-yellow-300'
                            }
              ${testStatus === 'sending' ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                        {testStatus === 'sending' && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        )}
                        {testStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                        {testStatus === 'error' && <AlertCircle className="h-4 w-4" />}
                        {testStatus === 'idle' && <TestTube className="h-4 w-4" />}

                        {testStatus === 'sending' ? 'Sending...' :
                            testStatus === 'success' ? 'Test Sent!' :
                                testStatus === 'error' ? 'Test Failed' :
                                    'Send Test Notification'}
                    </button>
                </div>
            )}

            {/* Info section */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                    <strong>💡 Tip:</strong> You'll receive notifications for:
                    <br />• Traffic alerts on your routes
                    <br />• Event reminders and updates
                    <br />• Weather warnings
                    <br />• Itinerary changes
                </p>
            </div>
        </div>
    )
}