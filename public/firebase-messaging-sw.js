importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// IMPORTANTE: Sostituisci questi valori con quelli del tuo progetto Firebase
// (gli stessi che hai nel file .env.local). Il Service Worker lavora in background 
// e non ha accesso alle variabili d'ambiente di Vite.
const firebaseConfig = {
  apiKey: "AIzaSyBpy52RYwUC7g-t5-U6wb2QM7Ixlc_SgSU",
  authDomain: "rubinoleveling.firebaseapp.com",
  projectId: "rubinoleveling",
  storageBucket: "rubinoleveling.firebasestorage.app",
  messagingSenderId: "796778616166",
  appId: "1:796778616166:web:6e756b96fb6b490f1364a7"
};

try {
  if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Messaggio in background ricevuto: ', payload);

      const notificationTitle = payload?.notification?.title || 'Nuovo aggiornamento';
      const notificationOptions = {
        body: payload?.notification?.body || '',
        // Puoi mettere l'icona della tua app (es. pwa-192x192.png)
        icon: '/vite.svg',
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch (e) {
  console.log('Errore Service Worker:', e);
}
