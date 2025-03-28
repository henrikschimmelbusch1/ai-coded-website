// Login functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const lobbySection = document.getElementById('lobby-section');
    const loginBtn = document.getElementById('login-btn');
    const playerIdInput = document.getElementById('player-id');
    
    // Current player ID
    let currentPlayerId = null;
    
    // Check if user is already logged in (from localStorage)
    const checkExistingLogin = () => {
        const savedPlayerId = localStorage.getItem('ticTacToePlayerId');
        if (savedPlayerId !== null) {
            playerIdInput.value = savedPlayerId;
            // Auto login option can be enabled here
            // login(savedPlayerId);
        }
    };
    
    // Login function
    const login = (playerId) => {
        if (playerId === '' || isNaN(playerId) || playerId < 0 || playerId > 9) {
            alert('Please enter a valid player number (0-9)');
            return;
        }
        
        currentPlayerId = playerId;
        
        // Save to localStorage for persistence
        localStorage.setItem('ticTacToePlayerId', playerId);
        
        // Create or update player in database
        dbHelpers.createPlayer(playerId)
            .then(() => {
                console.log('Logged in as Player', playerId);
                
                // Add logout event listener to window
                window.addEventListener('beforeunload', () => {
                    dbHelpers.setPlayerOnline(currentPlayerId, false);
                });
                
                // Show lobby section, hide login section
                loginSection.classList.add('hidden');
                lobbySection.classList.remove('hidden');
                
                // Initialize lobby
                initLobby(currentPlayerId);
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Error logging in. Please try again.');
            });
    };
    
    // Login button click event
    loginBtn.addEventListener('click', () => {
        login(playerIdInput.value);
    });
    
    // Enter key in input field
    playerIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            login(playerIdInput.value);
        }
    });
    
    // Check for existing login on page load
    checkExistingLogin();
    
    // Expose login functions to global scope
    window.loginFunctions = {
        getCurrentPlayerId: () => currentPlayerId,
        logout: () => {
            if (currentPlayerId) {
                dbHelpers.setPlayerOnline(currentPlayerId, false)
                    .then(() => {
                        localStorage.removeItem('ticTacToePlayerId');
                        currentPlayerId = null;
                        lobbySection.classList.add('hidden');
                        loginSection.classList.remove('hidden');
                    })
                    .catch(error => {
                        console.error('Logout error:', error);
                    });
            }
        }
    };
});
