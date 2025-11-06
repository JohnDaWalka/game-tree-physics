# Poker Coach - Interactive Poker Game with Coaching

A fully interactive Texas Hold'em poker game with real-time coaching features to help you improve your poker skills.

## Features

### Interactive Game Interface
- **Texas Hold'em Poker**: Play against 2 AI opponents
- **Realistic Gameplay**: Includes betting rounds (preflop, flop, turn, river)
- **Professional UI**: Clean, poker table-style interface with card animations
- **Full Game Controls**: Fold, Check, Call, and Raise actions

### Coaching Features
- **Hand Strength Indicator**: Real-time visual display of your hand strength (0-100%)
- **Recommended Actions**: AI coach suggests the best move with reasoning
- **Strategic Tips**: Context-aware coaching tips based on:
  - Your position at the table
  - Current hand strength
  - Game phase (preflop, flop, turn, river)
  - Pot odds and betting patterns

### Learning Elements
- Understand when to play aggressively vs. conservatively
- Learn position importance in poker
- Practice pot odds and hand evaluation
- Get feedback on every decision

## How to Play

### Quick Start (No Installation)
Simply open `index.html` in your web browser:
```bash
open index.html
# or
firefox index.html
# or
chrome index.html
```

### Using a Local Server (Recommended)
1. Install dependencies:
```bash
npm install
```

2. Start the game:
```bash
npm start
```

3. Open your browser to `http://localhost:8080`

## Game Rules

1. **Starting**: Click "New Game" to begin
2. **Blinds**: Small blind ($10) and big blind ($20) are automatically posted
3. **Betting**: You can Fold, Check (if no bet), Call, or Raise
4. **Phases**: 
   - Preflop: After receiving your 2 hole cards
   - Flop: 3 community cards revealed
   - Turn: 4th community card revealed
   - River: 5th and final community card revealed
   - Showdown: Best hand wins
5. **Winning**: Last player standing or best 5-card hand wins the pot

## Coaching System

The coaching panel provides three key insights:

### Hand Strength
A visual bar and percentage showing how strong your current hand is:
- 0-20%: Weak hand - consider folding
- 20-40%: Marginal hand - proceed with caution
- 40-70%: Good hand - worth playing
- 70-100%: Strong hand - bet for value

### Recommended Action
The coach analyzes your hand, pot odds, and game state to suggest:
- **Fold**: When your hand is weak or the cost is too high
- **Check**: When you can see cards for free
- **Call**: When pot odds justify seeing more cards
- **Raise**: When you have a strong hand and want to build the pot

### Coaching Tips
Dynamic tips that adapt to:
- Your table position
- Current betting round
- Hand strength
- Game situation

## Technical Details

- **Pure JavaScript**: No frameworks required
- **Responsive Design**: Works on desktop and mobile
- **Hand Evaluation**: Implements standard poker hand rankings
- **AI Opponents**: Use basic strategy with randomization
- **No Backend**: Runs entirely in the browser

## Project Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Professional poker table styling
├── poker-game.js       # Core game logic and hand evaluation
├── poker-ui.js         # UI controller and event handling
├── package.json        # Project configuration
└── README.md           # This file
```

## Future Enhancements

Potential additions for future versions:
- More sophisticated AI using game theory
- Hand history tracking
- Multiple difficulty levels
- Tournament mode
- Statistics and analytics
- More detailed hand analysis
- Multiplayer support

## Contributing

Feel free to fork and submit pull requests for improvements!

## License

MIT License - feel free to use and modify as needed.
