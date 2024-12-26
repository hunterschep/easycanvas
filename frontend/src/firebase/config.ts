import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQliFTw72ocI6bPfS-K_81V7Zvu7DZkcM",
  authDomain: "easycanvas-51b5c.firebaseapp.com",
  databaseURL: "https://easycanvas-default-rtdb.firebaseio.com",
  projectId: "easycanvas",
  storageBucket: "easycanvas.firebasestorage.app",
  messagingSenderId: "405524383226",
  appId: "1:405524383226:web:fdc31700d0ad05e3131043"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();