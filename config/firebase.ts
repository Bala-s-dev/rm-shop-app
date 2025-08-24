import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration from env
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
console.log(process.env.EXPO_PUBLIC_FIREBASE_API_KEY);

// Initialize Firebase
let app: any;
let auth;
let db;
let messaging = null;

try {
  app = initializeApp(firebaseConfig);

  // Persistent auth for React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });

  db = getFirestore(app);

  // Messaging only if supported (web only)
  if (typeof window !== 'undefined') {
    isSupported()
      .then((supported) => {
        if (supported) {
          messaging = getMessaging(app);
        }
      })
      .catch((error) => {
        console.warn('Firebase messaging not supported:', error);
      });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

export { app, auth, db, messaging };
