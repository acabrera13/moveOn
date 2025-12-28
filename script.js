const totalTime = 60 * 1000;
const maxErrors = 15; 
let startTime, animationFrameId, blockInterval;
let correct = 0, wrong = 0;
let keysPressed = {};

const timerBar = document.getElementById('timer-bar');
const modal = document.getElementById('modal-gameover');
const modalTitle = modal.querySelector('h1');
const blocksContainer = document.getElementById('blocks-container');
const scoreCorrectDisplay = document.getElementById('score-correct');
const scoreWrongDisplay = document.getElementById('score-wrong');
const finalStats = document.getElementById('final-stats');
const btnRestart = document.getElementById('btn-restart');

const arrowSymbols = ['↑', '↓', '←', '→'];
const lanes = [
    { key: 'j', x: 40, color: '#ff4444', class: 'bar-red' },
    { key: 'k', x: 285, color: '#4444ff', class: 'bar-blue' },
    { key: 'l', x: 530, color: '#b8860b', class: 'bar-yellow' }
];

function startGame() {
    correct = 0; wrong = 0;
    keysPressed = {};
    updateScore();
    modal.style.display = 'none';
    blocksContainer.innerHTML = '';
    timerBar.style.backgroundColor = '#ffffff';
    startTime = performance.now();
    
    if (blockInterval) clearInterval(blockInterval);
    blockInterval = setInterval(createBlock, 800); // Un poco más rápido por ser más alto

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameLoop(startTime);
}

function createBlock() {
    const block = document.createElement('div');
    block.classList.add('block');
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const arrow = arrowSymbols[Math.floor(Math.random() * arrowSymbols.length)];
    
    block.innerText = arrow;
    block.dataset.laneKey = lane.key;
    block.dataset.arrow = arrow;
    block.dataset.laneClass = lane.class;
    block.style.left = lane.x + 'px';
    block.style.top = '0px';
    block.style.backgroundColor = lane.color;
    block.style.boxShadow = `0 0 20px ${lane.color}`;
    blocksContainer.appendChild(block);
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

function checkInput() {
    const blocks = document.querySelectorAll('.block');
    blocks.forEach(block => {
        const top = parseInt(block.style.top);
        
        // ZONA DE IMPACTO AJUSTADA PARA ALTURA 800px
        // Las barras están en el fondo, detectamos entre 650 y 730
        if (top > 650 && top < 730 && !block.dataset.processed) {
            let colorKey = block.dataset.laneKey; 
            let inputArrow = '';
            if (keysPressed['w']) inputArrow = '↑';
            if (keysPressed['s']) inputArrow = '↓';
            if (keysPressed['a']) inputArrow = '←';
            if (keysPressed['d']) inputArrow = '→';

            if (keysPressed[colorKey] && inputArrow === block.dataset.arrow) {
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

function updateBlocks() {
    const blocks = document.querySelectorAll('.block');
    blocks.forEach(block => {
        let top = parseInt(block.style.top);
        block.style.top = (top + 5) + 'px'; // Velocidad aumentada ligeramente

        // Si sobrepasa la zona de las barras
        if (top > 740) {
            if (!block.dataset.processed) {
                wrong++;
                showFloatingText(parseInt(block.style.left), 700, 'wrong');
                updateScore();
            }
            block.remove();
        }
    });
}

function gameLoop(currentTime) {
    const elapsed = currentTime - startTime;
    const timeLeft = Math.max(0, totalTime - elapsed);
    const percentage = (timeLeft / totalTime) * 100;
    
    timerBar.style.width = percentage + '%';
    
    if (percentage < 20) {
        timerBar.style.backgroundColor = '#ff4444';
    } else {
        timerBar.style.backgroundColor = '#ffffff';
    }

    checkInput();
    updateBlocks();

    if (wrong >= maxErrors) {
        endGame("GAME OVER", "¡Demasiados errores!", "#ff4444");
        return;
    }

    if (timeLeft <= 0) {
        endGame("¡NIVEL SUPERADO!", "¡Felicidades, eres un experto!", "#ffd700");
    } else {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function endGame(title, message, color) {
    modal.style.display = 'flex';
    modalTitle.innerText = title;
    modalTitle.style.color = color;
    finalStats.innerHTML = `${message}<br><br>Aciertos: ${correct} | Errores: ${wrong}`;
    clearInterval(blockInterval);
    cancelAnimationFrame(animationFrameId);
}

window.addEventListener('keydown', e => keysPressed[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => delete keysPressed[e.key.toLowerCase()]);
btnRestart.addEventListener('click', startGame);
window.onload = startGame;