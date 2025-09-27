import { auth, db } from '../../firebase/firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const signupForm = document.getElementById('signup-form');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = signupForm.email.value;
    const password = signupForm.password.value;
    const confirmPassword = signupForm['confirm-password'].value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            console.log('User created:', user);

            // Add user to Firestore
            setDoc(doc(db, "users", user.uid), {
                email: user.email,
                createdAt: new Date()
            }).then(() => {
                console.log("User added to Firestore");
                window.location.href = 'login.html'; // Redirect to login page
            }).catch((error) => {
                console.error("Error adding user to Firestore: ", error);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error signing up:', errorCode, errorMessage);
            alert(`Error: ${errorMessage}`);
        });
});