// Em: lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
};

// Validação das variáveis de ambiente em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  const missingVars = [];
  if (!firebaseConfig.apiKey) missingVars.push('NEXT_PUBLIC_APIKEY');
  if (!firebaseConfig.authDomain) missingVars.push('NEXT_PUBLIC_AUTHDOMAIN');
  if (!firebaseConfig.projectId) missingVars.push('NEXT_PUBLIC_PROJECTID');
  
  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente Firebase faltando:', missingVars);
    console.error('📋 Configure o arquivo .env.local com suas credenciais do Firebase');
  } else {
    console.log('✅ Configuração Firebase carregada:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
  }
}

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { db, auth, app };