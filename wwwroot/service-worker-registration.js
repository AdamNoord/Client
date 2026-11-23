if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            await navigator.serviceWorker.register(new URL('service-worker.js', document.baseURI));
        } catch (error) {
            console.error('Service worker registration failed:', error);
        }
    });
}
