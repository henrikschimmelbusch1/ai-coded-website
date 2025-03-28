// Game functionality
function initGame(gameId, currentPlayerId) {
    const gameSection = document.getElementById('game-section');
    const resultSection = document.getElementById('result-section');
    const opponentIdSpan = document.getElementById('opponent-id');
    const currentTurnSpan = document.getElementById('current-turn');
    const resultMessage = document.getElementById('result-message');
    const exitGameBtn = document.getElementById('exit-game-btn');
    const backToLobbyBtn = document.getElementById('back-to-lobby-btn');
    const cells = document.querySelectorAll('.cell');
    
    let gameData = null;
    let opponentId = null;
    
    // Load game data
    const loadGameData = (snapshot) => {
        gameData = snapshot.val();
        
        if (!gameData) {
            alert('Game not found!');
            returnToLobby();
            return;
        }
        
        // Find opponent ID
        for (const playerId in gameData.players) {
            if (playerId != currentPlayerId) {
                opponentId = playerId;
                break;
            }
        }
        
        // Update opponent display
        opponentIdSpan.textContent = `Player ${opponentId}`;
        
        // Update turn display
        updateTurnDisplay();
        
        // Update board
        updateBoard();
        
        // Check game status
        checkGameStatus();
    };
    
    // Update the turn display
    const updateTurnDisplay = () => {
        if (gameData.status !== 'active') {
            currentTurnSpan.textContent = '-';
            return;
        }
        
        if (gameData.currentTurn == currentPlayerId) {
            currentTurnSpan.textContent = 'Your turn';
        } else {
            currentTurnSpan.textContent = `Player ${gameData.currentTurn}'s turn`;
        }
    };
    
    // Update the game board
    const updateBoard = () => {
        cells.forEach((cell, index) => {
            // Clear existing classes
            cell.classList.remove('x', 'o');
            
            const value = gameData.board[index];
            if (value) {
                cell.textContent = value;
                cell.classList.add(value.toLowerCase());
            } else {
                cell.textContent = '';
            }
        });
    };
    
    // Check if the game is over
    const checkGameStatus = () => {
        if (gameData.status === 'completed') {
            gameSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
            
            if (gameData.winner === 'draw') {
                resultMessage.textContent = 'Game ended in a draw!';
            } else if (gameData.winner == currentPlayerId) {
                resultMessage.textContent = 'You won the game!';
            } else {
                resultMessage.textContent = `Player ${gameData.winner} won the game!`;
            }
        }
    };
    
    // Make a move
    const makeMove = (index) => {
        // Check if it's the player's turn
        if (gameData.currentTurn != currentPlayerId) {
            alert("It's not your turn!");
            return;
        }
        
        // Check if the cell is already filled
        if (gameData.board[index] !== null) {
            alert("This cell is already filled!");
            return;
        }
        
        // Update the board
        const newBoard = [...gameData.board];
        newBoard[index] = gameData.marks[currentPlayerId];
        
        // Check for win or draw
        const result = checkWinOrDraw(newBoard);
        
        // Prepare update data
        const updateData = {
            board: newBoard,
            currentTurn: opponentId
        };
        
        // If game is over, update status and winner
        if (result.status === 'win') {
            updateData.status = 'completed';
            updateData.winner = currentPlayerId;
        } else if (result.status === 'draw') {
            updateData.status = 'completed';
            updateData.winner = 'draw';
        }
        
        // Update the game in the database
        dbHelpers.updateGame(gameId, updateData)
            .catch(error => {
                console.error('Error updating game:', error);
                alert('Error making move. Please try again.');
            });
    };
    
    // Check for win or draw
    const checkWinOrDraw = (board) => {
        // Win patterns: rows, columns, diagonals
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        // Check for win
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { status: 'win', pattern };
            }
        }
        
        // Check for draw
        if (!board.includes(null)) {
            return { status: 'draw' };
        }
        
        // Game still in progress
        return { status: 'active' };
    };
    
    // Return to lobby
    const returnToLobby = () => {
        // Stop listening to game updates
        dbHelpers.stopListeningToGame(gameId);
        
        // Hide game and result sections, show lobby
        gameSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        window.lobbyFunctions.showLobby();
    };
    
    // Cell click event
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => {
            if (gameData && gameData.status === 'active') {
                makeMove(index);
            }
        });
    });
    
    // Exit game button click event
    exitGameBtn.addEventListener('click', returnToLobby);
    
    // Back to lobby button click event
    backToLobbyBtn.addEventListener('click', returnToLobby);
    
    // Start listening to game updates
    dbHelpers.listenToGame(gameId, loadGameData);
}
