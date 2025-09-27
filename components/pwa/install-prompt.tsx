"use client"

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
    prompt(): Promise<void>
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if app is already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        const isInWebAppiOS = (window.navigator as any).standalone === true
        setIsInstalled(isStandalone || isInWebAppiOS)

        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)

            // Show install prompt after 30 seconds if not installed
            setTimeout(() => {
                if (!isInstalled) {
                    setShowInstallPrompt(true)
                }
            }, 30000)
        }

        const appInstalledHandler = () => {
            setIsInstalled(true)
            setShowInstallPrompt(false)
            setDeferredPrompt(null)
            console.log('PWA was installed')
        }

        window.addEventListener('beforeinstallprompt', handler)
        window.addEventListener('appinstalled', appInstalledHandler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
            window.removeEventListener('appinstalled', appInstalledHandler)
        }
    }, [isInstalled])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt')
                setShowInstallPrompt(false)
                setDeferredPrompt(null)
            } else {
                console.log('User dismissed the install prompt')
            }
        } catch (error) {
            console.error('Error during installation:', error)
        }
    }

    const handleDismiss = () => {
        setShowInstallPrompt(false)

        // Don't show again for 7 days
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }

    // Check if user dismissed recently
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (dismissed) {
            const dismissedTime = parseInt(dismissed)
            const sevenDays = 7 * 24 * 60 * 60 * 1000
            if (Date.now() - dismissedTime < sevenDays) {
                setShowInstallPrompt(false)
                return
            }
        }
    }, [])

    if (!showInstallPrompt || isInstalled || !deferredPrompt) return null

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md">
            <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl p-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
                            <Download className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Install CityPulse</p>
                            <p className="text-sm text-gray-600">Add to home screen for quick access</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Dismiss install prompt"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                </div>
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={handleInstall}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-3 rounded-xl font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Install App
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    )
}
