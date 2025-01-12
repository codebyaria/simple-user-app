'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        console.log('test')
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    registration => {
                        console.log('ServiceWorker registration successful with scope:', registration.scope);
                    },
                    err => {
                        console.log('ServiceWorker registration failed:', err);
                    }
                );
            });
        }
    }, []);

    return null;
}