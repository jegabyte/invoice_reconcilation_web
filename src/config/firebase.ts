import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics only if supported
export const initializeAnalytics = async () => {
    const analyticsSupported = await isSupported();
    if (analyticsSupported && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
        return getAnalytics(app);
    }
    return null;
};

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Persistence not available');
    }
});

export default app;
