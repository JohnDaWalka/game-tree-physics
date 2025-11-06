// Poker UI Controller
let game = null;

// DOM Elements
const communityCardsDisplay = document.getElementById('community-cards-display');
const yourCardsDisplay = document.getElementById('your-cards');
const potAmount = document.getElementById('pot-amount');
const yourChips = document.getElementById('your-chips');
const gameStatus = document.getElementById('game-status');
const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');
const recommendedAction = document.getElementById('recommended-action');
const coachingTips = document.getElementById('coaching-tips');
const decisionTree = document.getElementById('decision-tree');

// Buttons
const newGameBtn = document.getElementById('new-game-btn');
const nextHandBtn = document.getElementById('next-hand-btn');
const foldBtn = document.getElementById('fold-btn');
const checkBtn = document.getElementById('check-btn');
const callBtn = document.getElementById('call-btn');
const raiseBtn = document.getElementById('raise-btn');
const raiseConfirmBtn = document.getElementById('raise-confirm-btn');
const raiseControls = document.getElementById('raise-controls');
const raiseAmount = document.getElementById('raise-amount');
const callAmount = document.getElementById('call-amount');

// Initialize
function init() {
    newGameBtn.addEventListener('click', startNewGame);
    nextHandBtn.addEventListener('click', startNextHand);
    foldBtn.addEventListener('click', () => handlePlayerAction('fold'));
    checkBtn.addEventListener('click', () => handlePlayerAction('check'));
    callBtn.addEventListener('click', () => handlePlayerAction('call'));
    raiseBtn.addEventListener('click', toggleRaiseControls);
    raiseConfirmBtn.addEventListener('click', handleRaise);
    
    updateGameStatus('Click "New Game" to start playing!');
    disableActionButtons();
}

function startNewGame() {
    game = new PokerGame();
    game.startNewHand();
    renderGame();
    updateCoaching();
    updateGameStatus('New hand started! Make your move.');
    enableActionButtons();
    nextHandBtn.style.display = 'none';
}

function startNextHand() {
    if (!game) return;
    
    // Check if any player is out of chips
    const activePlayers = game.players.filter(p => p.chips > 0);
    if (activePlayers.length < 2) {
        updateGameStatus('Game Over! Not enough players with chips.');
        disableActionButtons();
        nextHandBtn.style.display = 'none';
        return;
    }
    
    game.startNewHand();
    renderGame();
    updateCoaching();
    updateGameStatus('New hand started! Make your move.');
    enableActionButtons();
    nextHandBtn.style.display = 'none';
}

function renderGame() {
    if (!game) return;
    
    // Render community cards
    renderCommunityCards();
    
    // Render player's hand
    renderPlayerHand();
    
    // Update pot
    potAmount.textContent = game.pot;
    
    // Update player chips
    yourChips.textContent = game.players[0].chips;
    
    // Update opponents
    updateOpponents();
    
    // Update call button
    const player = game.players[0];
    const callCost = game.currentBet - player.bet;
    callAmount.textContent = callCost;
    
    // Enable/disable check button
    checkBtn.disabled = game.currentBet > player.bet;
    callBtn.disabled = callCost === 0;
}

function renderCommunityCards() {
    const cards = game.communityCards;
    const cardElements = communityCardsDisplay.children;
    
    for (let i = 0; i < 5; i++) {
        if (i < cards.length) {
            cardElements[i].className = 'card revealed ' + getCardColor(cards[i].suit);
            cardElements[i].innerHTML = `<div>${cards[i].rank}</div><div>${cards[i].suit}</div>`;
        } else {
            cardElements[i].className = 'card card-back';
            cardElements[i].innerHTML = '';
        }
    }
}

function renderPlayerHand() {
    const hand = game.players[0].hand;
    const cardElements = yourCardsDisplay.children;
    
    for (let i = 0; i < 2; i++) {
        if (i < hand.length) {
            cardElements[i].className = 'card revealed ' + getCardColor(hand[i].suit);
            cardElements[i].innerHTML = `<div>${hand[i].rank}</div><div>${hand[i].suit}</div>`;
        } else {
            cardElements[i].className = 'card card-back';
            cardElements[i].innerHTML = '';
        }
    }
}

function getCardColor(suit) {
    return (suit === '♥' || suit === '♦') ? 'red' : 'black';
}

function updateOpponents() {
    game.players.forEach((player, index) => {
        if (index === 0) return; // Skip human player
        
        const opponentDiv = document.getElementById(`opponent${index}`);
        const chipsSpan = opponentDiv.querySelector('.chips');
        const actionP = opponentDiv.querySelector('.player-action');
        
        chipsSpan.textContent = player.chips;
        
        if (player.folded) {
            actionP.textContent = 'Folded';
            opponentDiv.style.opacity = '0.5';
        } else {
            actionP.textContent = player.bet > 0 ? `Bet: $${player.bet}` : '';
            opponentDiv.style.opacity = '1';
        }
    });
}

function updateCoaching() {
    if (!game) return;
    
    // Update hand strength
    const strength = game.getHandStrength(0);
    strengthFill.style.width = strength + '%';
    
    let strengthLabel = 'Weak';
    if (strength > 70) strengthLabel = 'Very Strong';
    else if (strength > 50) strengthLabel = 'Strong';
    else if (strength > 30) strengthLabel = 'Medium';
    
    strengthText.textContent = `${strengthLabel} (${Math.round(strength)}%)`;
    
    // Update recommended action
    const recommendation = game.getRecommendedAction(0);
    recommendedAction.textContent = `${recommendation.action.toUpperCase()}: ${recommendation.reason}`;
    
    // Update coaching tips
    const tips = game.getCoachingTips(0);
    coachingTips.innerHTML = '';
    tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        coachingTips.appendChild(li);
    });
    
    // Update decision tree
    updateDecisionTree();
}

