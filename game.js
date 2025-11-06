// Game Tree Physics - Dedicated to Marine Jake Pettit
// A physics-based game featuring realistic tree movement

class GameTreePhysics {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        
        // Tree properties
        this.tree = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 40,
            height: 100,
            velocity: 0,
            acceleration: 0,
            swayAngle: 0,
            swayVelocity: 0,
            swayAcceleration: 0
        };
        
        // Physics constants
        this.gravity = 0.5;
        this.friction = 0.95;
        this.swayDamping = 0.98;
        this.moveSpeed = 5;
        
        // Obstacles
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = 90;
        
        // Power-ups
        this.powerUps = [];
        this.powerUpTimer = 0;
        this.powerUpInterval = 150;
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Update UI
        this.updateScoreDisplay();
        
        // Start animation loop
        this.animate();
    }
    
    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.score = 0;
            this.obstacles = [];
            this.powerUps = [];
            this.tree.x = this.canvas.width / 2;
            this.updateScoreDisplay();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.score = 0;
        this.obstacles = [];
        this.powerUps = [];
        this.tree.x = this.canvas.width / 2;
        this.tree.swayAngle = 0;
        this.tree.swayVelocity = 0;
        this.updateScoreDisplay();
    }
    
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    updatePhysics() {
        if (!this.gameRunning) return;
        
        // Handle input for tree movement
        if (this.keys['arrowleft'] || this.keys['a']) {
            this.tree.x -= this.moveSpeed;
            this.tree.swayAcceleration = -0.02;
        } else if (this.keys['arrowright'] || this.keys['d']) {
            this.tree.x += this.moveSpeed;
            this.tree.swayAcceleration = 0.02;
        } else {
            this.tree.swayAcceleration = 0;
        }
        
        // Keep tree in bounds
        this.tree.x = Math.max(this.tree.width / 2, Math.min(this.canvas.width - this.tree.width / 2, this.tree.x));
        
        // Update tree sway physics (realistic pendulum motion)
        this.tree.swayVelocity += this.tree.swayAcceleration;
        this.tree.swayVelocity += -0.01 * Math.sin(this.tree.swayAngle); // Restoring force
        this.tree.swayVelocity *= this.swayDamping;
        this.tree.swayAngle += this.tree.swayVelocity;
        
        // Limit sway angle
        this.tree.swayAngle = Math.max(-0.3, Math.min(0.3, this.tree.swayAngle));
        
        // Spawn obstacles
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }
        
        // Spawn power-ups
        this.powerUpTimer++;
        if (this.powerUpTimer >= this.powerUpInterval) {
            this.spawnPowerUp();
            this.powerUpTimer = 0;
        }
        
        // Update obstacles (iterate backwards to safely remove items)
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += obstacle.speed;
            
            // Check collision with tree
            if (this.checkCollision(obstacle, this.tree)) {
                this.gameOver();
            }
            
            // Remove off-screen obstacles and add to score
            if (obstacle.y > this.canvas.height) {
                this.obstacles.splice(i, 1);
                this.score += 10;
                this.updateScoreDisplay();
            }
        }
        
        // Update power-ups (iterate backwards to safely remove items)
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.speed;
            
            // Check collision with tree
            if (this.checkCollision(powerUp, this.tree)) {
                this.score += 50;
                this.powerUps.splice(i, 1);
                this.updateScoreDisplay();
            }
            
            // Remove off-screen power-ups
            if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    spawnObstacle() {
        const obstacle = {
            x: Math.random() * (this.canvas.width - 30) + 15,
            y: -30,
            width: 30,
            height: 30,
            speed: 2 + Math.random() * 2,
            color: '#8B4513'
        };
        this.obstacles.push(obstacle);
    }
    
    spawnPowerUp() {
        const powerUp = {
            x: Math.random() * (this.canvas.width - 20) + 10,
            y: -20,
            width: 20,
            height: 20,
            speed: 2,
            color: '#FFD700'
        };
        this.powerUps.push(powerUp);
    }
    
    checkCollision(obj1, obj2) {
        // obj1 (obstacle/powerup) uses top-left positioning
        // obj2 (tree) uses center positioning
        const tree = {
            left: obj2.x - obj2.width / 2,
            right: obj2.x + obj2.width / 2,
            top: obj2.y - obj2.height,
            bottom: obj2.y
        };
        
        return obj1.x < tree.right &&
               obj1.x + obj1.width > tree.left &&
               obj1.y < tree.bottom &&
               obj1.y + obj1.height > tree.top;
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.updateScoreDisplay();
        }
        
        // Use setTimeout to avoid blocking the UI during the final render
        setTimeout(() => {
            alert(`Game Over! Your score: ${this.score}`);
        }, 100);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8C8');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ground
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(0, this.canvas.height - 30, this.canvas.width, 30);
        
        // Draw grass
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.canvas.height - 35, this.canvas.width, 5);
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Add shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width, obstacle.height);
        });
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
            this.ctx.rotate((Date.now() / 500) % (2 * Math.PI));
            
            this.ctx.fillStyle = powerUp.color;
            this.ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5;
                const radius = i % 2 === 0 ? 12 : 6;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        // Draw tree with physics-based sway
        this.ctx.save();
        this.ctx.translate(this.tree.x, this.tree.y);
        this.ctx.rotate(this.tree.swayAngle);
        
        // Tree trunk
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(-this.tree.width / 2, -this.tree.height, this.tree.width, this.tree.height);
        
        // Tree canopy (multiple circles for bushier look)
        this.ctx.fillStyle = '#228B22';
        const canopyY = -this.tree.height - 20;
        
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(-15 + i * 15, canopyY - i * 10, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Highlight on canopy
        this.ctx.fillStyle = 'rgba(144, 238, 144, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(-10, canopyY - 15, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Draw game status
        if (!this.gameRunning && this.obstacles.length === 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 40, this.canvas.width, 80);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press Start Game to Begin!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    animate() {
        this.updatePhysics();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameTreePhysics();
});
