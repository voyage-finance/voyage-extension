import { initializeApp } from 'firebase/app';
import { getAuth, sendSignInLinkToEmail } from 'firebase/auth';
import browser from 'webextension-polyfill';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyABpOcsIRxfQgftb9MDADME2HGLlTcYwJY',
  authDomain: 'voyage-protocol.firebaseapp.com',
  projectId: 'voyage-protocol',
  storageBucket: 'voyage-protocol.appspot.com',
  messagingSenderId: '590897144911',
  appId: '1:590897144911:web:f0d2442b29e23f9ac0f63a',
  measurementId: 'G-82BKGD1FTE',
};
initializeApp(firebaseConfig);

export const sendMagicLink = async (email: string, resend = false) => {
  const auth = getAuth();
  await sendSignInLinkToEmail(auth, email, {
    url: 'http://localhost:3000/auth',
    handleCodeInApp: true,
  });
  // save the email so we don't have to resend it it has already been done.
  // TODO: we should check if there is a pending one and not re-send the email unless the users says so
  await browser.storage.local.set({ 'auth.email.pending': email });
};
