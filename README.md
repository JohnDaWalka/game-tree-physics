# Game Tree Physics - Texas Hold'em Poker

**Dedicated to Marine Jake Pettit - Thank you for your service**

A sophisticated Texas Hold'em poker game implementing **Game Theory Optimal (GTO)** strategy using **Monte Carlo Tree Search (MCTS)** with **Fischer coefficient shuffling** for enhanced randomness and fair play.

## About

This poker game uses advanced artificial intelligence techniques to create a challenging opponent that plays using game-theoretic optimal strategies. The AI analyzes the game tree using Monte Carlo simulations to make unexploitable decisions.

## Features

### Core Gameplay
- **Texas Hold'em Poker**: Full implementation with blinds, betting rounds, and showdown
- **Game Tree Analysis**: AI uses MCTS to evaluate thousands of possible game states
- **GTO Strategy**: Opponent plays using Nash equilibrium-based decisions
- **Fischer Coefficient Shuffling**: Enhanced randomness using Fischer-Yates algorithm with coefficient weighting

### Technical Implementation
- **Monte Carlo Tree Search**: 1000 iterations per decision for optimal play
- **UCB1 Selection**: Upper Confidence Bound for balancing exploration vs exploitation
- **Game State Simulation**: Random playouts to terminal states for hand evaluation
- **Backpropagation**: Value updates through the game tree for learning

### AI Decision Making
The CPU opponent uses a sophisticated decision-making process:
1. **Selection**: Traverse game tree using UCB1 formula
2. **Expansion**: Add new action nodes (fold, call/check, raise)
3. **Simulation**: Random playout using Fischer shuffled deck
4. **Backpropagation**: Update visit counts and win rates

## How to Play

1. Open `index.html` in your web browser
2. Click **"New Game"** to deal a new hand
3. You start with 1000 chips, as does your opponent
4. Use the action buttons:
   - **Fold**: Give up your hand and forfeit the pot
   - **Check/Call**: Match the current bet or check if no bet
   - **Raise**: Increase the bet (opens raise panel)

### Betting Structure
- **Small Blind**: $5 (you pay)
- **Big Blind**: $10 (opponent pays)
- **Minimum Raise**: $10
- **Maximum Raise**: Configurable up to your stack

### Game Phases
1. **Pre-flop**: Two hole cards dealt, first betting round
2. **Flop**: Three community cards revealed
3. **Turn**: Fourth community card revealed
4. **River**: Fifth community card revealed
5. **Showdown**: Best 5-card hand wins

## Hand Rankings (Best to Worst)
1. **Straight Flush** - Five cards in sequence, all same suit
2. **Four of a Kind** - Four cards of the same rank
3. **Full House** - Three of a kind plus a pair
4. **Flush** - Five cards of the same suit
5. **Straight** - Five cards in sequence
6. **Three of a Kind** - Three cards of the same rank
7. **Two Pair** - Two different pairs
8. **One Pair** - Two cards of the same rank
9. **High Card** - Highest card wins

## Technical Details

### Vanilla Fischer-Yates Shuffling
function fisherYatesShuffle(array) {
    // Standard Fischer-Yates algorithm for uniform distribution
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
```

### Monte Carlo Tree Search (MCTS)
The AI builds a game tree by:
- Running 1000 simulations per decision
- Using UCB1 formula: `value = exploitation + c * sqrt(ln(parent_visits) / child_visits)`
- Selecting actions with highest visit count (most explored = most promising)
- Simulating random card distributions using Fischer shuffling

### GTO Implementation
- **Unexploitable Play**: AI makes decisions that cannot be exploited in the long run
- **Balanced Ranges**: Bluffs and value bets are mathematically balanced
- **Pot Odds**: Raise sizing based on pot-size (typically 50% pot)
- **Nash Equilibrium**: Converges toward optimal mixed strategy

## Installation

No installation or dependencies required!

```bash
git clone https://github.com/JohnDaWalka/game-tree-physics.git
cd game-tree-physics
# Open index.html in your browser
```

## Game Strategy Tips

Against a GTO opponent:
- **Play tight pre-flop**: Strong starting hands only
- **Pot odds matter**: Calculate if your odds justify calling
- **Position is power**: Act last when possible
- **GTO is unexploitable**: You can't consistently beat perfect GTO play, but variance gives you opportunities

## Technologies Used
- **HTML5**: Game interface and structure
- **CSS3**: Poker table styling and animations
- **Vanilla JavaScript**: All game logic, no external libraries
- **MCTS Algorithm**: AI decision engine
- **Fischer-Yates**: Provably fair shuffling

## Credits

Created as a tribute to **Marine Jake Pettit**.

This project demonstrates:
- Game theory optimal poker strategy
- Monte Carlo tree search algorithms
- Fair randomization with Fischer coefficient shuffling
- Modern web-based game development

## License

This project is open source and available for educational purposes.

## Advanced Features

### Game Tree Visualization
The game internally builds and evaluates thousands of game states per decision, analyzing:
- Possible opponent hands
- Community card combinations
- Betting patterns and pot odds
- Expected value of each action

### Statistical Fairness
The vanilla Fischer-Yates shuffle ensures:
- Uniform distribution of cards (each permutation equally likely)
- No predictable patterns or bias
- Provably fair randomness (within browser Math.random() limitations)
- Equal probability for all card arrangements

Enjoy the challenge of playing against a mathematically optimal poker opponent!
