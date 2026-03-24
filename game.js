/* game.js */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cw = canvas.width = window.innerWidth;
let ch = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
});

// UI Elements
const uiStart = document.getElementById('screen-start');
const uiWorkshop = document.getElementById('screen-workshop');
const uiEnding = document.getElementById('screen-ending');
const uiHud = document.getElementById('hud');

const elCoinCount = document.getElementById('coin-count');
const elSusBar = document.getElementById('sus-bar');
const elSusText = document.getElementById('sus-text');

const btnStart = document.getElementById('btn-start');
const btnWorkshop = document.getElementById('btn-workshop');
const btnCloseWorkshop = document.getElementById('btn-close-workshop');
const btnRestart = document.getElementById('btn-restart');
const btnBuys = document.querySelectorAll('.btn-buy');

// Game State Enum
const STATE = {
    START: 0,
    PLAYING: 1,
    UPGRADE: 2,
    ENDING: 3
};

let gameState = STATE.START;
let gameData = {
    coins: 0,
    upgrades: { 1: false, 2: false, 3: false, 4: false, 5: false }
};

// Local storage init
const STORAGE_KEY = 'EcoDriveSaveData_v1';
const localSave = localStorage.getItem(STORAGE_KEY);
if (localSave) {
    try {
        const parsed = JSON.parse(localSave);
        if (typeof parsed.coins === 'number') gameData.coins = parsed.coins;
        if (parsed.upgrades) gameData.upgrades = parsed.upgrades;
    } catch(e) {
        console.error("Failed to parse save", e);
    }
}

// Global Variables
let bgOffset = 0;
let bgSpeed = 3;
let coinsArray = [];
let particlesArray = [];
let frameCount = 0;
let lastTime = 0;

let currentSus = 0;
let coinMultiplier = 1;
let coinSpawnInterval = 100;

// Entities
class Car {
    constructor() {
        this.w = 140;
        this.h = 60;
        this.x = cw * 0.2;
        this.y = ch - ch * 0.22;
        this.bounce = 0;
        this.wheelAngle = 0;
    }

    update(dt) {
        this.y = ch - ch * 0.22; 
        this.bounce = Math.sin(frameCount * 0.15) * 4;
        this.wheelAngle += bgSpeed * 0.05;
        
        // Emissão de fumaça baseada no nível de sustentabilidade
        let spawnRate = gameData.upgrades[3] ? 20 : (gameData.upgrades[1] ? 8 : 4);
        if (!gameData.upgrades[4] && frameCount % spawnRate === 0) {
            let sC = gameData.upgrades[3] ? 'rgba(210, 210, 210, 0.3)' : 
                    (gameData.upgrades[1] ? 'rgba(120, 120, 120, 0.6)' : 'rgba(20, 20, 20, 0.8)');
            
            let px = this.x - 60;
            let py = this.y + 15 + this.bounce;
            particlesArray.push(new Particle(px, py, sC));
        }

        this.draw();
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y + this.bounce);
        
        let u1 = gameData.upgrades[1];
        let u2 = gameData.upgrades[2];
        let u3 = gameData.upgrades[3];
        let u4 = gameData.upgrades[4];

        // Corpo do Carro
        if (u4) {
            // BEV (Bateria Elétrica)
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00e5ff';

            let grad = ctx.createLinearGradient(-70, -20, 70, 20);
            grad.addColorStop(0, '#00e5ff');
            grad.addColorStop(1, '#00838f');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(-75, -20, 150, 45, 20);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(224, 247, 250, 0.9)';
            ctx.beginPath();
            ctx.roundRect(-35, -45, 75, 30, 15);
            ctx.fill();

            ctx.fillStyle = '#ffea00';
            ctx.font = '26px Arial';
            ctx.fillText('⚡', -12, 10);

        } else if (u3) {
            // Híbrido
            let grad = ctx.createLinearGradient(-70, -20, 70, 20);
            grad.addColorStop(0, '#69f0ae');
            grad.addColorStop(1, '#2e7d32');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(-70, -20, 140, 40, 15);
            ctx.fill();

            ctx.fillStyle = 'rgba(200, 230, 201, 0.85)'; 
            ctx.beginPath();
            ctx.roundRect(-30, -40, 65, 25, 10);
            ctx.fill();
        } else if (u1) {
            // Carro Antigo Com Filtro
            ctx.fillStyle = '#78909c';
            ctx.beginPath();
            ctx.roundRect(-65, -20, 130, 40, 8);
            ctx.fill();

            ctx.fillStyle = '#cfd8dc';
            ctx.fillRect(-30, -35, 60, 20);
        } else {
            // Carro Velho Fumaceiro
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(-65, -20, 130, 40);
            ctx.fillStyle = '#bcaaa4';
            ctx.fillRect(-30, -35, 60, 20);
            
            // Ferrugem
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(-50, -10, 20, 10);
            ctx.fillRect(10, -5, 15, 8);
        }

