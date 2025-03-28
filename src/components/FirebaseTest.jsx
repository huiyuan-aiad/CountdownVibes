import React, { useEffect, useState } from 'react';
import { auth, db, analytics } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';

const FirebaseTest = () => {
  const [envStatus, setEnvStatus] = useState({ success: false, message: 'Checking...' });
  const [authStatus, setAuthStatus] = useState({ success: false, message: 'Checking...' });
  const [firestoreStatus, setFirestoreStatus] = useState({ success: false, message: 'Checking...' });
  const [analyticsStatus, setAnalyticsStatus] = useState({ success: false, message: 'Checking...' });

  useEffect(() => {
    // Check environment variables
    const checkEnvVariables = () => {
      const requiredEnvVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_MEASUREMENT_ID'
      ];

      const missingVars = requiredEnvVars.filter(
        varName => !import.meta.env[varName]?.trim()
      );

      if (missingVars.length === 0) {
        setEnvStatus({ success: true, message: 'Environment variables loaded successfully!' });
      } else {
        setEnvStatus({
          success: false,
          message: `Missing or empty environment variables: ${missingVars.join(', ')}`,
        });
      }
    };

    // Check Firebase Auth
    const checkAuth = () => {
      if (auth) {
        setAuthStatus({ success: true, message: 'Firebase Auth initialized successfully!' });
      } else {
        setAuthStatus({ success: false, message: 'Firebase Auth initialization failed' });
      }
    };

    // Check Firestore
    const checkFirestore = async () => {
      try {
        if (!db) {
          throw new Error('Firestore not initialized');
        }
        // Try to access a collection to verify connection
        await getDocs(collection(db, '_test_'));
        setFirestoreStatus({ success: true, message: 'Firestore connection successful!' });
      } catch (error) {
        // It's okay if collection doesn't exist
        if (error.code === 'permission-denied' || error.code === 'not-found') {
          setFirestoreStatus({ success: true, message: 'Firestore connection successful!' });
        } else {
          setFirestoreStatus({ success: false, message: `Firestore error: ${error.message}` });
        }
      }
    };

    // Check Analytics
    const checkAnalytics = async () => {
      try {
        if (!analytics) {
          throw new Error('Analytics not initialized');
        }
        // Try to log a test event
        await logEvent(analytics, 'test_event');
        setAnalyticsStatus({ success: true, message: 'Analytics initialized successfully!' });
      } catch (error) {
        setAnalyticsStatus({ 
          success: false, 
          message: `Analytics error: ${error.message}. This is expected in development environment.`
        });
      }
    };

    checkEnvVariables();
    checkAuth();
    checkFirestore();
    checkAnalytics();
  }, []);

  return (
    <div className="p-4 m-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Firebase Configuration Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold dark:text-white">Environment Variables:</h3>
          <p className={`${envStatus.success ? 'text-green-600' : 'text-red-600'}`}>
            {envStatus.message}
          </p>
        </div>

        <div>
          <h3 className="font-semibold dark:text-white">Authentication:</h3>
          <p className={`${authStatus.success ? 'text-green-600' : 'text-red-600'}`}>
            {authStatus.message}
          </p>
        </div>

        <div>
          <h3 className="font-semibold dark:text-white">Firestore:</h3>
          <p className={`${firestoreStatus.success ? 'text-green-600' : 'text-red-600'}`}>
            {firestoreStatus.message}
          </p>
        </div>

        <div>
          <h3 className="font-semibold dark:text-white">Analytics:</h3>
          <p className={`${analyticsStatus.success ? 'text-green-600' : 'text-yellow-600'}`}>
            {analyticsStatus.message}
          </p>
          {!analyticsStatus.success && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Note: Analytics errors are common in development. They will work properly in production.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest; 