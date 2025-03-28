import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

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
let app;
let auth = null;
let db = null;
let messaging = null;
let analytics = null;

try {
  // Check if required config values are present
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required Firebase config fields: ${missingFields.join(', ')}`);
  }

  app = initializeApp(firebaseConfig);
  
  if (typeof window !== 'undefined') {
    // Initialize core services first
    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize optional services
    const initializeServices = async () => {
      try {
        // Initialize Analytics if available
        analytics = getAnalytics(app);
        console.log('Analytics initialized successfully');

        // Initialize Messaging if supported
        if (await isSupported()) {
          messaging = getMessaging(app);
          console.log('Messaging initialized successfully');
        }
      } catch (error) {
        console.warn('Optional services initialization warning:', error);
      }
    };

    initializeServices().catch(console.warn);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Re-throw the error to prevent the app from continuing with invalid Firebase config
  throw error;
}

export { auth, db, messaging, analytics };
export default app; 