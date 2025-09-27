"use client"

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator
        ) {
            // Use development service worker in dev mode, production SW in production
            const swUrl = process.env.NODE_ENV === 'production' ? '/sw.js' : '/dev-sw.js'

            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
                    console.log(`SW registered (${process.env.NODE_ENV}):`, registration)

                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed') {
                                    if (navigator.serviceWorker.controller) {
                                        // New update available
                                        console.log('New content available, please refresh.')

                                        // You can show a toast notification here
                                        if (confirm('New version available! Would you like to refresh?')) {
                                            window.location.reload()
                                        }
                                    }
                                }
                            })
                        }
                    })
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError)
                })
        }
    }, [])

    return null
}

// Hook for manual service worker management
export function useServiceWorker() {
    const updateServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then((registration) => {
                if (registration) {
                    registration.update()
                }
            })
        }
    }

    const unregisterServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then((registration) => {
                if (registration) {
                    registration.unregister()
                }
            })
        }
    }

    return {
        updateServiceWorker,
        unregisterServiceWorker,
    }
}
