import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCeUC2aJIE0yMl0Pp3upvcVFESMN6TkyI0',
  authDomain: 'happygran-b33fc.firebaseapp.com',
  projectId: 'happygran-b33fc',
  storageBucket: 'happygran-b33fc.appspot.com',
  messagingSenderId: '174567403326',
  appId: '1:174567403326:web:4765f9e01c4eb6017ec66f',
  measurementId: 'G-9CFS5BWFLM',
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
