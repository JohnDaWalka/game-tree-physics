// Texas Hold'em Poker with GTO Monte Carlo Tree Search
// Dedicated to Marine Jake Pettit
// Implements GTO strategy using MCTS with Fischer-Yates shuffling

class PokerGame {
    constructor() {
        // Game state
        this.playerChips = 1000;
        this.cpuChips = 1000;
        this.pot = 0;
        this.playerBet = 0;
        this.cpuBet = 0;
        this.gameActive = false;
        
        // Cards
        this.deck = [];
        this.playerHand = [];
        this.cpuHand = [];
        this.communityCards = [];
        
        // Game phase
        this.phase = 'preflop'; // preflop, flop, turn, river, showdown
        
        // MCTS parameters for GTO play
        this.mctsIterations = 1000;
        this.explorationConstant = Math.sqrt(2);
        
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('foldBtn').addEventListener('click', () => this.playerFold());
        document.getElementById('checkBtn').addEventListener('click', () => this.playerCheck());
        document.getElementById('raiseBtn').addEventListener('click', () => this.showRaisePanel());
        document.getElementById('confirmRaiseBtn').addEventListener('click', () => this.playerRaise());
        document.getElementById('cancelRaiseBtn').addEventListener('click', () => this.hideRaisePanel());
    }
    
