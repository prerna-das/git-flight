import { auth } from '../../firebase/firebaseConfig.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const authLinks = document.getElementById('auth-links');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        authLinks.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userEmail.textContent = user.email;
    } else {
        // User is signed out
        authLinks.classList.remove('hidden');
        userInfo.classList.add('hidden');
        userEmail.textContent = '';
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        // Sign-out successful.
        console.log('User logged out');
        window.location.href = 'index.html';
    }).catch((error) => {
        // An error happened.
        console.error('Error logging out:', error);
    });
});