// Application State
const app = {
    currentPage: 'landing',
    players: [],
    sticheAufgehen: true,
    currentDealer: 0,
    currentRound: 1,
    roundIndex: 0,
    rounds: [],
    selectedCell: null,
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
            total: 0
        }));
        
        this.currentDealer = 0;
        this.roundIndex = 0;
        this.currentRound = this.roundSequence[this.roundIndex];
        this.rounds = this.roundSequence.map(number => ({
            number,
            players: this.players.map(() => ({
                will: 0,
                hat: 0,
                points: 0
            }))
        }));
        this.selectedCell = {
            roundIndex: this.roundIndex,
            playerIndex: 0,
            field: 'will'
        };
        
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

        this.updateTotals();

        // Update players list
        const playersList = document.getElementById('players-list');
        playersList.innerHTML = '';

        const table = document.createElement('div');
        table.className = 'score-table';
        table.style.setProperty('--player-count', this.players.length);

        const headerRow = document.createElement('div');
        headerRow.className = 'score-row score-header';
        headerRow.innerHTML = `<div class="score-cell round-header">Runde</div>`;
        this.players.forEach(player => {
            const headerCell = document.createElement('div');
            headerCell.className = 'score-cell player-header';
            headerCell.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-total">Gesamt ${player.total}</div>
            `;
            headerRow.appendChild(headerCell);
        });
        table.appendChild(headerRow);

        this.rounds.forEach((round, roundIndex) => {
            const row = document.createElement('div');
            row.className = 'score-row';
            if (roundIndex === this.roundIndex) {
                row.classList.add('current-round');
            }

            const roundCell = document.createElement('div');
            roundCell.className = 'score-cell round-cell';
            roundCell.textContent = `R${round.number}`;
            row.appendChild(roundCell);

            round.players.forEach((playerRound, playerIndex) => {
                const cell = document.createElement('div');
                cell.className = 'score-cell player-cell';
                const isWillSelected = this.isSelected(roundIndex, playerIndex, 'will');
                const isHatSelected = this.isSelected(roundIndex, playerIndex, 'hat');
                cell.innerHTML = `
                    <div class="cell-split">
                        <button class="cell-part cell-button ${isWillSelected ? 'selected' : ''}"
                                type="button"
                                onclick="app.selectCell(${roundIndex}, ${playerIndex}, 'will')">
                            <span class="cell-label">Will</span>
                            <span class="cell-value">${playerRound.will}</span>
                        </button>
                        <button class="cell-part cell-button ${isHatSelected ? 'selected' : ''}"
                                type="button"
                                onclick="app.selectCell(${roundIndex}, ${playerIndex}, 'hat')">
                            <span class="cell-label">Hat</span>
                            <span class="cell-value">${playerRound.hat}</span>
                        </button>
                        <div class="cell-part cell-points">
                            <span class="cell-label">Punkte</span>
                            <span class="cell-value">${playerRound.points}</span>
                        </div>
                    </div>
                `;
                row.appendChild(cell);
            });

            table.appendChild(row);
        });

        playersList.appendChild(table);
        this.updateSelectionBar();
    },

    isSelected(roundIndex, playerIndex, field) {
        return this.selectedCell
            && this.selectedCell.roundIndex === roundIndex
            && this.selectedCell.playerIndex === playerIndex
            && this.selectedCell.field === field;
    },

    selectCell(roundIndex, playerIndex, field) {
        this.selectedCell = { roundIndex, playerIndex, field };
        this.updateGameDisplay();
    },

    adjustSelected(delta) {
        if (!this.selectedCell) {
            return;
        }
        const { roundIndex, playerIndex, field } = this.selectedCell;
        const roundPlayer = this.rounds[roundIndex].players[playerIndex];
        const nextValue = Math.max(0, roundPlayer[field] + delta);
        roundPlayer[field] = nextValue;
        this.updateCellPoints(roundIndex, playerIndex);
        this.updateTotals();
        this.updateGameDisplay();
    },

    updateCellPoints(roundIndex, playerIndex) {
        const roundPlayer = this.rounds[roundIndex].players[playerIndex];
        roundPlayer.points = roundPlayer.hat + (roundPlayer.hat === roundPlayer.will ? 10 : 0);
    },

    updateTotals() {
        this.players.forEach((player, playerIndex) => {
            const total = this.rounds.reduce((sum, round) => sum + round.players[playerIndex].points, 0);
            player.total = total;
        });
    },

    updateSelectionBar() {
        const info = document.getElementById('selection-info');
        const minusButton = document.getElementById('selection-minus');
        const plusButton = document.getElementById('selection-plus');

        if (!this.selectedCell) {
            info.textContent = 'Tippe auf Will oder Hat, um Punkte zu ändern.';
            minusButton.disabled = true;
            plusButton.disabled = true;
            return;
        }

        const { roundIndex, playerIndex, field } = this.selectedCell;
        const playerName = this.players[playerIndex].name;
        const roundNumber = this.rounds[roundIndex].number;
        const fieldLabel = field === 'will' ? 'Will' : 'Hat';
        info.textContent = `Auswahl: Runde ${roundNumber} · ${playerName} · ${fieldLabel}`;
        minusButton.disabled = false;
        plusButton.disabled = false;
    },

    nextRound() {
        // Move to next dealer
        this.currentDealer = (this.currentDealer + 1) % this.players.length;
        this.roundIndex = (this.roundIndex + 1) % this.roundSequence.length;
        this.currentRound = this.roundSequence[this.roundIndex];

        this.selectedCell = {
            roundIndex: this.roundIndex,
            playerIndex: 0,
            field: 'will'
        };

        this.updateGameDisplay();
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    app.showLanding();
});