        // Pneus
        let tColor = u2 ? '#263238' : '#111';
        let tOutline = u2 ? '#64dd17' : '#424242';
        
        let drawTire = (tx, ty) => {
            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate(this.wheelAngle);
            ctx.fillStyle = tColor;
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = tOutline;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Calotas rodando
            ctx.fillStyle = u2 ? '#b0bec5' : '#757575';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // linha para ver a rotação
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(8, 0);
            ctx.stroke();

            ctx.restore();
        };

        drawTire(-40, 22);
        drawTire(45, 22);
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = -Math.random() * 2 - 2;
        this.vy = -Math.random() * 3 - 1;
        this.size = Math.random() * 12 + 6;
        this.life = 1;
        this.color = color;
    }
    update(dt) {
        this.x -= bgSpeed + Math.abs(this.vx);
        this.y += this.vy;
        this.life -= 0.015;
        this.size += 0.3;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Coin {
    constructor() {
        this.x = cw + 50;
        this.y = ch - ch * 0.15 + (Math.random() * ch * 0.05);
        this.size = 35;
        this.vx = bgSpeed; 
        this.bounce = 0;
        this.value = coinMultiplier;
        const trashes = ['🥤', '🥫', '📦', '🗞️'];
        this.icon = trashes[Math.floor(Math.random() * trashes.length)];
    }
    update(dt) {
        this.x -= this.vx;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.font = this.size + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        ctx.restore();
    }
}

let player = new Car();
let floatingTexts = [];

// Game Logic
function saveGame() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
}

function createFloatingText(txt, x, y, color = '#ffeb3b') {
    floatingTexts.push({
        txt: txt, x: x, y: y, life: 1, vy: -2, color: color
    });
}

function updateStats() {
    let boughtCount = 0;
    for (let id in gameData.upgrades) {
        if (gameData.upgrades[id]) boughtCount++;
    }
    currentSus = boughtCount * 20;

    // Progression level for visuals/speed (keeping original logic for thresholds)
    let upLvl = 0;
    if (gameData.upgrades[1]) upLvl = 1;
    if (gameData.upgrades[3]) upLvl = 2;
    if (gameData.upgrades[4]) upLvl = 3;

    document.body.className = `state-${upLvl}`;

    coinMultiplier = 1;
    if (gameData.upgrades[2]) coinMultiplier *= 2;
    if (gameData.upgrades[5]) coinMultiplier *= 2;
    
    let bRate = 100;
    if (gameData.upgrades[1]) bRate = 75;
    if (gameData.upgrades[3]) bRate = 50;
    if (gameData.upgrades[4]) bRate = 25; // bônus
    coinSpawnInterval = bRate;

    bgSpeed = 3 + (upLvl * 1.5);

    updateHUD();
    updateWorkshopUI();
}

function updateHUD() {
    elCoinCount.innerText = Math.floor(gameData.coins);
    elSusBar.style.width = currentSus + '%';
    elSusText.innerText = currentSus + '%';
    
    if(currentSus < 40) elSusText.style.color = '#fca5a5';
    else if(currentSus < 80) elSusText.style.color = '#fde047';
    else elSusText.style.color = '#86efac';
}

function updateWorkshopUI() {
    btnBuys.forEach(btn => {
        let id = btn.dataset.id;
        let cost = parseInt(btn.dataset.cost);
        let itemDiv = document.getElementById('up-' + id);
        
        if (gameData.upgrades[id]) {
            itemDiv.classList.add('bought');
            btn.innerText = 'Instalado';
            btn.disabled = true;
        } else {
            if (gameData.coins >= cost) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        }
    });
}

function checkEnding() {
    if (gameData.upgrades[4] && gameState !== STATE.ENDING) {
        gameState = STATE.ENDING;
        uiWorkshop.classList.add('hidden');
        uiHud.classList.add('hidden');
        uiEnding.classList.remove('hidden');
        coinsArray = [];
        particlesArray = [];
        saveGame();
    }
}

// Event Listeners
btnStart.addEventListener('click', () => {
    uiStart.classList.add('hidden');
    uiHud.classList.remove('hidden');
    gameState = STATE.PLAYING;
    updateStats();
});

btnWorkshop.addEventListener('click', () => {
    if (gameState === STATE.PLAYING) {
        gameState = STATE.UPGRADE;
        uiWorkshop.classList.remove('hidden');
        updateWorkshopUI();
    }
});

btnCloseWorkshop.addEventListener('click', () => {
    if (gameState === STATE.UPGRADE) {
        uiWorkshop.classList.add('hidden');
        gameState = STATE.PLAYING;
        checkEnding();
    }
});

btnRestart.addEventListener('click', () => {
    gameData = {
        coins: 0,
        upgrades: { 1: false, 2: false, 3: false, 4: false, 5: false }
    };
    saveGame();
    uiEnding.classList.add('hidden');
    uiStart.classList.remove('hidden');
    gameState = STATE.START;
    updateStats();
    coinsArray = [];
    particlesArray = [];
});

