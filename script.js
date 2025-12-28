let startTime, animationFrameId, blockInterval;
let correct = 0, wrong = 0;
let keysPressed = {};
let currentLevel = 1;
let currentDifficulty = 'normal';

const levelsConfig = {
    normal: [
        { level: 1, time: 30000,  errors: 15, speed: 5, spawn: 850 },
        { level: 2, time: 45000,  errors: 13, speed: 6, spawn: 750 },
        { level: 3, time: 60000,  errors: 10, speed: 7, spawn: 650 }
    ],
    dificil: [
        { level: 1, time: 60000,  errors: 10, speed: 9,  spawn: 550 },
        { level: 2, time: 90000,  errors: 8,  speed: 10, spawn: 450 },
        { level: 3, time: 120000, errors: 5,  speed: 11, spawn: 400 }
    ]
};

const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');
const finalCountdown = document.getElementById('final-countdown');
const modal = document.getElementById('modal-gameover');
const startMenu = document.getElementById('start-menu');
const blocksContainer = document.getElementById('blocks-container');
const scoreCorrectDisplay = document.getElementById('score-correct');
const scoreWrongDisplay = document.getElementById('score-wrong');
const finalStats = document.getElementById('final-stats');
const btnNext = document.getElementById('btn-next-level');
const btnRestart = document.getElementById('btn-restart');
const btnSurrender = document.getElementById('btn-surrender');

function setDifficulty(diff) {
    currentDifficulty = diff;
    currentLevel = 1;
    startMenu.style.display = 'none';
    startGame();
}

function startGame() {
    const config = levelsConfig[currentDifficulty][currentLevel - 1];
    correct = 0; wrong = 0;
    keysPressed = {};
    updateScore();
    modal.style.display = 'none';
    finalCountdown.style.display = 'none';
    blocksContainer.innerHTML = '';
    timerBar.style.backgroundColor = '#ffffff';
    startTime = performance.now();
    if (blockInterval) clearInterval(blockInterval);
    blockInterval = setInterval(createBlock, config.spawn);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameLoop(startTime);
}

function createBlock() {
    const block = document.createElement('div');
    block.classList.add('block');
    const laneList = [
        { key: 'j', x: 40, color: '#ff4444', class: 'bar-red' },
        { key: 'k', x: 285, color: '#4444ff', class: 'bar-blue' },
        { key: 'l', x: 530, color: '#b8860b', class: 'bar-yellow' }
    ];
    const lane = laneList[Math.floor(Math.random() * 3)];
    
    // Mapeo de Flechas a Teclas WASD
    const directions = [
        { symbol: '↑', key: 'w' },
        { symbol: '↓', key: 's' },
        { symbol: '←', key: 'a' },
        { symbol: '→', key: 'd' }
    ];
    const dir = directions[Math.floor(Math.random() * 4)];
    
    block.innerText = dir.symbol;
    block.dataset.laneKey = lane.key;
    block.dataset.requiredDir = dir.key;
    block.dataset.laneClass = lane.class;
    block.style.left = lane.x + 'px';
    block.style.top = '0px';
    block.style.backgroundColor = lane.color;
    block.style.boxShadow = `0 0 20px ${lane.color}`;
    blocksContainer.appendChild(block);
}

function updateBlocks(speed) {
    document.querySelectorAll('.block').forEach(block => {
        let top = parseInt(block.style.top);
        block.style.top = (top + speed) + 'px';
        if (top > 740) {
            if (!block.dataset.processed) {
                wrong++;
                updateScore();
                showFloatingText(parseInt(block.style.left), 700, 'wrong');
            }
            block.remove();
        }
    });
}

function checkInput() {
    document.querySelectorAll('.block').forEach(block => {
        const top = parseInt(block.style.top);
        if (top > 650 && top < 730 && !block.dataset.processed) {
            const laneKey = block.dataset.laneKey;
            const dirKey = block.dataset.requiredDir;

            if (keysPressed[laneKey] && keysPressed[dirKey]) {
                correct++;
                block.dataset.processed = "true";
                const bar = document.querySelector('.' + block.dataset.laneClass);
                bar.classList.add('hit-flash');
                setTimeout(() => bar.classList.remove('hit-flash'), 100);
                showFloatingText(parseInt(block.style.left), top, 'correct');
                block.remove();
                updateScore();
            }
        }
    });
}

function gameLoop(currentTime) {
    const config = levelsConfig[currentDifficulty][currentLevel - 1];
    const elapsed = currentTime - startTime;
    const timeLeft = Math.max(0, config.time - elapsed);
    const percentage = (timeLeft / config.time) * 100;
    const secondsLeft = Math.ceil(timeLeft / 1000);
    
    if (secondsLeft <= 3 && secondsLeft > 0) {
        if (blockInterval) { clearInterval(blockInterval); blockInterval = null; }
        finalCountdown.style.display = 'block';
        finalCountdown.innerText = secondsLeft;
    }

    timerBar.style.width = percentage + '%';
    timerText.innerText = secondsLeft + "s";
    checkInput();
    updateBlocks(config.speed);

    if (wrong >= config.errors) {
        endGame("GAME OVER", `Nivel ${currentLevel} fallido. Superaste los ${config.errors} errores.`, "#ff4444", false);
        return;
    }

    if (timeLeft <= 0) {
        const isLast = currentLevel === 3;
        endGame("¡NIVEL SUPERADO!", isLast ? "¡ERES UNA LEYENDA DE MOVEON!" : `¡Nivel ${currentLevel} listo! Siguiente nivel...`, "#ffd700", !isLast);
    } else {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function updateScore() {
    scoreCorrectDisplay.innerText = correct;
    scoreWrongDisplay.innerText = wrong;
}

function showFloatingText(x, y, type) {
    const text = document.createElement('div');
    text.className = `floating-text ${type === 'correct' ? 'plus-one' : 'minus-one'}`;
    text.innerText = type === 'correct' ? '+1' : '-1';
    text.style.left = (x + 80) + 'px';
    text.style.top = y + 'px';
    blocksContainer.appendChild(text);
    setTimeout(() => text.remove(), 700);
}

function endGame(title, message, color, showNext) {
    finalCountdown.style.display = 'none';
    if (blockInterval) clearInterval(blockInterval);
    cancelAnimationFrame(animationFrameId);
    modal.style.display = 'flex';
    modal.querySelector('h1').innerText = title;
    modal.querySelector('h1').style.color = color;
    finalStats.innerHTML = `<p>${message}</p><div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;"><div style="color: #44ff44;">Aciertos: ${correct}</div><div style="color: #ff4444;">Errores: ${wrong}</div></div>`;
    btnNext.style.display = showNext ? 'block' : 'none';
}

window.addEventListener('keydown', e => keysPressed[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => delete keysPressed[e.key.toLowerCase()]);
btnNext.addEventListener('click', () => { currentLevel++; startGame(); });
btnRestart.addEventListener('click', () => { modal.style.display = 'none'; startMenu.style.display = 'flex'; });
btnSurrender.addEventListener('click', () => { endGame("GAME OVER", "Te has rendido.", "#ff8800", false); });