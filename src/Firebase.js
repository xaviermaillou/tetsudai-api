const firebase = require('firebase/app')

const firebaseConfig = {
    apiKey: "AIzaSyAgYaFPOTjzeGryOUZggarZ3vIwYYDrxZ8",
    authDomain: "kuramae-8baba.firebaseapp.com",
    projectId: "kuramae-8baba",
    storageBucket: "kuramae-8baba.appspot.com",
    messagingSenderId: "1028628439220",
    appId: "1:1028628439220:web:8cc595d5215d395d4af7e1"
};

firebase.initializeApp(firebaseConfig);

module.exports = firebase;