btnBuys.forEach(btn => {
    btn.addEventListener('click', () => {
        let id = btn.dataset.id;
        let cost = parseInt(btn.dataset.cost);
        
        if (!gameData.upgrades[id] && gameData.coins >= cost) {
            gameData.coins -= cost;
            gameData.upgrades[id] = true;
            saveGame();
            updateStats();
            updateWorkshopUI();
            checkEnding();
        }
    });
});

// Click collection
canvas.addEventListener('mousedown', (e) => {
    if (gameState !== STATE.PLAYING) return;

    let rect = canvas.getBoundingClientRect();
    let cx = e.clientX - rect.left;
    let cy = e.clientY - rect.top;

    for (let i = coinsArray.length - 1; i >= 0; i--) {
        let c = coinsArray[i];
        let dx = cx - c.x;
        let dy = cy - c.y;
        if (Math.hypot(dx, dy) < c.size + 15) { 
            gameData.coins += c.value;
            updateHUD();
            saveGame();
            createFloatingText("+" + c.value + "🪙", c.x, c.y);
            coinsArray.splice(i, 1);
            break; 
        }
    }
});

canvas.addEventListener('touchstart', (e) => {
    if (gameState !== STATE.PLAYING) return;
    
    let rect = canvas.getBoundingClientRect();
    for (let j = 0; j < e.touches.length; j++) {
        let cx = e.touches[j].clientX - rect.left;
        let cy = e.touches[j].clientY - rect.top;

        for (let i = coinsArray.length - 1; i >= 0; i--) {
            let c = coinsArray[i];
            let dx = cx - c.x;
            let dy = cy - c.y;
            if (Math.hypot(dx, dy) < c.size + 25) { // Extra padding for touch
                gameData.coins += c.value;
                updateHUD();
                saveGame();
                createFloatingText("+" + c.value + "🪙", c.x, c.y);
                coinsArray.splice(i, 1);
                break; 
            }
        }
    }
}, {passive:true});

// Rendering routines
function drawBackground() {
    let groundColor = gameData.upgrades[4] ? '#43a047' : (gameData.upgrades[3] ? '#66bb6a' : (gameData.upgrades[1] ? '#8d6e63' : '#5d4037'));
    
    // Draw Ground
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, ch - ch*0.2, cw, ch*0.2);

    // City Layer Parallax
    bgOffset -= bgSpeed * 0.4;
    if (bgOffset <= -cw) bgOffset = 0;

    for(let w=0; w<2; w++) {
        for(let i=0; i<15; i++) {
            let bWidth = 80 + (i * 25) % 60;
            let bHeight = 150 + (i * 40) % 250;
            let bx = w * cw + i * 140 + bgOffset;
            let by = ch - ch*0.2 - bHeight;
            
            let buildingLayerHex = gameData.upgrades[4] ? '#1565c0' : (gameData.upgrades[2] ? '#3949ab' : '#263238');
            ctx.fillStyle = buildingLayerHex;
            ctx.globalAlpha = 0.25;
            ctx.fillRect(bx, by, bWidth, bHeight);
            ctx.globalAlpha = 1.0;
        }
    }
}

// Main Game Loop
function gameLoop(timestamp) {
    let dt = timestamp - lastTime;
    lastTime = timestamp;

    requestAnimationFrame(gameLoop);

    if (gameState === STATE.START || gameState === STATE.ENDING) {
        ctx.clearRect(0, 0, cw, ch);
        drawBackground();
        return;
    }

    if (gameState !== STATE.PLAYING) return;

    ctx.clearRect(0, 0, cw, ch);
    ctx.shadowBlur = 0; // Previne que sombras de textos flutuantes vazem para o próximo frame
    drawBackground();

    frameCount++;

    // Spawner
    if (frameCount % coinSpawnInterval === 0) {
        coinsArray.push(new Coin());
        // Sometimes spawn double if high upgrade
        if(gameData.upgrades[4] && Math.random() > 0.5) {
            setTimeout(() => coinsArray.push(new Coin()), 300);
        }
    }

    // Update Enities
    for (let i = particlesArray.length - 1; i >= 0; i--) {
        let p = particlesArray[i];
        p.update(dt);
        p.draw();
        if (p.life <= 0) particlesArray.splice(i, 1);
    }

    for (let i = coinsArray.length - 1; i >= 0; i--) {
        let c = coinsArray[i];
        c.update(dt);
        c.draw();
        if (c.x < -100) coinsArray.splice(i, 1);
    }

    // Player Handle
    player.update(dt);

    // Flowing Texts
    ctx.save();
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.life -= 0.02;
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 28px Outfit, Arial';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#000';
        ctx.fillText(ft.txt, ft.x, ft.y);
        ctx.globalAlpha = 1;
        
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
    ctx.restore();
}

// Initial setup
updateStats();
requestAnimationFrame(gameLoop);
