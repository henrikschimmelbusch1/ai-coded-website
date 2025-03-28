// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Tic-Tac-Toe application initialized');
    
    // Handle window unload to set player offline
    window.addEventListener('beforeunload', () => {
        const currentPlayerId = window.loginFunctions?.getCurrentPlayerId();
        if (currentPlayerId) {
            // Try to set player offline before page unload
            dbHelpers.setPlayerOnline(currentPlayerId, false);
        }
    });
    
    // Handle visibility change to update online status
    document.addEventListener('visibilitychange', () => {
        const currentPlayerId = window.loginFunctions?.getCurrentPlayerId();
        if (currentPlayerId) {
            if (document.visibilityState === 'visible') {
                dbHelpers.setPlayerOnline(currentPlayerId, true);
                // Refresh lobby if visible
                if (!document.getElementById('lobby-section').classList.contains('hidden')) {
                    window.lobbyFunctions?.refreshLobby();
                }
            } else {
                // Optional: You could set offline on hidden, but it might disconnect players too easily
                // dbHelpers.setPlayerOnline(currentPlayerId, false);
            }
        }
    });
    
    // Periodic ping to keep player online status updated
    setInterval(() => {
        const currentPlayerId = window.loginFunctions?.getCurrentPlayerId();
        if (currentPlayerId && document.visibilityState === 'visible') {
            dbHelpers.setPlayerOnline(currentPlayerId, true);
        }
    }, 60000); // Update every minute
});
