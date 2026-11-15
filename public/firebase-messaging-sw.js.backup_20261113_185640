importScripts(
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDO9bKH4vRi6f-5UET1WoBK26gL7qj2-s",
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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const destination = event.notification.data?.url || "/";
  const url = new URL(destination, self.location.origin);

  // Empêche une navigation vers un domaine externe.
  if (url.origin !== self.location.origin) {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      async (clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            if ("navigate" in client) {
              await client.navigate(url.href);
            }
            return client.focus();
          }
        }

        return clients.openWindow(url.href);
      },
    ),
  );
});