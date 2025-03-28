// Lobby functionality
function initLobby(currentPlayerId) {
    const lobbySection = document.getElementById('lobby-section');
    const gameSection = document.getElementById('game-section');
    const playersList = document.getElementById('players-list');
    const savedGamesList = document.getElementById('saved-games-list');
    
    // Clear existing lists
    playersList.innerHTML = '';
    savedGamesList.innerHTML = '';
    
    // Load online players
    const loadOnlinePlayers = () => {
        dbHelpers.getOnlinePlayers()
            .then(snapshot => {
                playersList.innerHTML = '';
                
                if (!snapshot.exists()) {
                    playersList.innerHTML = '<p>No other players online</p>';
                    return;
                }
                
                snapshot.forEach(childSnapshot => {
                    const player = childSnapshot.val();
                    
                    // Don't show current player in the list
                    if (player.id == currentPlayerId) {
                        return;
                    }
                    
                    const playerBtn = document.createElement('button');
                    playerBtn.classList.add('player-btn');
                    playerBtn.textContent = `Player ${player.id}`;
                    playerBtn.addEventListener('click', () => {
                        startNewGame(currentPlayerId, player.id);
                    });
                    
                    playersList.appendChild(playerBtn);
                });
                
                // If no other players were added
                if (playersList.children.length === 0) {
                    playersList.innerHTML = '<p>No other players online</p>';
                }
            })
            .catch(error => {
                console.error('Error loading players:', error);
                playersList.innerHTML = '<p>Error loading players</p>';
            });
    };
    
    // Load saved games
    const loadSavedGames = () => {
        dbHelpers.getPlayerGames(currentPlayerId)
            .then(snapshot => {
                savedGamesList.innerHTML = '';
                
                if (!snapshot.exists()) {
                    savedGamesList.innerHTML = '<p>No saved games</p>';
                    return;
                }
                
                let hasActiveGames = false;
                
                snapshot.forEach(childSnapshot => {
                    const game = childSnapshot.val();
                    const gameId = childSnapshot.key;
                    
                    // Only show games that are in progress
                    if (game.status === 'active') {
                        hasActiveGames = true;
                        
                        // Find opponent ID
                        let opponentId = null;
                        for (const playerId in game.players) {
                            if (playerId != currentPlayerId) {
                                opponentId = playerId;
                                break;
                            }
                        }
                        
                        const gameItem = document.createElement('div');
                        gameItem.classList.add('saved-game-item');
                        gameItem.textContent = `Game vs Player ${opponentId}`;
                        gameItem.addEventListener('click', () => {
                            joinGame(gameId);
                        });
                        
                        savedGamesList.appendChild(gameItem);
                    }
                });
                
                // If no active games were found
                if (!hasActiveGames) {
                    savedGamesList.innerHTML = '<p>No saved games</p>';
                }
            })
            .catch(error => {
                console.error('Error loading saved games:', error);
                savedGamesList.innerHTML = '<p>Error loading saved games</p>';
            });
    };
    
    // Start a new game with another player
    const startNewGame = (playerId, opponentId) => {
        const gameData = {
            board: Array(9).fill(null),
            currentTurn: playerId,
            players: {
                [playerId]: true,
                [opponentId]: true
            },
            marks: {
                [playerId]: 'X',
                [opponentId]: 'O'
            },
            status: 'active',
            winner: null
        };
        
        dbHelpers.createGame(gameData)
            .then(gameId => {
                joinGame(gameId);
            })
            .catch(error => {
                console.error('Error creating game:', error);
                alert('Error creating game. Please try again.');
            });
    };
    
    // Join an existing game
    const joinGame = (gameId) => {
        // Hide lobby, show game section
        lobbySection.classList.add('hidden');
        gameSection.classList.remove('hidden');
        
        // Initialize game with the game ID
        initGame(gameId, currentPlayerId);
    };
    
    // Set up real-time listeners
    playersRef.on('value', loadOnlinePlayers);
    gamesRef.orderByChild(`players/${currentPlayerId}`).equalTo(true).on('value', loadSavedGames);
    
    // Initial load
    loadOnlinePlayers();
    loadSavedGames();
    
    // Expose lobby functions to global scope
    window.lobbyFunctions = {
        refreshLobby: () => {
            loadOnlinePlayers();
            loadSavedGames();
        },
        showLobby: () => {
            gameSection.classList.add('hidden');
            lobbySection.classList.remove('hidden');
        }
    };
}