function updateDecisionTree() {
    if (!game) return;
    
    const history = game.getDecisionHistory();
    decisionTree.innerHTML = '';
    
    if (history.length === 0) {
        const info = document.createElement('p');
        info.className = 'tree-info';
        info.textContent = 'Your decision path will appear here';
        decisionTree.appendChild(info);
        return;
    }
    
    // Show last 8 decisions
    const recentHistory = history.slice(-8);
    recentHistory.forEach(entry => {
        const node = document.createElement('div');
        node.className = 'tree-node';
        
        // Determine node type
        if (entry.player === 'game') {
            node.classList.add('phase-change');
            node.innerHTML = `<span class="tree-node-icon">🎯</span>${entry.action}`;
        } else if (entry.player === 'You') {
            node.classList.add('player-action');
            node.innerHTML = `<span class="tree-node-icon">✓</span>You ${entry.action}${entry.amount > 0 ? ' $' + entry.amount : ''}`;
        } else {
            node.classList.add('opponent-action');
            node.innerHTML = `<span class="tree-node-icon">→</span>${entry.player} ${entry.action}`;
        }
        
        decisionTree.appendChild(node);
    });
    
    // Auto-scroll to bottom
    decisionTree.scrollTop = decisionTree.scrollHeight;
}

function handlePlayerAction(action) {
    if (!game || game.players[0].folded) return;
    
    game.playerAction(0, action);
    renderGame();
    
    // Create proper past tense
    const actionPastTense = {
        'check': 'checked',
        'call': 'called',
        'fold': 'folded',
        'raise': 'raised'
    };
    const actionText = actionPastTense[action] || action + 'ed';
    updateGameStatus(`You ${actionText}.`);
    
    // Process AI turns
    setTimeout(() => processAITurns(), 1000);
}

function handleRaise() {
    if (!game) return;
    
    const amount = parseInt(raiseAmount.value, 10);
    if (amount <= game.currentBet) {
        alert('Raise must be higher than current bet!');
        return;
    }
    
    if (amount > game.players[0].chips + game.players[0].bet) {
        alert('Not enough chips!');
        return;
    }
    
    game.playerAction(0, 'raise', amount);
    renderGame();
    updateCoaching();
    raiseControls.classList.remove('active');
    
    updateGameStatus(`You raised to $${amount}.`);
    
    // Process AI turns
    setTimeout(() => processAITurns(), 1000);
}

function toggleRaiseControls() {
    raiseControls.classList.toggle('active');
}

function processAITurns() {
    let aiActed = false;
    
    game.players.forEach((player, index) => {
        if (index === 0 || player.folded) return;
        
        const action = game.aiPlayerAction(index);
        if (action) {
            aiActed = true;
            const actionPastTense = {
                'check': 'checked',
                'call': 'called',
                'fold': 'folded',
                'raise': 'raised'
            };
            
            if (typeof action === 'object') {
                game.playerAction(index, action.action, action.amount);
                updateGameStatus(`${player.name} raised to $${action.amount}`);
            } else {
                game.playerAction(index, action);
                const pastTense = actionPastTense[action] || action + 'ed';
                updateGameStatus(`${player.name} ${pastTense}`);
            }
        }
    });
    
    renderGame();
    updateCoaching();
    
    // Check if betting round is complete
    setTimeout(() => {
        if (checkBettingRoundComplete()) {
            advancePhase();
        }
    }, 1000);
}

function checkBettingRoundComplete() {
    const activePlayers = game.players.filter(p => !p.folded);
    
    if (activePlayers.length === 1) {
        return true; // Only one player left
    }
    
    // Check if all active players have matched the current bet
    const allMatched = activePlayers.every(p => p.bet === game.currentBet);
    return allMatched;
}

function advancePhase() {
    if (game.phase === 'showdown') {
        endHand();
        return;
    }
    
    // Check if only one player remains
    const activePlayers = game.players.filter(p => !p.folded);
    if (activePlayers.length === 1) {
        endHand();
        return;
    }
    
    game.nextPhase();
    renderGame();
    updateCoaching();
    
    let phaseMsg = '';
    switch(game.phase) {
        case 'flop':
            phaseMsg = 'Flop revealed!';
            break;
        case 'turn':
            phaseMsg = 'Turn card revealed!';
            break;
        case 'river':
            phaseMsg = 'River card revealed!';
            break;
        case 'showdown':
            endHand();
            return;
    }
    
    updateGameStatus(phaseMsg);
}

function endHand() {
    const winner = game.determineWinner();
    const handEval = game.evaluateHand(winner.hand, game.communityCards);
    
    updateGameStatus(`${winner.name} wins $${game.pot} with ${handEval.name}!`);
    
    renderGame();
    disableActionButtons();
    nextHandBtn.style.display = 'block';
}

function updateGameStatus(message) {
    gameStatus.textContent = message;
}

function enableActionButtons() {
    foldBtn.disabled = false;
    checkBtn.disabled = false;
    callBtn.disabled = false;
    raiseBtn.disabled = false;
}

function disableActionButtons() {
    foldBtn.disabled = true;
    checkBtn.disabled = true;
    callBtn.disabled = true;
    raiseBtn.disabled = true;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
