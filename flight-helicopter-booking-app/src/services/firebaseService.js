// This file contains functions for interacting with Firebase, including methods for reading and writing data to the Firebase database.

import firebase from 'firebase/app';
import 'firebase/database';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

export const writeData = (path, data) => {
    return database.ref(path).set(data);
};

export const readData = (path) => {
    return database.ref(path).once('value').then(snapshot => snapshot.val());
};

export const updateData = (path, data) => {
    return database.ref(path).update(data);
};

export const deleteData = (path) => {
    return database.ref(path).remove();
};