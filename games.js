// Game Management
function openGame(gameName) {
    const modalId = gameName + 'Modal';
    document.getElementById(modalId).style.display = 'block';
    
    if (gameName === 'pong') {
        initPongGame();
    } else if (gameName === 'spike') {
        initSpikeGame();
    } else if (gameName === 'memory') {
        initMemoryGame();
    }
}

function closeGame(gameName) {
    const modalId = gameName + 'Modal';
    document.getElementById(modalId).style.display = 'none';
    
    if (gameName === 'pong') {
        stopPongGame();
    } else if (gameName === 'spike') {
        stopSpikeGame();
    } else if (gameName === 'memory') {
        stopMemoryGame();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// =====================
// GAME 1: VOLLEYBALL PONG
// =====================
const pongGame = {
    canvas: null,
    ctx: null,
    running: false,
    animationId: null,
    
    ball: {
        x: 300,
        y: 200,
        radius: 8,
        dx: 5,
        dy: 5,
        speed: 5
    },
    
    playerPaddle: {
        x: 20,
        y: 150,
        width: 15,
        height: 100
    },
    
    aiPaddle: {
        x: 565,
        y: 150,
        width: 15,
        height: 100
    },
    
    playerScore: 0,
    aiScore: 0,
    
    keys: {}
};

function initPongGame() {
    pongGame.canvas = document.getElementById('pongCanvas');
    pongGame.ctx = pongGame.canvas.getContext('2d');
    pongGame.running = true;
    
    // Reset scores
    pongGame.playerScore = 0;
    pongGame.aiScore = 0;
    
    // Reset ball
    pongGame.ball.x = pongGame.canvas.width / 2;
    pongGame.ball.y = pongGame.canvas.height / 2;
    pongGame.ball.dx = 5;
    pongGame.ball.dy = 5;
    
    // Reset paddles
    pongGame.playerPaddle.y = pongGame.canvas.height / 2 - 50;
    pongGame.aiPaddle.y = pongGame.canvas.height / 2 - 50;
    
    // Event listeners
    document.addEventListener('keydown', handlePongKeyDown);
    document.addEventListener('keyup', handlePongKeyUp);
    
    pongGame.animationId = requestAnimationFrame(updatePongGame);
}

function handlePongKeyDown(e) {
    pongGame.keys[e.key] = true;
}

function handlePongKeyUp(e) {
    pongGame.keys[e.key] = false;
}

function updatePongGame() {
    if (!pongGame.running) return;
    
    // Clear canvas
    pongGame.ctx.fillStyle = '#E0F6FF';
    pongGame.ctx.fillRect(0, 0, pongGame.canvas.width, pongGame.canvas.height);
    
    // Draw center line
    pongGame.ctx.strokeStyle = '#B0E0E6';
    pongGame.ctx.setLineDash([5, 5]);
    pongGame.ctx.beginPath();
    pongGame.ctx.moveTo(pongGame.canvas.width / 2, 0);
    pongGame.ctx.lineTo(pongGame.canvas.width / 2, pongGame.canvas.height);
    pongGame.ctx.stroke();
    pongGame.ctx.setLineDash([]);
    
    // Player movement
    if (pongGame.keys['ArrowUp'] || pongGame.keys['w'] || pongGame.keys['W']) {
        pongGame.playerPaddle.y = Math.max(0, pongGame.playerPaddle.y - 6);
    }
    if (pongGame.keys['ArrowDown'] || pongGame.keys['s'] || pongGame.keys['S']) {
        pongGame.playerPaddle.y = Math.min(pongGame.canvas.height - pongGame.playerPaddle.height, pongGame.playerPaddle.y + 6);
    }
    
    // AI movement
    const aiCenter = pongGame.aiPaddle.y + pongGame.aiPaddle.height / 2;
    if (aiCenter < pongGame.ball.y - 35) {
        pongGame.aiPaddle.y = Math.min(pongGame.canvas.height - pongGame.aiPaddle.height, pongGame.aiPaddle.y + 4);
    } else if (aiCenter > pongGame.ball.y + 35) {
        pongGame.aiPaddle.y = Math.max(0, pongGame.aiPaddle.y - 4);
    }
    
    // Ball movement
    pongGame.ball.x += pongGame.ball.dx;
    pongGame.ball.y += pongGame.ball.dy;
    
    // Ball collision with top and bottom
    if (pongGame.ball.y - pongGame.ball.radius < 0 || pongGame.ball.y + pongGame.ball.radius > pongGame.canvas.height) {
        pongGame.ball.dy *= -1;
        pongGame.ball.y = Math.max(pongGame.ball.radius, Math.min(pongGame.canvas.height - pongGame.ball.radius, pongGame.ball.y));
    }
    
    // Ball collision with paddles
    if (pongGame.ball.x - pongGame.ball.radius < pongGame.playerPaddle.x + pongGame.playerPaddle.width &&
        pongGame.ball.y > pongGame.playerPaddle.y &&
        pongGame.ball.y < pongGame.playerPaddle.y + pongGame.playerPaddle.height) {
        pongGame.ball.dx = Math.abs(pongGame.ball.dx);
        pongGame.ball.x = pongGame.playerPaddle.x + pongGame.playerPaddle.width + pongGame.ball.radius;
    }
    
    if (pongGame.ball.x + pongGame.ball.radius > pongGame.aiPaddle.x &&
        pongGame.ball.y > pongGame.aiPaddle.y &&
        pongGame.ball.y < pongGame.aiPaddle.y + pongGame.aiPaddle.height) {
        pongGame.ball.dx = -Math.abs(pongGame.ball.dx);
        pongGame.ball.x = pongGame.aiPaddle.x - pongGame.ball.radius;
    }
    
    // Scoring
    if (pongGame.ball.x < 0) {
        pongGame.aiScore++;
        resetPongBall();
    } else if (pongGame.ball.x > pongGame.canvas.width) {
        pongGame.playerScore++;
        resetPongBall();
    }
    
    // Check win condition
    if (pongGame.playerScore >= 5 || pongGame.aiScore >= 5) {
        const winner = pongGame.playerScore >= 5 ? 'YOU WIN! 🎉' : 'AI WINS! 🤖';
        pongGame.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        pongGame.ctx.fillRect(0, 0, pongGame.canvas.width, pongGame.canvas.height);
        pongGame.ctx.fillStyle = '#FFFFFF';
        pongGame.ctx.font = 'bold 40px Arial';
        pongGame.ctx.textAlign = 'center';
        pongGame.ctx.fillText(winner, pongGame.canvas.width / 2, pongGame.canvas.height / 2);
        pongGame.running = false;
        return;
    }
    
    // Draw paddles
    pongGame.ctx.fillStyle = '#87CEEB';
    pongGame.ctx.fillRect(pongGame.playerPaddle.x, pongGame.playerPaddle.y, pongGame.playerPaddle.width, pongGame.playerPaddle.height);
    pongGame.ctx.fillRect(pongGame.aiPaddle.x, pongGame.aiPaddle.y, pongGame.aiPaddle.width, pongGame.aiPaddle.height);
    
    // Draw ball
    pongGame.ctx.fillStyle = '#FF6B9D';
    pongGame.ctx.beginPath();
    pongGame.ctx.arc(pongGame.ball.x, pongGame.ball.y, pongGame.ball.radius, 0, Math.PI * 2);
    pongGame.ctx.fill();
    
    // Draw scores
    pongGame.ctx.fillStyle = '#4FA3D1';
    pongGame.ctx.font = 'bold 24px Arial';
    pongGame.ctx.textAlign = 'left';
    pongGame.ctx.fillText('You: ' + pongGame.playerScore, 20, 30);
    pongGame.ctx.textAlign = 'right';
    pongGame.ctx.fillText('AI: ' + pongGame.aiScore, pongGame.canvas.width - 20, 30);
    
    pongGame.animationId = requestAnimationFrame(updatePongGame);
}

function resetPongBall() {
    pongGame.ball.x = pongGame.canvas.width / 2;
    pongGame.ball.y = pongGame.canvas.height / 2;
    pongGame.ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    pongGame.ball.dy = (Math.random() - 0.5) * 5;
}

function stopPongGame() {
    pongGame.running = false;
    if (pongGame.animationId) {
        cancelAnimationFrame(pongGame.animationId);
    }
    document.removeEventListener('keydown', handlePongKeyDown);
    document.removeEventListener('keyup', handlePongKeyUp);
}

// =====================
// GAME 2: SPIKE CHALLENGE
// =====================
const spikeGame = {
    running: false,
    animationId: null,
    score: 0,
    ballY: 20,
    ballVelocity: 3,
    canClick: false,
    clickZoneStart: 200,
    clickZoneEnd: 280
};

function initSpikeGame() {
    const gameContainer = document.getElementById('spikeGame');
    gameContainer.innerHTML = `
        <div id="spikeScore" style="text-align: center; padding: 10px; font-weight: bold; color: #4FA3D1;">Score: 0</div>
        <div id="spikeCanvas" style="position: relative; width: 100%; height: 250px; background: linear-gradient(to bottom, #E0F6FF 0%, #E8F8FF 100%); border-radius: 10px; overflow: hidden;">
            <div id="ball" style="position: absolute; left: 50%; top: 20px; transform: translateX(-50%); width: 20px; height: 20px; background: #FF6B9D; border-radius: 50%; box-shadow: 0 0 10px rgba(255, 107, 157, 0.5);"></div>
            <div style="position: absolute; left: 0; right: 0; top: 200px; height: 80px; background: rgba(144, 238, 144, 0.3); border-top: 3px dashed #90EE90; border-bottom: 3px dashed #90EE90;"></div>
            <div id="instruction" style="position: absolute; top: 110px; left: 50%; transform: translateX(-50%); color: #4FA3D1; font-weight: bold; font-size: 14px;">Click when ball enters GREEN zone!</div>
        </div>
    `;
    
    spikeGame.running = true;
    spikeGame.score = 0;
    spikeGame.ballY = 20;
    
    const canvas = document.getElementById('spikeCanvas');
    canvas.addEventListener('click', handleSpikeClick);
    
    spikeGame.animationId = requestAnimationFrame(updateSpikeGame);
}

function handleSpikeClick() {
    if (spikeGame.ballY >= spikeGame.clickZoneStart && spikeGame.ballY <= spikeGame.clickZoneEnd) {
        spikeGame.score++;
        document.getElementById('spikeScore').textContent = 'Score: ' + spikeGame.score;
        spikeGame.ballY = 20;
    } else {
        spikeGame.score = Math.max(0, spikeGame.score - 1);
        document.getElementById('spikeScore').textContent = 'Score: ' + spikeGame.score;
    }
}

function updateSpikeGame() {
    if (!spikeGame.running) return;
    
    spikeGame.ballY += spikeGame.ballVelocity;
    
    const ball = document.getElementById('ball');
    if (ball) {
        ball.style.top = spikeGame.ballY + 'px';
    }
    
    if (spikeGame.ballY > 250) {
        spikeGame.ballY = 20;
        spikeGame.score = Math.max(0, spikeGame.score - 2);
        document.getElementById('spikeScore').textContent = 'Score: ' + spikeGame.score;
    }
    
    spikeGame.animationId = requestAnimationFrame(updateSpikeGame);
}

function stopSpikeGame() {
    spikeGame.running = false;
    if (spikeGame.animationId) {
        cancelAnimationFrame(spikeGame.animationId);
    }
}

// =====================
// GAME 3: MEMORY MATCH
// =====================
const memoryGame = {
    cards: ['🏐', '🏐', '⚽', '⚽', '🎾', '🎾', '🏸', '🏸', 
            '🥏', '🥏', '🏓', '🏓', '⛳', '⛳', '🎳', '🎳'],
    flipped: [],
    matched: [],
    moves: 0,
    startTime: 0,
    animationId: null,
    running: false
};

function initMemoryGame() {
    const gameContainer = document.getElementById('memoryGame');
    gameContainer.innerHTML = '';
    
    // Shuffle cards
    memoryGame.cards = memoryGame.cards.sort(() => Math.random() - 0.5);
    memoryGame.flipped = [];
    memoryGame.matched = [];
    memoryGame.moves = 0;
    memoryGame.startTime = Date.now();
    memoryGame.running = true;
    
    // Create card elements
    memoryGame.cards.forEach((card, index) => {
        const cardEl = document.createElement('button');
        cardEl.className = 'memory-card';
        cardEl.dataset.index = index;
        cardEl.dataset.card = card;
        cardEl.textContent = '?';
        cardEl.addEventListener('click', () => handleMemoryCardClick(index, cardEl));
        gameContainer.appendChild(cardEl);
    });
    
    updateMemoryTimer();
}

function handleMemoryCardClick(index, cardEl) {
    if (!memoryGame.running || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) {
        return;
    }
    
    if (memoryGame.flipped.length < 2) {
        cardEl.classList.add('flipped');
        cardEl.textContent = cardEl.dataset.card;
        memoryGame.flipped.push({ index, cardEl });
        
        if (memoryGame.flipped.length === 2) {
            memoryGame.moves++;
            document.getElementById('moveCount').textContent = memoryGame.moves;
            
            setTimeout(() => {
                const [first, second] = memoryGame.flipped;
                if (first.cardEl.dataset.card === second.cardEl.dataset.card) {
                    first.cardEl.classList.add('matched');
                    second.cardEl.classList.add('matched');
                    memoryGame.matched.push(first.index, second.index);
                    
                    if (memoryGame.matched.length === memoryGame.cards.length) {
                        endMemoryGame();
                    }
                } else {
                    first.cardEl.classList.remove('flipped');
                    second.cardEl.classList.remove('flipped');
                    first.cardEl.textContent = '?';
                    second.cardEl.textContent = '?';
                }
                memoryGame.flipped = [];
            }, 800);
        }
    }
}

function updateMemoryTimer() {
    if (!memoryGame.running) return;
    
    const elapsed = Math.floor((Date.now() - memoryGame.startTime) / 1000);
    document.getElementById('timer').textContent = elapsed;
    
    setTimeout(updateMemoryTimer, 100);
}

function endMemoryGame() {
    memoryGame.running = false;
    const elapsed = Math.floor((Date.now() - memoryGame.startTime) / 1000);
    
    const gameContainer = document.getElementById('memoryGame');
    setTimeout(() => {
        alert(`🎉 You won!\nMoves: ${memoryGame.moves}\nTime: ${elapsed}s`);
    }, 300);
}

function stopMemoryGame() {
    memoryGame.running = false;
}
