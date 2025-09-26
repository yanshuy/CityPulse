"use client"

import { useState, useEffect } from 'react'
import { Bell, BellOff, TestTube, AlertTriangle, CheckCircle2, Zap } from 'lucide-react'
import { PushNotificationService } from '@/lib/push-notifications'

export default function NotificationSettings() {
    const [isEnabled, setIsEnabled] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [loading, setLoading] = useState(false)
    const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const [error, setError] = useState<string>('')
    const [notificationTypes, setNotificationTypes] = useState({
        traffic: true,
        events: true,
        weather: true,
        itinerary: true
    })

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
            <div className="gumo-card p-4">
                <div className="flex items-center gap-3 text-[color:var(--gumo-muted)]">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm">
                        Push notifications are not supported in this browser.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Main Control */}
            <div className="gumo-card p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`
              p-2 rounded-xl transition-colors
              ${isEnabled
                                ? 'bg-[color:var(--gumo-yellow)]/20 text-[color:var(--gumo-yellow)]'
                                : 'bg-[color:var(--gumo-surface)] text-[color:var(--gumo-muted)]'
                            }
            `}>
                            {isEnabled ? (
                                <Bell className="h-5 w-5" />
                            ) : (
                                <BellOff className="h-5 w-5" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-[color:var(--gumo-text)]">Push Notifications</h3>
                            <p className="text-sm text-[color:var(--gumo-muted)]">
                                Get real-time alerts for traffic, events, and updates
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={toggleNotifications}
                        disabled={loading}
                        className={`
              px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm transform hover:scale-105 active:scale-95
              ${isEnabled
                                ? 'bg-[color:var(--gumo-yellow)] text-black hover:brightness-110 shadow-lg shadow-[color:var(--gumo-yellow)]/20'
                                : 'bg-[color:var(--gumo-navy)] text-[color:var(--gumo-text)] hover:bg-[color:var(--gumo-surface)] border border-[color:var(--gumo-yellow)]/20'
                            }
              ${loading ? 'opacity-50 cursor-not-allowed scale-100' : ''}
              disabled:cursor-not-allowed disabled:hover:scale-100
            `}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Loading...
                            </div>
                        ) : isEnabled ? 'Enabled' : 'Enable'}
                    </button>
                </div>

                {/* Permission status */}
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-[color:var(--gumo-muted)]">Permission:</span>
                    <span className={`
            px-2 py-1 rounded-lg font-medium
            ${permission === 'granted' ? 'bg-green-500/20 text-green-400' : ''}
            ${permission === 'denied' ? 'bg-red-500/20 text-red-400' : ''}
            ${permission === 'default' ? 'bg-[color:var(--gumo-yellow)]/20 text-[color:var(--gumo-yellow)]' : ''}
          `}>
                        {permission}
                    </span>
                </div>
            </div>

            {/* Notification Type Controls */}
            {isEnabled && (
                <div className="gumo-card p-4">
                    <h4 className="font-medium text-[color:var(--gumo-text)] mb-3 flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-[color:var(--gumo-yellow)]/20">
                            <Bell className="h-3 w-3 text-[color:var(--gumo-yellow)]" />
                        </div>
                        Notification Preferences
                    </h4>

                    <div className="space-y-3">
                        {Object.entries({
                            traffic: { icon: '🚗', label: 'Traffic Alerts', desc: 'Route congestion and delays' },
                            events: { icon: '🎉', label: 'Event Updates', desc: 'Nearby events and activities' },
                            weather: { icon: '🌦️', label: 'Weather Alerts', desc: 'Severe weather warnings' },
                            itinerary: { icon: '📅', label: 'Itinerary Reminders', desc: 'Scheduled activity alerts' }
                        }).map(([key, config]) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-[color:var(--gumo-bg)]/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{config.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium text-[color:var(--gumo-text)]">{config.label}</p>
                                        <p className="text-xs text-[color:var(--gumo-muted)]">{config.desc}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setNotificationTypes(prev => ({
                                        ...prev,
                                        [key]: !prev[key as keyof typeof prev]
                                    }))}
                                    className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${notificationTypes[key as keyof typeof notificationTypes]
                                            ? 'bg-[color:var(--gumo-yellow)]'
                                            : 'bg-[color:var(--gumo-surface)]'
                                        }
                  `}
                                >
                                    <div className={`
                    absolute w-4 h-4 bg-white rounded-full transition-transform top-1
                    ${notificationTypes[key as keyof typeof notificationTypes]
                                            ? 'translate-x-6'
                                            : 'translate-x-1'
                                        }
                  `} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error display */}
            {error && (
                <div className="gumo-card p-4 border-l-4 border-red-500">
                    <div className="flex items-center gap-3 text-red-400">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Browser permission denied help */}
            {permission === 'denied' && (
                <div className="gumo-card p-4 border-l-4 border-[color:var(--gumo-yellow)]">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[color:var(--gumo-yellow)]">
                            <Zap className="h-4 w-4" />
                            <span className="font-medium text-sm">Enable Notifications</span>
                        </div>
                        <div className="text-sm text-[color:var(--gumo-muted)] space-y-1">
                            <p>Notifications are blocked. To enable:</p>
                            <p>• Chrome: Click 🔒 icon → Notifications → Allow</p>
                            <p>• Firefox: Click shield icon → Notifications → Allow</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Test notification section */}
            {isEnabled && (
                <div className="gumo-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-[color:var(--gumo-purple)]/20">
                            <TestTube className="h-4 w-4 text-[color:var(--gumo-purple)]" />
                        </div>
                        <div>
                            <h4 className="font-medium text-[color:var(--gumo-text)]">Test Notifications</h4>
                            <p className="text-sm text-[color:var(--gumo-muted)]">
                                Send a test notification to verify everything works
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={sendTestNotification}
                        disabled={testStatus === 'sending'}
                        className={`
              w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
              transform hover:scale-105 active:scale-95
              ${testStatus === 'success'
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                                : testStatus === 'error'
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                    : 'bg-[color:var(--gumo-yellow)] text-black hover:brightness-110 shadow-lg shadow-[color:var(--gumo-yellow)]/20'
                            }
              ${testStatus === 'sending' ? 'opacity-50 cursor-not-allowed scale-100' : ''}
              disabled:cursor-not-allowed disabled:hover:scale-100
            `}
                    >
                        {testStatus === 'sending' && (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {testStatus === 'success' && <CheckCircle2 className="h-4 w-4" />}
                        {testStatus === 'error' && <AlertTriangle className="h-4 w-4" />}
                        {testStatus === 'idle' && <Zap className="h-4 w-4" />}

                        {testStatus === 'sending' ? 'Sending...' :
                            testStatus === 'success' ? 'Test Sent!' :
                                testStatus === 'error' ? 'Test Failed' :
                                    'Send Test Notification'}
                    </button>
                </div>
            )}

            {/* Info section */}
            <div className="gumo-card p-4 bg-gradient-to-r from-[color:var(--gumo-purple)]/10 to-[color:var(--gumo-yellow)]/10">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[color:var(--gumo-yellow)]/20 mt-0.5">
                        <Bell className="h-4 w-4 text-[color:var(--gumo-yellow)]" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-[color:var(--gumo-text)] mb-2">Notification Types</h4>
                        <div className="text-sm text-[color:var(--gumo-muted)] space-y-1">
                            <p>🚗 Traffic alerts on your routes</p>
                            <p>🎉 Event reminders and updates</p>
                            <p>🌦️ Weather warnings</p>
                            <p>📅 Itinerary changes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}