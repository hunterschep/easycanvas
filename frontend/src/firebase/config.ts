// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQliFTw72ocI6bPfS-K_81V7Zvu7DZkcM",
  authDomain: "easycanvas-51b5c.firebaseapp.com",
  databaseURL: "https://easycanvas-default-rtdb.firebaseio.com",
  projectId: "easycanvas",
  storageBucket: "easycanvas.firebasestorage.app",
  messagingSenderId: "405524383226",
  appId: "1:405524383226:web:fdc31700d0ad05e3131043"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);