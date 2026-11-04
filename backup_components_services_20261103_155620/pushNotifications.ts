import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

const VAPID_KEY =
  "BBk4LGfpZE6Ct975qKT5daK1FCiUE1mvCSf4CzivTqfiofjXQ6uLelgLQukfMmmzOeZYcZffC4wqEdhn1JTdMHE";

async function obtenirEnregistrementServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

/**
 * Activation déclenchée par l'utilisateur depuis l'interface.
 */
export async function activatePushNotifications(): Promise<string> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("Les notifications push ne sont pas prises en charge.");
  }

  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    throw new Error("Firebase Messaging n'est pas pris en charge.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("L'autorisation des notifications a été refusée.");
  }

  const registration = await obtenirEnregistrementServiceWorker();

  const jeton = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!jeton) {
    throw new Error("Firebase n'a pas fourni de jeton.");
  }

  return jeton;
}

/**
 * Récupération silencieuse du jeton existant.
 * Ne déclenche aucune demande d'autorisation.
 */
export async function obtenirJetonPushExistant(): Promise<string | null> {
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    Notification.permission !== "granted"
  ) {
    return null;
  }

  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    return null;
  }

  const registration = await obtenirEnregistrementServiceWorker();

  const jeton = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  return jeton || null;
}

/**
 * Écoute les messages reçus lorsque l'application est ouverte.
 */
export async function listenToForegroundMessages(
  callback: (payload: unknown) => void,
): Promise<(() => void) | undefined> {
  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    return undefined;
  }

  return onMessage(messaging, callback);
}