export type AlertType = 'traffic' | 'events' | 'weather' | 'itinerary' | 'general'

export interface Alert {
    id: string
    type: AlertType
    title: string
    message: string
    location?: string
    timestamp: number
    urgent?: boolean
    actionUrl?: string
}

export class AlertSystem {
    private static instance: AlertSystem

    static getInstance(): AlertSystem {
        if (!AlertSystem.instance) {
            AlertSystem.instance = new AlertSystem()
        }
        return AlertSystem.instance
    }

    /**
     * Send an alert notification to a specific user
     */
    async sendAlert(alert: Alert, userId?: string): Promise<boolean> {
        try {
            const targetUserId = userId || this.getCurrentUserId()

            const response = await fetch('/api/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: alert.title,
                    body: alert.message,
                    userId: targetUserId,
                    tag: `alert-${alert.type}-${alert.id}`,
                    icon: this.getIconForAlertType(alert.type),
                    url: alert.actionUrl || this.getUrlForAlertType(alert.type)
                })
            })

            if (!response.ok) {
                const error = await response.json()
                console.error('Failed to send push notification:', error)
                return false
            }

            // Store alert locally for history
            this.storeAlert(alert)
            console.log('✅ Alert sent successfully:', alert.title)
            return true
        } catch (error) {
            console.error('❌ Error sending alert:', error)
            return false
        }
    }

    /**
     * Send traffic alert
     */
    async sendTrafficAlert(message: string, location?: string): Promise<boolean> {
        const alert: Alert = {
            id: `traffic-${Date.now()}`,
            type: 'traffic',
            title: '🚨 Traffic Alert',
            message,
            location,
            timestamp: Date.now(),
            urgent: true,
            actionUrl: '/?action=traffic'
        }

        return this.sendAlert(alert)
    }

    /**
     * Send event notification
     */
    async sendEventAlert(eventName: string, message: string, location?: string): Promise<boolean> {
        const alert: Alert = {
            id: `event-${Date.now()}`,
            type: 'events',
            title: `🎉 ${eventName}`,
            message,
            location,
            timestamp: Date.now(),
            urgent: false,
            actionUrl: '/?action=events'
        }

        return this.sendAlert(alert)
    }

    /**
     * Send weather alert
     */
    async sendWeatherAlert(message: string, location?: string): Promise<boolean> {
        const alert: Alert = {
            id: `weather-${Date.now()}`,
            type: 'weather',
            title: '🌦️ Weather Alert',
            message,
            location,
            timestamp: Date.now(),
            urgent: true,
            actionUrl: '/'
        }

        return this.sendAlert(alert)
    }

    /**
     * Send itinerary reminder
     */
    async sendItineraryReminder(activity: string, time: string): Promise<boolean> {
        const alert: Alert = {
            id: `itinerary-${Date.now()}`,
            type: 'itinerary',
            title: '📅 Itinerary Reminder',
            message: `${activity} starts at ${time}`,
            timestamp: Date.now(),
            urgent: false,
            actionUrl: '/itinerary'
        }

        return this.sendAlert(alert)
    }

    /**
     * Get stored alerts from localStorage
     */
    getStoredAlerts(): Alert[] {
        try {
            const alerts = localStorage.getItem('citypulse_alerts')
            return alerts ? JSON.parse(alerts) : []
        } catch (error) {
            console.error('Error reading stored alerts:', error)
            return []
        }
    }

    /**
     * Clear all stored alerts
     */
    clearStoredAlerts(): void {
        localStorage.removeItem('citypulse_alerts')
    }

    private getIconForAlertType(type: AlertType): string {
        const icons = {
            traffic: '/icons/icon-192x192.svg',
            events: '/icons/icon-192x192.svg',
            weather: '/icons/icon-192x192.svg',
            itinerary: '/icons/icon-192x192.svg',
            general: '/icons/icon-192x192.svg'
        }
        return icons[type] || icons.general
    }

    private getUrlForAlertType(type: AlertType): string {
        const urls = {
            traffic: '/?action=traffic',
            events: '/?action=events',
            weather: '/?action=weather',
            itinerary: '/itinerary',
            general: '/'
        }
        return urls[type] || urls.general
    }

    private storeAlert(alert: Alert): void {
        try {
            const alerts = this.getStoredAlerts()
            alerts.unshift(alert)

            // Keep only last 50 alerts
            if (alerts.length > 50) {
                alerts.splice(50)
            }

            localStorage.setItem('citypulse_alerts', JSON.stringify(alerts))
        } catch (error) {
            console.error('Error storing alert:', error)
        }
    }

    private getCurrentUserId(): string {
        let userId = localStorage.getItem('citypulse_user_id')
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            localStorage.setItem('citypulse_user_id', userId)
        }
        return userId
    }
}