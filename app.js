// Application State
const app = {
    currentPage: 'landing',
    players: [],
    sticheAufgehen: true,
    currentDealer: 0,
    currentRound: 1,
    roundIndex: 0,
    rounds: [],
    showOverview: false,
    showResults: false,
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
                will: null,
                hat: null,
                points: 0
            }))
        }));
        this.showOverview = false;
        this.showResults = false;
        
        this.showGame();
    },

    // Game Display
    updateGameDisplay() {
        // Safety check
        if (!this.players || this.players.length === 0) {
            console.error('No players available');
            return;
        }

        const announcerIndex = this.getAnnouncerIndex();
        const dealerIndex = this.getDealerIndex();
        const dealerName = this.players[dealerIndex].name;
        const announcerName = this.players[announcerIndex].name;

        const dealerInfo = document.getElementById('dealer-info');
        dealerInfo.innerHTML = `
            <div>Runde ${this.currentRound} · Es teilt aus: <strong>${dealerName}</strong></div>
            <div>Als erstes sagt an: <strong>${announcerName}</strong></div>
        `;

        this.updateTotals();

        const roundView = document.getElementById('round-view');
        const overviewView = document.getElementById('overview-view');
        const resultsView = document.getElementById('results-view');
        roundView.classList.toggle('active', !this.showOverview && !this.showResults);
        overviewView.classList.toggle('active', this.showOverview);
        resultsView.classList.toggle('active', this.showResults);

        if (this.showOverview) {
            this.renderOverviewTable();
        } else if (this.showResults) {
            this.renderResultsView();
        } else {
            this.renderRoundView();
        }

        const overviewToggle = document.getElementById('overview-toggle');
        if (overviewToggle) {
            overviewToggle.textContent = this.showOverview ? 'Zur Punkteingabe' : 'Übersicht';
        }
    },
    
    scrollRoundToTop() {
        const roundScroll = document.getElementById('round-scroll');
        if (roundScroll) {
            roundScroll.scrollTop = 0;
        }
    },

    renderRoundView() {
        const roundScroll = document.getElementById('round-scroll');
        roundScroll.innerHTML = '';

        const round = this.rounds[this.roundIndex];
        const order = this.getAnnouncementOrder();

        const willSection = document.createElement('div');
        willSection.className = 'round-panel';
        willSection.innerHTML = '<h3 class="section-title">Will</h3>';
        order.forEach(playerIndex => {
            const player = this.players[playerIndex];
            const playerRound = round.players[playerIndex];
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            playerCard.innerHTML = `
                <div class="player-card-header">${player.name}</div>
                <div class="value-buttons">
                    ${this.renderValueButtons(this.roundIndex, playerIndex, 'will', playerRound.will)}
                </div>
            `;
            willSection.appendChild(playerCard);
        });

        const hatSection = document.createElement('div');
        hatSection.className = 'round-panel';
        hatSection.innerHTML = '<h3 class="section-title">Hat</h3>';
        order.forEach(playerIndex => {
            const player = this.players[playerIndex];
            const playerRound = round.players[playerIndex];
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            playerCard.innerHTML = `
                <div class="player-card-header">${player.name}</div>
                <div class="value-buttons">
                    ${this.renderValueButtons(this.roundIndex, playerIndex, 'hat', playerRound.hat)}
                </div>
            `;
            hatSection.appendChild(playerCard);
        });

        const summarySection = document.createElement('div');
        summarySection.className = 'round-panel round-summary';
        summarySection.innerHTML = '<h3 class="section-title">Kurze Übersicht</h3>';
        order.forEach(playerIndex => {
            const player = this.players[playerIndex];
            const playerRound = round.players[playerIndex];
            const row = document.createElement('div');
            row.className = 'summary-row';
            row.textContent = `${player.name} · Will ${this.formatValue(playerRound.will)} · Hat ${this.formatValue(playerRound.hat)} —> +${playerRound.points}`;
            summarySection.appendChild(row);
        });

        roundScroll.appendChild(willSection);
        roundScroll.appendChild(hatSection);
        roundScroll.appendChild(summarySection);

        const nextButton = document.getElementById('next-round-btn');
        if (nextButton) {
            nextButton.textContent = this.isLastRound() ? 'Ergebnis' : 'Nächste Runde';
        }
    },

    renderValueButtons(roundIndex, playerIndex, field, currentValue) {
        const maxValue = 10;
        const buttons = [];
        for (let value = 0; value <= maxValue; value += 1) {
            const isActive = value === currentValue;
            buttons.push(`
                <button class="value-button ${isActive ? 'active' : ''}"
                        type="button"
                        onclick="app.setPlayerValue(${roundIndex}, ${playerIndex}, '${field}', ${value})">
                    ${value}
                </button>
            `);
        }
        const isUndefinedActive = currentValue === null;
        buttons.push(`
            <button class="value-button ${isUndefinedActive ? 'active' : ''}"
                    type="button"
                    onclick="app.setPlayerValue(${roundIndex}, ${playerIndex}, '${field}', null)">
                ?
            </button>
        `);
        return buttons.join('');
    },

    renderOverviewTable() {
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

            round.players.forEach(playerRound => {
                const cell = document.createElement('div');
                cell.className = 'score-cell player-cell';
                cell.innerHTML = `
                    <div class="cell-split">
                        <div class="cell-part">
                            <span class="cell-label">Will</span>
                            <span class="cell-value">${this.formatValue(playerRound.will)}</span>
                        </div>
                        <div class="cell-part">
                            <span class="cell-label">Hat</span>
                            <span class="cell-value">${this.formatValue(playerRound.hat)}</span>
                        </div>
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
    },

    renderResultsView() {
        const resultsList = document.getElementById('results-list');
        if (!resultsList) {
            return;
        }
        resultsList.innerHTML = '';

        const ranking = this.players
            .map((player, index) => ({
                index,
                name: player.name,
                total: player.total
            }))
            .sort((a, b) => b.total - a.total);

        ranking.forEach((player, index) => {
            const row = document.createElement('div');
            row.className = 'results-row';
            row.innerHTML = `
                <span class="results-rank">#${index + 1}</span>
                <span class="results-name">${player.name}</span>
                <span class="results-points">${player.total} Punkte</span>
            `;
            resultsList.appendChild(row);
        });
    },

    updateCellPoints(roundIndex, playerIndex) {
        const roundPlayer = this.rounds[roundIndex].players[playerIndex];
        if (roundPlayer.hat === null || roundPlayer.will === null) {
            roundPlayer.points = 0;
            return;
        }
        roundPlayer.points = roundPlayer.hat + (roundPlayer.hat === roundPlayer.will ? 10 : 0);
    },

    updateTotals() {
        this.players.forEach((player, playerIndex) => {
            const total = this.rounds.reduce((sum, round) => sum + round.players[playerIndex].points, 0);
            player.total = total;
        });
    },

    setPlayerValue(roundIndex, playerIndex, field, value) {
        const roundPlayer = this.rounds[roundIndex].players[playerIndex];
        roundPlayer[field] = value;
        this.updateCellPoints(roundIndex, playerIndex);
        this.updateTotals();
        this.updateGameDisplay();
    },

    formatValue(value) {
        return value === null ? '?' : value;
    },

    toggleOverview() {
        this.showResults = false;
        this.showOverview = !this.showOverview;
        this.updateGameDisplay();
    },

    showOverviewScreen() {
        this.showResults = false;
        this.showOverview = true;
        this.updateGameDisplay();
    },

    getAnnouncerIndex() {
        return this.roundIndex % this.players.length;
    },

    getDealerIndex() {
        const announcerIndex = this.getAnnouncerIndex();
        return (announcerIndex - 1 + this.players.length) % this.players.length;
    },

    getAnnouncementOrder() {
        const order = [];
        const announcerIndex = this.getAnnouncerIndex();
        for (let offset = 0; offset < this.players.length; offset += 1) {
            order.push((announcerIndex + offset) % this.players.length);
        }
        return order;
    },

    nextRound() {
        if (this.showResults) {
            return;
        }

        if (this.roundIndex < this.roundSequence.length - 1) {
            this.roundIndex += 1;
            this.currentRound = this.roundSequence[this.roundIndex];
            this.updateGameDisplay();
            this.scrollRoundToTop();
            return;
        }

        this.showResults = true;
        this.showOverview = false;
        this.updateGameDisplay();
    },

    previousRound() {
        if (this.showResults) {
            this.showResults = false;
        }
        if (this.roundIndex > 0) {
            this.roundIndex -= 1;
        }
        this.currentRound = this.roundSequence[this.roundIndex];
        this.updateGameDisplay();
        this.scrollRoundToTop();
    },

    isLastRound() {
        return this.roundIndex === this.roundSequence.length - 1;
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    app.showLanding();
});
