import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const isFirebaseConfigured = !!(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.trim() !== "" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.trim() !== ""
);

let app = null;
let db = null;
let auth = null;
const googleProvider = new GoogleAuthProvider();

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { app, db, auth, googleProvider, signInWithPopup, signOut, isFirebaseConfigured };
export { doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, getDocFromServer } from 'firebase/firestore';
