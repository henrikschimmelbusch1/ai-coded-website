// Firebase configuration
// This is a placeholder configuration that will be replaced with your actual Firebase project details
<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAtBEbhnCnNE87RKyOOtKQXaeXdcnvuRF0",
    authDomain: "tictactoes123.firebaseapp.com",
    databaseURL: "https://tictactoes123-default-rtdb.firebaseio.com",
    projectId: "tictactoes123",
    storageBucket: "tictactoes123.firebasestorage.app",
    messagingSenderId: "401297086979",
    appId: "1:401297086979:web:4fae774cad107f3fc88c36",
    measurementId: "G-X7F4KL06VT"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>

// Get a reference to the database service
const database = firebase.database();

// Database references
const playersRef = database.ref('players');
const gamesRef = database.ref('games');

// Helper functions for database operations
const dbHelpers = {
  // Player operations
  createPlayer: function(playerId) {
    return playersRef.child(playerId).set({
      id: playerId,
      online: true,
      lastSeen: firebase.database.ServerValue.TIMESTAMP
    });
  },
  
  setPlayerOnline: function(playerId, status) {
    return playersRef.child(playerId).update({
      online: status,
      lastSeen: firebase.database.ServerValue.TIMESTAMP
    });
  },
  
  getOnlinePlayers: function() {
    return playersRef.orderByChild('online').equalTo(true).once('value');
  },
  
  // Game operations
  createGame: function(gameData) {
    const newGameRef = gamesRef.push();
    return newGameRef.set({
      ...gameData,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => newGameRef.key);
  },
  
  updateGame: function(gameId, gameData) {
    return gamesRef.child(gameId).update({
      ...gameData,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  
  getGame: function(gameId) {
    return gamesRef.child(gameId).once('value');
  },
  
  getPlayerGames: function(playerId) {
    return gamesRef.orderByChild('players/' + playerId).equalTo(true).once('value');
  },
  
  listenToGame: function(gameId, callback) {
    return gamesRef.child(gameId).on('value', callback);
  },
  
  stopListeningToGame: function(gameId) {
    return gamesRef.child(gameId).off();
  }
};
