import { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { messaging, db } from '../firebase';

export default function PushNotificationManager({ currentUser }) {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (!messaging) return;

    if (Notification.permission === 'granted') {
      const swUrl = `${import.meta.env.BASE_URL}firebase-messaging-sw.js`;
      navigator.serviceWorker.register(swUrl).then(async (registration) => {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (vapidKey) {
          await navigator.serviceWorker.ready;
          // Chiamare getToken inizializza Firebase Messaging con il nostro Service Worker personalizzato
          getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
            .then(async (token) => {
              if (token) {
                // Sincronizza il token in Firestore ogni volta che l'app si avvia
                await setDoc(doc(db, 'fcm_tokens', currentUser), {
                  token: token,
                  user: currentUser,
                  updatedAt: new Date().toISOString()
                }, { merge: true });
              }
            })
            .catch(err => console.log("Errore silente token:", err));
        }

        onMessage(messaging, (payload) => {
          console.log('Messaggio ricevuto in primo piano:', payload);
          new Notification(payload.notification.title || 'Nuova notifica', {
            body: payload.notification.body || '',
            icon: '/vite.svg'
          });
        });
      }).catch(err => console.error("Errore registrazione SW:", err));
    }
  }, []);

  const handleSubscribe = async () => {
    if (!messaging) {
      alert("Firebase Messaging non è configurato. Controlla il file firebase.js");
      return;
    }

    try {
      setIsSubscribing(true);
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        // Usa la VAPID key dalle variabili d'ambiente
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          alert("Attenzione: VITE_FIREBASE_VAPID_KEY non trovata in .env.local");
          setIsSubscribing(false);
          return;
        }

        // Poiché siamo su GitHub Pages (sottocartella /RubinoLeveling/), 
        // dobbiamo registrare il Service Worker manualmente usando il base URL
        const swUrl = `${import.meta.env.BASE_URL}firebase-messaging-sw.js`;
        const registration = await navigator.serviceWorker.register(swUrl);
        await navigator.serviceWorker.ready;
        
        const token = await getToken(messaging, { 
          vapidKey,
          serviceWorkerRegistration: registration 
        });
        
        if (token) {
          console.log('FCM Token ottenuto:', token);
          // Salva il token in Firestore
          await setDoc(doc(db, 'fcm_tokens', currentUser), {
            token: token,
            user: currentUser,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          
          alert("Notifiche attivate con successo!");
        } else {
          alert("Impossibile ottenere il token per le notifiche.");
        }
      } else {
        alert("Permesso per le notifiche negato.");
      }
    } catch (error) {
      console.error("Errore durante l'attivazione delle notifiche:", error);
      alert("Si è verificato un errore: " + error.message);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Se l'utente ha già accettato, non mostriamo nulla (oppure potremmo mostrare un'icona nell'header)
  if (permission === 'granted') {
    return null; 
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center justify-between mb-4 border border-red-100 mx-4">
        <span>Hai bloccato le notifiche. Riattivale dalle impostazioni del browser.</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm flex items-center justify-between mb-4 shadow-sm border border-blue-100 mx-4">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 flex-shrink-0" />
        <span className="leading-tight font-medium">Attiva le notifiche per non perderti le faccende!</span>
      </div>
      <button 
        onClick={handleSubscribe} 
        disabled={isSubscribing}
        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {isSubscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Attiva'}
      </button>
    </div>
  );
}
