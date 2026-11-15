// Ce gestionnaire doit être enregistré AVANT le SDK Firebase.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.stopImmediatePropagation();

  const donnees = event.notification.data || {};
  const url = new URL("/messagerie", self.location.origin);

  let ancienneUrl = null;

  if (donnees.url) {
    try {
      ancienneUrl = new URL(donnees.url, self.location.origin);
    } catch (erreur) {
      console.warn("Ancienne URL de notification invalide :", erreur);
    }
  }

  const notificationId =
    donnees.notification_id ||
    ancienneUrl?.searchParams.get("notification_id");

  const ficheId =
    donnees.fiche_id ||
    ancienneUrl?.searchParams.get("fiche_id");

  if (notificationId) {
    url.searchParams.set("notification_id", String(notificationId));
  }

  if (ficheId) {
    url.searchParams.set("fiche_id", String(ficheId));
  }

  event.waitUntil(
    (async () => {
      const clientsExistants = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const client = clientsExistants.find(
        (element) => element.url.startsWith(self.location.origin)
      );

      if (client) {
        try {
          const clientNavigue = await client.navigate(url.href);

          if (clientNavigue) {
            await clientNavigue.focus();
            return;
          }
        } catch (erreur) {
          console.warn("Navigation de l'onglet existant impossible :", erreur);
        }
      }

      await clients.openWindow(url.href);
    })()
  );
});

importScripts(
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDO9bKH4vRi6f-5UET1WoBK26lG7Lqj2-s",
  authDomain: "scdip-6b090.firebaseapp.com",
  projectId: "scdip-6b090",
  storageBucket: "scdip-6b090.firebasestorage.app",
  messagingSenderId: "386131566761",
  appId: "1:386131566761:web:4077ed09f0f8a2e10509b8",
  measurementId: "G-W8XGPX86C9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "SCDIP - PNLP";

  const options = {
    body:
      payload.notification?.body ||
      "Vous avez une nouvelle notification. Connectez-vous à SCDIP.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {
      ...(payload.data || {}),
      url: payload.data?.url || "/",
    },
  };

  return self.registration.showNotification(title, options);
});
