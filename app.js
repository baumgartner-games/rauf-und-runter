// Application State
const app = {
    currentPage: 'landing',
    players: [],
    sticheAufgehen: true,
    currentDealer: 0,
    currentRound: 1,
    roundIndex: 0,
    roundSequence: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        9, 8, 7, 6, 5, 4, 3, 2, 1
    ],

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
        this.roundIndex = 0;
        this.currentRound = this.roundSequence[this.roundIndex];
        
        this.showGame();
    },

    // Game Display
    updateGameDisplay() {
        // Safety check
        if (!this.players || this.players.length === 0) {
            console.error('No players available');
            return;
        }

        // Update dealer info
        const dealerInfo = document.getElementById('dealer-info');
        dealerInfo.textContent = `Runde ${this.currentRound} – es verteilt ${this.players[this.currentDealer].name}`;

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
                        <div class="stat-controls">
                            <button class="btn-step" type="button" onclick="app.adjustPlayerScore(${index}, 'predicted', -1)">−</button>
                            <input type="tel"
                                   class="stat-input"
                                   inputmode="numeric"
                                   pattern="[0-9]*"
                                   value="${player.predicted}"
                                   onchange="app.updatePlayerPredicted(${index}, this.value)">
                            <button class="btn-step" type="button" onclick="app.adjustPlayerScore(${index}, 'predicted', 1)">+</button>
                        </div>
                    </div>
                    <div class="stat-group">
                        <label class="stat-label">Ist</label>
                        <div class="stat-controls">
                            <button class="btn-step" type="button" onclick="app.adjustPlayerScore(${index}, 'actual', -1)">−</button>
                            <input type="tel"
                                   class="stat-input"
                                   inputmode="numeric"
                                   pattern="[0-9]*"
                                   value="${player.actual}"
                                   onchange="app.updatePlayerActual(${index}, this.value)">
                            <button class="btn-step" type="button" onclick="app.adjustPlayerScore(${index}, 'actual', 1)">+</button>
                        </div>
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

    adjustPlayerScore(index, field, delta) {
        const currentValue = this.players[index][field] || 0;
        const nextValue = Math.max(0, currentValue + delta);
        this.players[index][field] = nextValue;
        this.updateGameDisplay();
    },

    nextRound() {
        // Move to next dealer
        this.currentDealer = (this.currentDealer + 1) % this.players.length;
        this.roundIndex = (this.roundIndex + 1) % this.roundSequence.length;
        this.currentRound = this.roundSequence[this.roundIndex];
        
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
