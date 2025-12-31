// Application State
const app = {
    currentPage: 'landing',
    players: [],
    sticheAufgehen: true,
    currentDealer: 0,
    currentRound: 1,

    // Page Navigation
    showLanding() {
        this.showPage('landing-page');
    },

    showPlayerSetup() {
        this.showPage('player-setup-page');
    },

    showGame() {
        this.showPage('game-page');
        this.updateGameDisplay();
    },

    showPage(pageId) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    },

    // Player Setup
    addPlayerInput() {
        const playerInputs = document.getElementById('player-inputs');
        const playerCount = playerInputs.children.length + 1;
        
        const div = document.createElement('div');
        div.className = 'player-input-group';
        div.innerHTML = `
            <input type="text" placeholder="Spieler ${playerCount}" class="player-name-input">
            <button class="btn-remove" onclick="app.removePlayerInput(this)">×</button>
        `;
        
        playerInputs.appendChild(div);
    },

    removePlayerInput(button) {
        const playerInputs = document.getElementById('player-inputs');
        if (playerInputs.children.length > 2) {
            button.parentElement.remove();
            // Update placeholder numbers
            this.updatePlayerPlaceholders();
        }
    },

    updatePlayerPlaceholders() {
        const inputs = document.querySelectorAll('.player-name-input');
        inputs.forEach((input, index) => {
            if (!input.value) {
                input.placeholder = `Spieler ${index + 1}`;
            }
        });
    },

    // Start Game
    startGame() {
        const inputs = document.querySelectorAll('.player-name-input');
        const playerNames = [];
        
        inputs.forEach((input, index) => {
            const name = input.value.trim() || `Spieler ${index + 1}`;
            playerNames.push(name);
        });

        if (playerNames.length < 2) {
            alert('Bitte fügen Sie mindestens 2 Spieler hinzu.');
            return;
        }

        this.sticheAufgehen = document.getElementById('stiche-aufgehen').checked;
        this.players = playerNames.map(name => ({
            name: name,
            predicted: 0,
            actual: 0
        }));
        
        this.currentDealer = 0;
        this.currentRound = 1;
        
        this.showGame();
    },

    // Game Display
    updateGameDisplay() {
        // Update dealer info
        const dealerInfo = document.getElementById('dealer-info');
        dealerInfo.textContent = `es verteilt ${this.players[this.currentDealer].name}`;

        // Update players list
        const playersList = document.getElementById('players-list');
        playersList.innerHTML = '';

        this.players.forEach((player, index) => {
            const row = document.createElement('div');
            row.className = 'player-row';
            row.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-stats">
                    <div class="stat-group">
                        <label class="stat-label">Soll</label>
                        <input type="number" 
                               class="stat-input" 
                               min="0" 
                               value="${player.predicted}"
                               onchange="app.updatePlayerPredicted(${index}, this.value)">
                    </div>
                    <div class="stat-group">
                        <label class="stat-label">Ist</label>
                        <input type="number" 
                               class="stat-input" 
                               min="0" 
                               value="${player.actual}"
                               onchange="app.updatePlayerActual(${index}, this.value)">
                    </div>
                </div>
            `;
            playersList.appendChild(row);
        });
    },

    updatePlayerPredicted(index, value) {
        this.players[index].predicted = parseInt(value) || 0;
    },

    updatePlayerActual(index, value) {
        this.players[index].actual = parseInt(value) || 0;
    },

    nextRound() {
        // Move to next dealer
        this.currentDealer = (this.currentDealer + 1) % this.players.length;
        this.currentRound++;
        
        // Reset current round values
        this.players.forEach(player => {
            player.predicted = 0;
            player.actual = 0;
        });
        
        this.updateGameDisplay();
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    app.showLanding();
});
