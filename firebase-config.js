// Firebase configuration
// This is a placeholder configuration that will be replaced with your actual Firebase project details
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
firebase.initializeApp(firebaseConfig);

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
