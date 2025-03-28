importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Note: Service workers can't directly use environment variables
// These values need to be hardcoded here or injected during build
const firebaseConfig = {
  apiKey: "AIzaSyDxj1bjBqJox3deZsFUZUSXZCKK1drJeag",
  authDomain: "countdownvibes-20061.firebaseapp.com",
  projectId: "countdownvibes-20061",
  storageBucket: "countdownvibes-20061.firebasestorage.app",
  messagingSenderId: "1097614522360",
  appId: "1:1097614522360:web:bf7fe31abef981a476c80d"
  // measurementId is not needed in the service worker
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', // Add your app's icon path here
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
}); 