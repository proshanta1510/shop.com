const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "durgapur-enterprise.firebaseapp.com",
  databaseURL: "https://durgapur-enterprise-default-rtdb.firebaseio.com",
  projectId: "durgapur-enterprise",
  storageBucket: "durgapur-enterprise.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};
// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
var DB = firebase.database();
