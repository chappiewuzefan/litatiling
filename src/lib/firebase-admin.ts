import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

export function hasFirebaseAdminConfig() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      getPrivateKey(),
  );
}

export function getAdminFirestore() {
  if (!hasFirebaseAdminConfig()) {
    throw new Error("Firebase Admin environment variables are missing.");
  }

  const existingApp = getApps()[0];
  const app =
    existingApp ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getPrivateKey(),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

  return getFirestore(app);
}
