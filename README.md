# Game Tree Physics

**Dedicated to Marine Jake Pettit - Thank you for your service**

A physics-based browser game featuring realistic tree movement and dynamics. Dodge falling obstacles and collect power-ups while your tree sways naturally with the wind!

## About

This game demonstrates realistic physics simulation applied to a tree character. The tree sways naturally based on movement, creating an engaging and challenging gameplay experience.

## Features

- **Realistic Physics**: Tree movement uses pendulum physics for natural swaying motion
- **Dynamic Gameplay**: Avoid falling obstacles while collecting power-ups
- **Score Tracking**: Keep track of your current score and high score
- **Responsive Design**: Works on desktop and mobile devices
- **Simple Controls**: Easy to learn, challenging to master

## How to Play

1. Open `index.html` in your web browser
2. Click "Start Game" to begin
3. Use **Arrow Keys** or **WASD** to move your tree left and right
4. **Avoid** the brown falling obstacles
5. **Collect** the golden star power-ups for bonus points
6. Each obstacle you dodge gives you 10 points
7. Each power-up gives you 50 points

## Installation

No installation required! Simply clone this repository and open `index.html` in your web browser:

```bash
git clone https://github.com/JohnDaWalka/game-tree-physics.git
cd game-tree-physics
# Open index.html in your browser
```

## Game Controls

- **Left Arrow** or **A**: Move tree left
- **Right Arrow** or **D**: Move tree right
- **Start Game** button: Begin a new game
- **Reset** button: Reset the game

## Technical Details

The game is built using:
- **HTML5 Canvas** for rendering
- **JavaScript** for game logic and physics
- **CSS3** for styling and UI

### Physics Implementation

The tree uses a simplified pendulum physics model:
- Sway angle is affected by player movement
- Restoring force brings the tree back to center
- Damping creates realistic motion decay
- Maximum sway angle is limited for playability

## Credits

Created as a tribute to Marine Jake Pettit.

## License

This project is open source and available for educational purposes.
