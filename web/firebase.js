// Firebase connection for Divine Elite Oil billing.
// The page script waits for window.FB (event "fb-ready") and uses only these helpers.
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, setDoc, deleteDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});
let db;
try {
  db = initializeFirestore(app, { ignoreUndefinedProperties: true, localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
} catch (e) {
  db = initializeFirestore(app, { ignoreUndefinedProperties: true });
}
const ref = (path) => doc(db, ...path.split("/"));

window.FB = {
  onAuth: (cb) => onAuthStateChanged(auth, cb),
  signIn: (email, pass) => signInWithEmailAndPassword(auth, email, pass),
  signUp: async (email, pass) => (await createUserWithEmailAndPassword(auth, email, pass)).user.uid,
  signOut: () => signOut(auth),
  // Create another person's login without signing the admin out.
  createUserOther: async (email, pass) => {
    const tmp = initializeApp(firebaseConfig, "tmp-" + Date.now());
    const tAuth = getAuth(tmp);
    try {
      try { return (await createUserWithEmailAndPassword(tAuth, email, pass)).user.uid; }
      catch (e) {
        if (e && e.code === "auth/email-already-in-use") return (await signInWithEmailAndPassword(tAuth, email, pass)).user.uid;
        throw e;
      }
    } finally { try { await signOut(tAuth); } catch (_) {} await deleteApp(tmp); }
  },
  get: async (path) => { const s = await getDoc(ref(path)); return s.exists() ? s.data() : null; },
  set: (path, data) => setDoc(ref(path), data),
  del: (path) => deleteDoc(ref(path)),
  onDoc: (path, cb, err) => onSnapshot(ref(path), (s) => cb(s.exists() ? s.data() : null), err),
  onColl: (name, cb, err) => onSnapshot(collection(db, name), (s) => cb(s.docs.map((d) => ({ ...d.data(), id: d.id }))), err),
};
window.dispatchEvent(new Event("fb-ready"));

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
