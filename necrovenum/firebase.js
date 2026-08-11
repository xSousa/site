import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBpNAD0BqVvOq_T8HfIGRJH5L1yoZ6O4tU",
    authDomain: "necrovenum-b702e.firebaseapp.com",
    projectId: "necrovenum-b702e",
    storageBucket: "necrovenum-b702e.firebasestorage.app",
    messagingSenderId: "358365294350",
    appId: "1:358365294350:web:5ce24fd1bbb674577d315f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);