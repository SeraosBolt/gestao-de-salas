import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDwwIpc8qLLVM2aeXOBdDRPJVaBJzICUYw",
  authDomain: "gestao-salas-86300.firebaseapp.com",
  projectId: "gestao-salas-86300",
  storageBucket: "gestao-salas-86300.firebasestorage.app",
  messagingSenderId: "772475863859",
  appId: "1:772475863859:web:43f90a07fe720fb4d6b446"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { db, auth, app };
