const toastsView = new Toasts(document.querySelector('body'));

const trackInstalling = (worker) => {
    worker.addEventListener('statechange', function() {
        if (worker.state === 'installed') {
            updateReady(worker);
        }
    });
};

const updateReady = (worker) => {
    const toast = toastsView.show("New version available", {
        buttons: ['refresh', 'dismiss']
    });

    toast.answer.then((answer) => {
        if (answer !== 'refresh') return;
        worker.postMessage({action: 'skipWaiting'});
    });
};

const registerServiceWorker = () => {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.register('/sw.js').then((reg) => {
        if (!navigator.serviceWorker.controller) {
            return;
        }

        if (reg.waiting) {
            updateReady(reg.waiting);
            return;
        }

        if (reg.installing) {
            trackInstalling(reg.installing);
            return;
        }

        reg.addEventListener('updatefound', () => trackInstalling(reg.installing));
    });

    // Ensure refresh is only called once.
    // This works around a bug in "force update on reload".
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
};

// registerServiceWorker();