    // Vanilla Fischer-Yates shuffle for uniform card distribution
    fischerCoefficientShuffle(array) {
        const shuffled = [...array];
        const n = shuffled.length;
        
        // Standard Fischer-Yates algorithm for uniform distribution
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    }
    
    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck = [];
        
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({
                    rank,
                    suit,
                    value: ranks.indexOf(rank) + 2,
                    display: rank + suit
                });
            }
        }
        
        // Apply Fischer coefficient shuffle for fair distribution
        return this.fischerCoefficientShuffle(deck);
    }
    
    newGame() {
        if (this.playerChips <= 0) {
            this.showMessage('Game Over! You ran out of chips. Refresh to restart.', 'error');
            return;
        }
        if (this.cpuChips <= 0) {
            this.showMessage('Victory! You won all the chips!', 'success');
            return;
        }
        
        this.deck = this.createDeck();
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.cpuHand = [this.deck.pop(), this.deck.pop()];
        this.communityCards = [];
        this.pot = 0;
        this.playerBet = 0;
        this.cpuBet = 0;
        this.phase = 'preflop';
        this.gameActive = true;
        
        // Blinds structure
        const smallBlind = 5;
        const bigBlind = 10;
        this.playerChips -= smallBlind;
        this.cpuChips -= bigBlind;
        this.playerBet = smallBlind;
        this.cpuBet = bigBlind;
        this.pot = smallBlind + bigBlind;
        
        document.getElementById('cpuAction').textContent = '';
        this.updateDisplay();
        this.enableButtons();
        this.showMessage('New hand dealt! Your turn to act.');
    }
    
    // Monte Carlo Tree Search for GTO decision making
    mctsDecision() {
        const root = {
            state: this.getGameState(),
            visits: 0,
            value: 0,
            children: [],
            action: null,
            parent: null
        };
        
        // Run MCTS iterations to build game tree
        for (let i = 0; i < this.mctsIterations; i++) {
            let node = this.selectNode(root);
            
            if (node.visits > 0 && node.children.length === 0) {
                this.expandNode(node);
                if (node.children.length > 0) {
                    node = node.children[Math.floor(Math.random() * node.children.length)];
                }
            }
            
            const reward = this.simulate(node.state);
            this.backpropagate(node, reward);
        }
        
        // Select best action based on highest visit count (GTO approach)
        if (root.children.length === 0) return 'check';
        
        const bestChild = root.children.reduce((best, child) => 
            (child.visits > best.visits) ? child : best
        );
        
        return bestChild ? bestChild.action : 'check';
    }
    
    selectNode(node) {
        // If node has no children or hasn't been visited, return it
        if (node.children.length === 0 || node.visits === 0) {
            return node;
        }
        
        // UCB1 formula for node selection
        let bestChild = null;
        let bestValue = -Infinity;
        
        for (const child of node.children) {
            if (child.visits === 0) {
                return child; // Prioritize unvisited nodes
            }
            
            const exploitation = child.value / child.visits;
            const exploration = this.explorationConstant * 
                Math.sqrt(Math.log(node.visits) / child.visits);
            const ucb1Value = exploitation + exploration;
            
            if (ucb1Value > bestValue) {
                bestValue = ucb1Value;
                bestChild = child;
            }
        }
        
        return bestChild ? this.selectNode(bestChild) : node;
    }
    
    expandNode(node) {
        const callAmount = node.state.playerBet - node.state.cpuBet;
        const actions = [];
        
        // Determine available actions
        if (callAmount > 0) {
            actions.push('fold', 'call', 'raise');
        } else {
            actions.push('check', 'raise');
        }
        
        for (const action of actions) {
            const childState = { 
                ...node.state, 
                playerHand: node.state.playerHand ? [...node.state.playerHand] : [],
                cpuHand: node.state.cpuHand ? [...node.state.cpuHand] : [],
                communityCards: node.state.communityCards ? [...node.state.communityCards] : [],
                lastAction: action 
            };
            node.children.push({
                state: childState,
                visits: 0,
                value: 0,
                children: [],
                action: action,
                parent: node
            });
        }
    }
    
    simulate(state) {
        // Monte Carlo simulation - random playout to terminal state
        const simDeck = this.fischerCoefficientShuffle([...this.deck]);
        const simCommunity = [...state.communityCards];
        
        // Deal remaining community cards
        while (simCommunity.length < 5 && simDeck.length > 0) {
            simCommunity.push(simDeck.pop());
        }
        
        // Evaluate hands
        const playerRank = this.evaluateHand(state.playerHand, simCommunity);
        const cpuRank = this.evaluateHand(state.cpuHand, simCommunity);
        
        // Return reward (1 for CPU win, 0 for loss)
        if (cpuRank.score > playerRank.score) {
            return 1;
        } else if (cpuRank.score < playerRank.score) {
            return 0;
        } else {
            // Tie - compare high cards
            return cpuRank.highCard > playerRank.highCard ? 1 : cpuRank.highCard < playerRank.highCard ? 0 : 0.5;
        }
    }
    
    backpropagate(node, reward) {
        let current = node;
        while (current) {
            current.visits++;
            current.value += reward;
            current = current.parent;
        }
    }
    
    getGameState() {
        return {
            playerHand: [...this.playerHand],
            cpuHand: [...this.cpuHand],
            communityCards: [...this.communityCards],
            pot: this.pot,
            phase: this.phase,
            playerBet: this.playerBet,
            cpuBet: this.cpuBet
        };
    }
    
    cpuAction() {
        if (!this.gameActive) return;
        
        setTimeout(() => {
            const action = this.mctsDecision();
            const callAmount = this.playerBet - this.cpuBet;
            
            // GTO decision tree execution
            if (action === 'fold') {
                this.cpuFold();
            } else if (action === 'raise') {
                this.cpuRaise();
            } else {
                this.cpuCheck();
            }
        }, 1200);
    }
    
    cpuFold() {
        document.getElementById('cpuAction').textContent = 'Opponent folds';
        this.playerChips += this.pot;
        this.showMessage('Opponent folds! You win the pot!', 'success');
        this.endHand();
    }
    
    cpuCheck() {
        const callAmount = this.playerBet - this.cpuBet;
        
        if (callAmount > 0) {
            if (this.cpuChips >= callAmount) {
                this.cpuChips -= callAmount;
                this.pot += callAmount;
                this.cpuBet += callAmount;
                document.getElementById('cpuAction').textContent = `Opponent calls $${callAmount}`;
            } else {
                // All-in
                this.pot += this.cpuChips;
                this.cpuBet += this.cpuChips;
                document.getElementById('cpuAction').textContent = `Opponent all-in $${this.cpuChips}`;
                this.cpuChips = 0;
            }
        } else {
            document.getElementById('cpuAction').textContent = 'Opponent checks';
        }
        
        this.updateDisplay();
        this.advancePhase();
    }
    
    cpuRaise() {
        const callAmount = this.playerBet - this.cpuBet;
        
        // GTO-based raise sizing (pot-sized or half-pot)
        const potOddsRaise = Math.floor(this.pot * 0.5);
        const raiseAmount = Math.max(20, Math.min(potOddsRaise, 100));
        const totalAmount = callAmount + raiseAmount;
        
        if (this.cpuChips >= totalAmount) {
            this.cpuChips -= totalAmount;
            this.pot += totalAmount;
            this.cpuBet += totalAmount;
            document.getElementById('cpuAction').textContent = `Opponent raises $${raiseAmount}`;
            this.updateDisplay();
            this.enableButtons();
            this.showMessage(`Opponent raises $${raiseAmount}. Your turn to act.`);
        } else {
            this.cpuCheck();
        }
    }
    
    playerFold() {
        this.cpuChips += this.pot;
        this.showMessage('You fold. Opponent wins the pot.', 'error');
        this.endHand();
    }
    
    playerCheck() {
        const callAmount = this.cpuBet - this.playerBet;
        
        if (callAmount > 0) {
            if (this.playerChips >= callAmount) {
                this.playerChips -= callAmount;
                this.pot += callAmount;
                this.playerBet += callAmount;
                this.showMessage(`You call $${callAmount}`);
            } else {
                this.showMessage('Not enough chips to call!', 'error');
                return;
            }
        } else {
            this.showMessage('You check');
        }
        
        this.updateDisplay();
        this.disableButtons();
        this.cpuAction();
    }
    
    showRaisePanel() {
        document.getElementById('raisePanel').style.display = 'block';
        const callAmount = this.cpuBet - this.playerBet;
        const maxRaise = Math.min(this.playerChips - callAmount, 500);
        document.getElementById('raiseAmount').max = maxRaise;
        document.getElementById('raiseAmount').value = Math.min(50, maxRaise);
    }
    
    hideRaisePanel() {
        document.getElementById('raisePanel').style.display = 'none';
    }
    
    playerRaise() {
        const raiseAmount = parseInt(document.getElementById('raiseAmount').value);
        const callAmount = this.cpuBet - this.playerBet;
        const totalAmount = callAmount + raiseAmount;
        
        if (this.playerChips >= totalAmount && raiseAmount > 0) {
            this.playerChips -= totalAmount;
            this.pot += totalAmount;
            this.playerBet += totalAmount;
            this.hideRaisePanel();
            this.showMessage(`You raise $${raiseAmount}`);
            this.updateDisplay();
            this.disableButtons();
            this.cpuAction();
        } else {
            this.showMessage('Invalid raise amount!', 'error');
        }
    }
    
    advancePhase() {
        this.playerBet = 0;
        this.cpuBet = 0;
        
        if (this.phase === 'preflop') {
            // Deal flop (3 cards)
            this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
            this.phase = 'flop';
            this.showMessage('Flop dealt!');
        } else if (this.phase === 'flop') {
            // Deal turn (1 card)
            this.communityCards.push(this.deck.pop());
            this.phase = 'turn';
            this.showMessage('Turn card dealt!');
        } else if (this.phase === 'turn') {
            // Deal river (1 card)
            this.communityCards.push(this.deck.pop());
            this.phase = 'river';
            this.showMessage('River card dealt!');
        } else if (this.phase === 'river') {
            this.showdown();
            return;
        }
        
        this.updateDisplay();
        this.enableButtons();
    }
    
    showdown() {
        this.phase = 'showdown';
        const playerRank = this.evaluateHand(this.playerHand, this.communityCards);
        const cpuRank = this.evaluateHand(this.cpuHand, this.communityCards);
        
        this.updateDisplay(true); // Show CPU cards
        
        if (playerRank.score > cpuRank.score) {
            this.playerChips += this.pot;
            this.showMessage(`You win with ${playerRank.name}!`, 'success');
        } else if (cpuRank.score > playerRank.score) {
            this.cpuChips += this.pot;
            this.showMessage(`Opponent wins with ${cpuRank.name}!`, 'error');
        } else {
            // Compare high cards on tie
            if (playerRank.highCard > cpuRank.highCard) {
                this.playerChips += this.pot;
                this.showMessage(`You win with ${playerRank.name} (higher kicker)!`, 'success');
            } else if (cpuRank.highCard > playerRank.highCard) {
                this.cpuChips += this.pot;
                this.showMessage(`Opponent wins with ${cpuRank.name} (higher kicker)!`, 'error');
            } else {
                // Split pot
                const split = Math.floor(this.pot / 2);
                this.playerChips += split;
                this.cpuChips += this.pot - split;
                this.showMessage(`Tie with ${playerRank.name}! Pot split.`);
            }
        }
        
        this.endHand();
    }
    
    endHand() {
        this.gameActive = false;
        this.disableButtons();
        this.pot = 0;
        this.updateDisplay(true);
    }
    
    evaluateHand(hand, community) {
        const allCards = [...hand, ...community];
        const ranks = allCards.map(c => c.value).sort((a, b) => b - a);
        const suits = allCards.map(c => c.suit);
        
        // Count ranks
        const rankCounts = {};
        ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
        const counts = Object.values(rankCounts).sort((a, b) => b - a);
        const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
        
        // Check flush
        const suitCounts = {};
        suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
        const isFlush = Object.values(suitCounts).some(count => count >= 5);
        
        // Check straight
        const isStraight = this.checkStraight(uniqueRanks);
        
        const highCard = Math.max(...ranks);
        
        // Hand ranking (higher score = better hand)
        if (isFlush && isStraight) {
            return { score: 8, name: 'Straight Flush', highCard };
        } else if (counts[0] === 4) {
            return { score: 7, name: 'Four of a Kind', highCard };
        } else if (counts[0] === 3 && counts[1] >= 2) {
            return { score: 6, name: 'Full House', highCard };
        } else if (isFlush) {
            return { score: 5, name: 'Flush', highCard };
        } else if (isStraight) {
            return { score: 4, name: 'Straight', highCard };
        } else if (counts[0] === 3) {
            return { score: 3, name: 'Three of a Kind', highCard };
        } else if (counts[0] === 2 && counts[1] === 2) {
            return { score: 2, name: 'Two Pair', highCard };
        } else if (counts[0] === 2) {
            return { score: 1, name: 'One Pair', highCard };
        } else {
            return { score: 0, name: 'High Card', highCard };
        }
    }
    
    checkStraight(ranks) {
        if (ranks.length < 5) return false;
        
        // Check for consecutive sequence
        for (let i = 0; i <= ranks.length - 5; i++) {
            if (ranks[i] - ranks[i + 4] === 4) {
                return true;
            }
        }
        
        // Check for wheel (A-2-3-4-5)
        if (ranks.includes(14) && ranks.includes(2) && ranks.includes(3) && 
            ranks.includes(4) && ranks.includes(5)) {
            return true;
        }
        
        return false;
    }
    
    updateDisplay(showCpuCards = false) {
        document.getElementById('playerChips').textContent = this.playerChips;
        document.getElementById('cpuChips').textContent = this.cpuChips;
        document.getElementById('pot').textContent = this.pot;
        
        // Display player cards
        this.displayCards('playerCardsContainer', this.playerHand, false);
        
        // Display CPU cards (face down unless showdown)
        this.displayCards('cpuCardsContainer', this.cpuHand, !showCpuCards);
        
        // Display community cards
        this.displayCards('communityCardsContainer', this.communityCards, false);
        
        // Show player hand rank if community cards are visible
        if (this.communityCards.length >= 3) {
            const rank = this.evaluateHand(this.playerHand, this.communityCards);
            document.getElementById('playerHandRank').textContent = `Your hand: ${rank.name}`;
        } else {
            document.getElementById('playerHandRank').textContent = '';
        }
    }
    
    displayCards(containerId, cards, faceDown) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if (cards.length === 0 && containerId === 'communityCardsContainer') {
            container.innerHTML = '<div style="color: #ffd700; font-style: italic;">Waiting for flop...</div>';
            return;
        }
        
        cards.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            
            if (faceDown) {
                cardDiv.classList.add('back');
                cardDiv.innerHTML = '<div style="font-size: 2em;">🂠</div>';
            } else {
                const isRed = card.suit === '♥' || card.suit === '♦';
                cardDiv.classList.add(isRed ? 'red' : 'black');
                cardDiv.innerHTML = `
                    <div class="card-rank">${card.rank}</div>
                    <div class="card-suit">${card.suit}</div>
                `;
            }
            
            container.appendChild(cardDiv);
        });
    }
    
    enableButtons() {
        document.getElementById('foldBtn').disabled = false;
        document.getElementById('checkBtn').disabled = false;
        document.getElementById('raiseBtn').disabled = false;
        
        const callAmount = this.cpuBet - this.playerBet;
        if (callAmount > 0) {
            document.getElementById('checkBtn').textContent = `Call $${callAmount}`;
        } else {
            document.getElementById('checkBtn').textContent = 'Check';
        }
    }
    
    disableButtons() {
        document.getElementById('foldBtn').disabled = true;
        document.getElementById('checkBtn').disabled = true;
        document.getElementById('raiseBtn').disabled = true;
    }
    
    showMessage(message, type = '') {
        const messageBox = document.getElementById('messageBox');
        messageBox.textContent = message;
        messageBox.className = 'message-box';
        if (type) {
            messageBox.classList.add(type);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PokerGame();
});
