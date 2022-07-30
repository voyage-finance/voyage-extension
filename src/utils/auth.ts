// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const encodeRedirectUri = (email: string, fingerprint: string) => {
  return btoa(
    unescape(encodeURIComponent(JSON.stringify({ email, fingerprint })))
  );
};

// Initialize Firebase
// TODO: move keys in .env file
const firebaseConfig = {
  apiKey: 'AIzaSyABpOcsIRxfQgftb9MDADME2HGLlTcYwJY',
  authDomain: 'voyage-protocol.firebaseapp.com',
  projectId: 'voyage-protocol',
  storageBucket: 'voyage-protocol.appspot.com',
  messagingSenderId: '590897144911',
  appId: '1:590897144911:web:f0d2442b29e23f9ac0f63a',
  measurementId: 'G-82BKGD1FTE',
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export const auth = getAuth();
export default firestore;
