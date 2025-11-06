// Poker Game Logic
class PokerGame {
    constructor() {
        this.deck = [];
        this.communityCards = [];
        this.players = [];
        this.currentPlayerIndex = 0;
        this.pot = 0;
        this.currentBet = 0;
        this.dealer = 0;
        this.phase = 'preflop'; // preflop, flop, turn, river, showdown
        this.initializePlayers();
    }

    initializePlayers() {
        this.players = [
            { name: 'You', chips: 1000, hand: [], bet: 0, folded: false, isHuman: true },
            { name: 'Opponent 1', chips: 1000, hand: [], bet: 0, folded: false, isHuman: false },
            { name: 'Opponent 2', chips: 1000, hand: [], bet: 0, folded: false, isHuman: false }
        ];
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];
        
        for (let suit of suits) {
            for (let rank of ranks) {
                this.deck.push({
                    rank: rank,
                    suit: suit,
                    value: this.getCardValue(rank)
                });
            }
        }
        this.shuffleDeck();
    }

    getCardValue(rank) {
        const values = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return values[rank];
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCards() {
        // Deal 2 cards to each player
        for (let i = 0; i < 2; i++) {
            for (let player of this.players) {
                player.hand.push(this.deck.pop());
            }
        }
    }

    dealCommunityCards(count) {
        for (let i = 0; i < count; i++) {
            this.communityCards.push(this.deck.pop());
        }
    }

    startNewHand() {
        this.createDeck();
        this.communityCards = [];
        this.pot = 0;
        this.currentBet = 0;
        this.phase = 'preflop';
        
        // Reset players
        this.players.forEach(player => {
            player.hand = [];
            player.bet = 0;
            player.folded = false;
        });

        this.dealCards();
        
        // Post blinds (small blind: 10, big blind: 20)
        this.players[1].chips -= 10;
        this.players[1].bet = 10;
        this.players[2].chips -= 20;
        this.players[2].bet = 20;
        this.pot = 30;
        this.currentBet = 20;
    }

    playerAction(playerIndex, action, amount = 0) {
        const player = this.players[playerIndex];
        
        if (player.folded) return;

        switch(action) {
            case 'fold':
                player.folded = true;
                break;
            case 'check':
                // Can only check if current bet equals player's bet
                break;
            case 'call':
                const callAmount = this.currentBet - player.bet;
                player.chips -= callAmount;
                player.bet = this.currentBet;
                this.pot += callAmount;
                break;
            case 'raise':
                const raiseAmount = amount - player.bet;
                player.chips -= raiseAmount;
                player.bet = amount;
                this.currentBet = amount;
                this.pot += raiseAmount;
                break;
        }
    }

    nextPhase() {
        // Reset bets for new betting round
        this.players.forEach(player => player.bet = 0);
        this.currentBet = 0;

        switch(this.phase) {
            case 'preflop':
                this.phase = 'flop';
                this.dealCommunityCards(3);
                break;
            case 'flop':
                this.phase = 'turn';
                this.dealCommunityCards(1);
                break;
            case 'turn':
                this.phase = 'river';
                this.dealCommunityCards(1);
                break;
            case 'river':
                this.phase = 'showdown';
                this.determineWinner();
                break;
        }
    }

    evaluateHand(playerHand, communityCards) {
        const allCards = [...playerHand, ...communityCards];
        
        // Simple hand evaluation (can be expanded)
        const hasFlush = this.checkFlush(allCards);
        const hasStraight = this.checkStraight(allCards);
        const pairs = this.checkPairs(allCards);
        
        if (hasFlush && hasStraight) return { rank: 8, name: 'Straight Flush' };
        if (pairs.fourOfKind) return { rank: 7, name: 'Four of a Kind' };
        if (pairs.threeOfKind && pairs.pair) return { rank: 6, name: 'Full House' };
        if (hasFlush) return { rank: 5, name: 'Flush' };
        if (hasStraight) return { rank: 4, name: 'Straight' };
        if (pairs.threeOfKind) return { rank: 3, name: 'Three of a Kind' };
        if (pairs.twoPair) return { rank: 2, name: 'Two Pair' };
        if (pairs.pair) return { rank: 1, name: 'Pair' };
        
        return { rank: 0, name: 'High Card', highCard: Math.max(...allCards.map(c => c.value)) };
    }

    checkFlush(cards) {
        const suits = {};
        cards.forEach(card => {
            suits[card.suit] = (suits[card.suit] || 0) + 1;
        });
        return Object.values(suits).some(count => count >= 5);
    }

    checkStraight(cards) {
        const values = [...new Set(cards.map(c => c.value))].sort((a, b) => a - b);
        
        // Check for regular straights
        for (let i = 0; i <= values.length - 5; i++) {
            if (values[i + 4] - values[i] === 4) return true;
        }
        
        // Check for A-2-3-4-5 (wheel) straight
        if (values.includes(14) && values.includes(2) && values.includes(3) && 
            values.includes(4) && values.includes(5)) {
            return true;
        }
        
        return false;
    }

    checkPairs(cards) {
        const ranks = {};
        cards.forEach(card => {
            ranks[card.value] = (ranks[card.value] || 0) + 1;
        });
        
        const counts = Object.values(ranks);
        return {
            fourOfKind: counts.includes(4),
            threeOfKind: counts.includes(3),
            pair: counts.includes(2),
            twoPair: counts.filter(c => c === 2).length >= 2
        };
    }

    determineWinner() {
        const activePlayers = this.players.filter(p => !p.folded);
        
        if (activePlayers.length === 1) {
            activePlayers[0].chips += this.pot;
            return activePlayers[0];
        }

        let bestPlayer = null;
        let bestHand = { rank: -1, highCard: 0 };

        activePlayers.forEach(player => {
            const handRank = this.evaluateHand(player.hand, this.communityCards);
            const currentHighCard = handRank.highCard || 0;
            const bestHighCard = bestHand.highCard || 0;
            
            if (handRank.rank > bestHand.rank || 
                (handRank.rank === bestHand.rank && currentHighCard > bestHighCard)) {
                bestHand = handRank;
                bestPlayer = player;
            }
        });

        if (bestPlayer) {
            bestPlayer.chips += this.pot;
        }
        return bestPlayer;
    }

    getHandStrength(playerIndex) {
        const player = this.players[playerIndex];
        if (player.hand.length === 0) return 0;

        const handEval = this.evaluateHand(player.hand, this.communityCards);
        
        // Convert hand rank to percentage (0-100)
        // Base strength from hand rank (0-8) gives us 0-100% range
        let strength = (handEval.rank / 8) * 100;
        
        // For high card hands, add bonus based on card values
        if (handEval.rank === 0 && handEval.highCard) {
            // High cards range from 2-14 (Ace), add up to 15% bonus
            strength += ((handEval.highCard - 2) / 12) * 15;
        }
        
        return Math.min(100, Math.max(0, strength));
    }

    getRecommendedAction(playerIndex) {
        const player = this.players[playerIndex];
        const strength = this.getHandStrength(playerIndex);
        const callAmount = this.currentBet - player.bet;
        const potOdds = (this.pot + callAmount) > 0 ? callAmount / (this.pot + callAmount) : 0;

        if (strength > 70) {
            return { action: 'raise', reason: 'Strong hand - maximize value' };
        } else if (strength > 40) {
            if (callAmount === 0) {
                return { action: 'check', reason: 'Decent hand - see more cards for free' };
            }
            return { action: 'call', reason: 'Decent hand - worth seeing more cards' };
        } else if (strength > 20 && potOdds < 0.3) {
            return { action: 'call', reason: 'Getting good pot odds' };
        } else {
            if (callAmount === 0) {
                return { action: 'check', reason: 'Free card - why not?' };
            }
            return { action: 'fold', reason: 'Weak hand - save your chips' };
        }
    }

    getCoachingTips(playerIndex) {
        const player = this.players[playerIndex];
        const tips = [];
        const strength = this.getHandStrength(playerIndex);

        // Position-based tips
        if (playerIndex === 0) {
            tips.push('You\'re first to act - being early is a disadvantage');
        } else {
            tips.push('Later position gives you information advantage');
        }

        // Hand strength tips
        if (strength > 60) {
            tips.push('Premium hand - consider raising to build the pot');
        } else if (strength < 30) {
            tips.push('Marginal hand - be cautious with large bets');
        }

        // Phase-specific tips
        if (this.phase === 'preflop') {
            tips.push('Starting hand selection is crucial in poker');
        } else if (this.phase === 'flop') {
            tips.push('The flop defines your hand - reassess your strength');
        } else if (this.phase === 'river') {
            tips.push('Last chance to bet - make it count or save chips');
        }

        return tips;
    }

    aiPlayerAction(playerIndex) {
        const player = this.players[playerIndex];
        if (player.folded || player.isHuman) return null;

        const recommendation = this.getRecommendedAction(playerIndex);
        const callAmount = this.currentBet - player.bet;

        // AI follows recommendation with some randomness
        const random = Math.random();
        
        if (recommendation.action === 'fold') {
            if (random > 0.2) { // 80% follow recommendation
                return 'fold';
            } else {
                return callAmount === 0 ? 'check' : 'call';
            }
        } else if (recommendation.action === 'raise') {
            if (random > 0.3) { // 70% raise
                const raiseAmount = this.currentBet + Math.floor(this.pot * 0.5);
                return { action: 'raise', amount: raiseAmount };
            } else {
                return callAmount === 0 ? 'check' : 'call';
            }
        } else {
            return recommendation.action;
        }
    }
}
