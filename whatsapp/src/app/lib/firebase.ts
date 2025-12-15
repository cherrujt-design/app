// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKwU5K-62hSoLoBtGlQUPiH9e1uv9YkBE",
  authDomain: "vibe-5b0c8.firebaseapp.com",
  projectId: "vibe-5b0c8",
  storageBucket: "vibe-5b0c8.firebasestorage.app",
  messagingSenderId: "856203289604",
  appId: "1:856203289604:web:89e4743a0a5976da878151",
  measurementId: "G-T401XBYHLD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics: any = null;
if (typeof window !== "undefined") {
  try { analytics = getAnalytics(app); } catch (e) { /* ignore in non-browser */ }
}

// Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

function signOutUser() {
  return signOut(auth);
}

// Firestore
const db = getFirestore(app);

function convId(a: string, b: string) { return [a, b].sort().join("|"); }

async function createOrUpdateUser(u: FirebaseUser) {
  if (!u || !u.uid) return;
  const ref = doc(db, "users", u.uid);
  await setDoc(ref, { uid: u.uid, displayName: u.displayName || null, email: u.email || null, photoURL: u.photoURL || null }, { merge: true });
}

async function fetchUsers() {
  const q = query(collection(db, "users"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addMessage(from: string, to: string, text: string) {
  const conversationId = convId(from, to);
  return addDoc(collection(db, "messages"), { conversationId, from, to, text, ts: serverTimestamp() });
}

// add a user document by email (used for adding friends by email)
async function addUserByEmail(email: string, displayName?: string) {
  if (!email) throw new Error('email required');
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  }
  const docRef = await addDoc(collection(db, 'users'), { email, displayName: displayName || null, createdAt: serverTimestamp() });
  const created = (await getDocs(query(collection(db, 'users'), where('__name__', '==', docRef.id)))).docs[0];
  return { id: docRef.id, ... (created?.data() || {}) };
}

function listenToConversation(a: string, b: string, cb: (msgs: any[]) => void) {
  const q = query(collection(db, "messages"), where("conversationId", "==", convId(a, b)), orderBy("ts", "asc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

function listenToUsers(cb: (users: any[]) => void) {
  const q = query(collection(db, "users"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export type { FirebaseUser };
export { app, analytics, auth, googleProvider, signInWithGoogle, signOutUser, onAuthStateChanged, db, createOrUpdateUser, fetchUsers, addMessage, listenToConversation, listenToUsers, addUserByEmail };