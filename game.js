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
const btnAlert = document.getElementById('btn-alert');
const btnPause = document.getElementById('btn-pause');
const btnResume = document.getElementById('btn-resume');
const btnRestartAction = document.getElementById('btn-restart-action');
const btnToggleLang = document.getElementById('btn-toggle-lang');
const btnDevMode = document.getElementById('btn-dev-mode');
const btnBuys = document.querySelectorAll('.btn-buy');

const uiMinigame = document.getElementById('screen-minigame');
const uiPause = document.getElementById('screen-pause');
const elMinigameContent = document.getElementById('minigame-content');

// Game State Enum
const STATE = {
    START: 0,
    PLAYING: 1,
    UPGRADE: 2,
    ENDING: 3,
    MINIGAME: 4,
    PAUSE: 5
};

let gameState = STATE.START;
let gameData = {
    coins: 0,
    upgrades: { 1: false, 2: false, 3: false, 4: false, 5: false },
    lang: 'pt',
    dev: false
};

// Local storage init
const STORAGE_KEY = 'EcoDriveSaveData_v1';
const localSave = localStorage.getItem(STORAGE_KEY);
if (localSave) {
    try {
        const parsed = JSON.parse(localSave);
        if (typeof parsed.coins === 'number') gameData.coins = parsed.coins;
        if (parsed.upgrades) gameData.upgrades = parsed.upgrades;
        if (parsed.lang) gameData.lang = parsed.lang;
        if (typeof parsed.dev === 'boolean') gameData.dev = parsed.dev;
    } catch(e) {
        console.error("Failed to parse save", e);
    }
}

const I18N = {
    pt: {
        title: "EcoDrive 🚗",
        start_desc: "Sua missão é transformar este carro antigo e altamente poluente em um modelo sustentável.",
        start_instr: "Clique nas moedas para coletá-las e use a oficina!",
        btn_start: "Começar a Limpar o Mundo",
        workshop: "Oficina",
        workshop_title: "Oficina Sustentável",
        sus_text: "Sustentabilidade",
        alert: "ALERTA!",
        pause_title: "Jogo Pausado",
        btn_resume: "Continuar",
        btn_restart: "Reiniciar",
        btn_lang: "🌍 Idioma: Português",
        up1_name: "Filtro de Escapamento",
        up1_desc: "A fumaça preta diminui. Moedas surgem +20% mais rápido.",
        up2_name: "Pneus Ecológicos",
        up2_desc: "O som e rodagem melhoram. Moedas valem em dobro (x2).",
        up5_name: "Materiais Sustentáveis",
        up5_desc: "Uso de bioplásticos e tecidos reciclados. Moedas valem em dobro (x2 acumulativo).",
        up3_name: "Motor Híbrido",
        up3_desc: "Visual moderno e pouca fumaça. Moedas surgem +50% mais rápido.",
        up4_name: "Bateria 100% Elétrica 🔋",
        up4_desc: "O nível máximo de sustentabilidade. O mundo agradece!",
        btn_back: "Voltar ao Jogo",
        victory: "Vitória! ⚡",
        victory_desc: "Parabéns! Você ajudou a construir um futuro sustentável!",
        victory_subdesc: "A cidade está limpa, o ar puro e seu carro é 100% elétrico.",
        btn_play_again: "Jogar Novamente",
        alert_bonus: "BÔNUS!",
        trash_title: "Separe o Lixo!",
        trash_desc: "Coloque o item na lixeira correta para reciclar.",
        paper: "Papel",
        plastic: "Plástico",
        plant_title: "Plante uma Árvore",
        plant_desc: "Clique na área de terra para realizar as etapas.",
        plant_step1: "ETAPA 1: Cavar Buraco 🕳️",
        plant_step2: "ETAPA 2: Colocar Semente 🌱",
        plant_step3: "ETAPA 3: Regar 💧",
        plant_done: "CONCLUÍDO! ✨",
        quiz_title: "Desafio Eco-Conhecimento",
        choice_title: "Escolha Sustentável",
        lang_toggle_label: "🌍 Idioma: Português"
    },
    en: {
        title: "EcoDrive 🚗",
        start_desc: "Your mission is to transform this old and highly polluting car into a sustainable model.",
        start_instr: "Click on coins to collect them and use the workshop!",
        btn_start: "Start Cleaning the World",
        workshop: "Workshop",
        workshop_title: "Sustainable Workshop",
        sus_text: "Sustainability",
        alert: "ALERT!",
        pause_title: "Game Paused",
        btn_resume: "Resume",
        btn_restart: "Restart",
        btn_lang: "🌍 Language: English",
        up1_name: "Exhaust Filter",
        up1_desc: "Black smoke decreases. Coins appear +20% faster.",
        up2_name: "Eco-Friendly Tires",
        up2_desc: "Sound and rolling improve. Coins are worth double (x2).",
        up5_name: "Sustainable Materials",
        up5_desc: "Use of bioplastics and recycled fabrics. Coins are worth double (x2 cumulative).",
        up3_name: "Hybrid Engine",
        up3_desc: "Modern look and little smoke. Coins appear +50% faster.",
        up4_name: "100% Electric Battery 🔋",
        up4_desc: "The maximum level of sustainability. The world thanks you!",
        btn_back: "Back to Game",
        victory: "Victory! ⚡",
        victory_desc: "Congratulations! You helped build a sustainable future!",
        victory_subdesc: "The city is clean, the air is pure, and your car is 100% electric.",
        btn_play_again: "Play Again",
        alert_bonus: "BONUS!",
        trash_title: "Sort the Waste!",
        trash_desc: "Put the item in the correct bin to recycle.",
        paper: "Paper",
        plastic: "Plastic",
        plant_title: "Plant a Tree",
        plant_desc: "Click on the dirt area to perform the steps.",
        plant_step1: "STEP 1: Dig Hole 🕳️",
        plant_step2: "STEP 2: Place Seed 🌱",
        plant_step3: "STEP 3: Water 💧",
        plant_done: "DONE! ✨",
        quiz_title: "Eco-Knowledge Challenge",
        choice_title: "Sustainable Choice",
        lang_toggle_label: "🌍 Language: English"
    }
};

function updateLanguage() {
    const lang = gameData.lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[lang][key]) {
            el.innerHTML = I18N[lang][key];
        }
    });
    btnToggleLang.innerText = I18N[lang].lang_toggle_label;
}

let currentSus = 0;
let lastSus = 0;
let alertActive = false;
let currentMinigame = null;

let bgOffset = 0;
let bgSpeed = 3;
let coinsArray = [];
let particlesArray = [];
let frameCount = 0;
let lastTime = 0;
let coinMultiplier = 1;
let coinSpawnInterval = 100;

// Background Collections
let cloudsArray = [];
let treesArray = [];
let housesArray = [];

class Cloud {
    constructor() {
        this.x = cw + Math.random() * cw;
        this.y = Math.random() * ch * 0.3;
        this.size = 50 + Math.random() * 60;
        this.speed = bgSpeed * 0.2 + Math.random() * 0.5;
    }
    update() {
        this.x -= this.speed;
        if (this.x < -this.size * 2) {
            this.x = cw + this.size;
            this.y = Math.random() * ch * 0.3;
        }
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 0.3, this.y - this.size * 0.2, this.size * 0.4, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 0.3, this.y + this.size * 0.2, this.size * 0.4, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 0.6, this.y, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Tree {
    constructor(x) {
        this.x = x || cw + Math.random() * 100;
        this.y = ch - ch * 0.2;
        this.type = Math.random() > 0.5 ? 'round' : 'pine';
    }
    update() {
        this.x -= bgSpeed;
        if (this.x < -100) this.x = cw + 100 + Math.random() * 200;
    }
    draw() {
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(this.x - 5, this.y - 40, 10, 40);
        ctx.fillStyle = gameData.upgrades[4] ? '#2e7d32' : '#4caf50';
        if (this.type === 'pine') {
            ctx.beginPath();
            ctx.moveTo(this.x - 30, this.y - 40);
            ctx.lineTo(this.x + 30, this.y - 40);
            ctx.lineTo(this.x, this.y - 90);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y - 60, 35, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class House {
    constructor(x) {
        this.x = x || cw + Math.random() * 100;
        this.y = ch - ch * 0.2;
    }
    update() {
        this.x -= bgSpeed;
        if (this.x < -150) this.x = cw + 200 + Math.random() * 400;
    }
    draw() {
        ctx.fillStyle = '#cfd8dc';
        ctx.fillRect(this.x - 40, this.y - 50, 80, 50);
        ctx.fillStyle = '#ef5350';
        ctx.beginPath();
        ctx.moveTo(this.x - 50, this.y - 50);
        ctx.lineTo(this.x + 50, this.y - 50);
        ctx.lineTo(this.x, this.y - 80);
        ctx.fill();
        // Door
        ctx.fillStyle = '#795548';
        ctx.fillRect(this.x - 10, this.y - 20, 20, 20);
    }
}

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

    // Dynamic Background Elements Density
    let targetTrees = currentSus >= 20 ? (currentSus / 5) : 0;
    let targetHouses = currentSus >= 40 ? (currentSus - 20) / 10 : 0;
    let targetClouds = currentSus >= 20 ? (currentSus / 10) : 0;

    while(treesArray.length < targetTrees) treesArray.push(new Tree(cw + Math.random() * cw));
    while(housesArray.length < targetHouses) housesArray.push(new House(cw + Math.random() * cw));
    while(cloudsArray.length < targetClouds) cloudsArray.push(new Cloud());

    updateHUD();
    updateWorkshopUI();
}

function updateHUD() {
    elCoinCount.innerText = gameData.dev ? '∞' : Math.floor(gameData.coins);
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
            if (gameData.dev || gameData.coins >= cost) {
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

// --- Minigame System ---
const MINIGAMES = {
    TRASH: 1,
    PLANT: 2,
    QUIZ: 3,
    CHOICE: 4
};

function triggerMinigameAlert() {
    if (alertActive) return;
    alertActive = true;
    btnAlert.classList.remove('hidden');
}

let currentReward = 100;

function startMinigame(type, reward = 100) {
    currentReward = reward;
    gameState = STATE.MINIGAME;
    uiMinigame.classList.remove('hidden');
    uiHud.classList.add('hidden');
    elMinigameContent.innerHTML = '';
    
    switch(type) {
        case MINIGAMES.TRASH: setupTrashGame(); break;
        case MINIGAMES.PLANT: setupPlantGame(); break;
        case MINIGAMES.QUIZ: setupQuizGame(); break;
        case MINIGAMES.CHOICE: setupChoiceGame(); break;
    }
}

function completeMinigame() {
    gameState = STATE.PLAYING;
    uiMinigame.classList.add('hidden');
    uiHud.classList.remove('hidden');
    alertActive = false;
    btnAlert.classList.add('hidden');
    
    gameData.coins += currentReward; 
    createFloatingText("+" + currentReward + "🪙 BÔNUS!", cw/2, ch/2, '#4caf50');
    saveGame();
    updateHUD();
}

function setupTrashGame() {
    const lang = gameData.lang;
    elMinigameContent.innerHTML = `
        <h2 class="mg-title">${I18N[lang].trash_title}</h2>
        <p class="mg-description">${I18N[lang].trash_desc}</p>
        <div id="trash-item" class="trash-item">📦</div>
        <div class="sort-container">
            <div class="bin" onclick="checkTrash('📦', 'paper')">
                <span class="bin-icon">📄</span>
                <span class="bin-label">${I18N[lang].paper}</span>
            </div>
            <div class="bin" onclick="checkTrash('📦', 'plastic')">
                <span class="bin-icon">🥤</span>
                <span class="bin-label">${I18N[lang].plastic}</span>
            </div>
        </div>
    `;
}

function checkTrash(item, type) {
    // Para simplificar a interação direta por onclick no HTML injetado:
    completeMinigame();
}

function setupPlantGame() {
    const lang = gameData.lang;
    elMinigameContent.innerHTML = `
        <h2 class="mg-title">${I18N[lang].plant_title}</h2>
        <p class="mg-description">${I18N[lang].plant_desc}</p>
        <div class="garden-area" id="garden">
            <div id="hole-visual" class="hole hidden"></div>
            <div id="seed-visual" class="seed-anim hidden">🌱</div>
            <div id="plant-visual" class="plant-anim hidden">🌳</div>
        </div>
        <div id="garden-instruction" style="font-weight:bold; font-size:1.2rem; color: #fcd34d;">${I18N[lang].plant_step1}</div>
    `;
    let stage = 0;
    const g = document.getElementById('garden');
    const hole = document.getElementById('hole-visual');
    const seed = document.getElementById('seed-visual');
    const plant = document.getElementById('plant-visual');
    const inst = document.getElementById('garden-instruction');

    g.onclick = () => {
        stage++;
        if(stage == 1) {
            hole.classList.remove('hidden');
            inst.innerHTML = I18N[lang].plant_step2;
        } else if(stage == 2) {
            seed.classList.remove('hidden');
            inst.innerHTML = I18N[lang].plant_step3;
        } else if(stage == 3) {
            inst.innerHTML = I18N[lang].plant_done;
            seed.classList.add('hidden');
            plant.classList.remove('hidden');
            setTimeout(completeMinigame, 1500);
        }
    };
}

function setupQuizGame() {
    const questions = [
        { q: "Qual fonte de energia é mais limpa?", o: ["Carvão", "Energia Solar", "Petróleo"], a: 1 },
        { q: "O que significa Reciclar?", o: ["Jogar fora", "Reutilizar material", "Queimar lixo"], a: 1 },
        { q: "Qual desses economiza mais água?", o: ["Banho demorado", "Fechar a torneira", "Lavar calçada"], a: 1 },
        { q: "O CO2 é um gás de...", o: ["Efeito Estufa", "Respiração", "Cozinha"], a: 0 },
        { q: "Carros elétricos emitem...", o: ["Muita fumaça", "Zero emissão local", "Óleo diesel"], a: 1 },
        { q: "Papel vem de onde?", o: ["Plástico", "Árvores", "Pedras"], a: 1 },
        { q: "Qual cor representa o plástico na reciclagem?", o: ["Verde", "Vermelho", "Amarelo"], a: 1 },
        { q: "Lixo orgânico serve para...", o: ["Fazer adubo", "Fazer metal", "Nada"], a: 0 },
        { q: "Preservar a natureza é...", o: ["Bebê-la", "Cuidar dela", "Ignorá-la"], a: 1 }
    ];
    let selected = questions.sort(() => 0.5 - Math.random()).slice(0, 3);
    let currentQ = 0;

    const renderQ = () => {
        const lang = gameData.lang;
        let q = selected[currentQ];
        elMinigameContent.innerHTML = `
            <h2 class="mg-title">${I18N[lang].quiz_title}</h2>
            <p class="mg-description">${currentQ + 1} / 3</p>
            <p><strong>${q.q}</strong></p>
            <div class="quiz-options">
                ${q.o.map((opt, i) => `<div class="quiz-opt" onclick="window.answerQuiz(${i})">${opt}</div>`).join('')}
            </div>
        `;
    };

    window.answerQuiz = (idx) => {
        if(idx === selected[currentQ].a) {
            currentQ++;
            if(currentQ >= 3) completeMinigame();
            else renderQ();
        } else {
            alert("Tente novamente!");
        }
    };
    renderQ();
}

function setupChoiceGame() {
    const choicesPool = [
        { q: "Qual o transporte mais sustentável?", o: [{t:"🚗 Carro", s:false}, {t:"🚲 Bicicleta", s:true}] },
        { q: "Para carregar compras use:", o: [{t:"🍀 Ecobag", s:true}, {t:"🛍️ Sacola Plástica", s:false}] },
        { q: "Qual lâmpada economiza mais?", o: [{t:"💡 Incandescente", s:false}, {t:"⚡ LED", s:true}] },
        { q: "Melhor forma de lavar o carro:", o: [{t:"🚿 Mangueira", s:false}, {t:"🪣 Balde", s:true}] },
        { q: "Ao sair do quarto:", o: [{t:"🕯️ Apagar a luz", s:true}, {t:"🔆 Deixar ligada", s:false}] },
        { q: "Onde descartar pilhas?", o: [{t:"🗑️ Lixo comum", s:false}, {t:"🔋 Coleta seletiva", s:true}] },
        { q: "Qual o banho mais eco-amigável?", o: [{t:"⏳ Banho rápido", s:true}, {t:"🛀 Banheira cheia", s:false}] },
        { q: "Melhor material para garrafas:", o: [{t:"🥤 Plástico", s:false}, {t:"🍼 Vidro/Alumínio", s:true}] },
        { q: "Documentos e boletos:", o: [{t:"📧 Digital", s:true}, {t:"📄 Impresso", s:false}] }
    ];

    let selected = choicesPool.sort(() => 0.5 - Math.random()).slice(0, 3);
    let currentC = 0;

    const renderC = () => {
        const lang = gameData.lang;
        let c = selected[currentC];
        elMinigameContent.innerHTML = `
            <h2 class="mg-title">${I18N[lang].choice_title}</h2>
            <p class="mg-description">${currentC + 1} / 3</p>
            <p><strong>${c.q}</strong></p>
            <div class="quiz-options">
                ${c.o.map((opt, i) => `<div class="quiz-opt" onclick="window.pickChoice(${opt.s})">${opt.t}</div>`).join('')}
            </div>
        `;
    };

    window.pickChoice = (isSus) => {
        if(isSus) {
            currentC++;
            if(currentC >= 3) completeMinigame();
            else renderC();
        } else {
            alert("Essa opção prejudica o planeta! Tente a outra.");
        }
    };
    renderC();
}

let pendingMinigame = null;

// Event Listeners
btnAlert.addEventListener('click', () => {
    if (!pendingMinigame) return;

    let mgType = 0;
    if (pendingMinigame == 1) mgType = MINIGAMES.TRASH;
    else if (pendingMinigame == 2) mgType = MINIGAMES.PLANT;
    else if (pendingMinigame == 5) mgType = MINIGAMES.QUIZ;
    else if (pendingMinigame == 3) mgType = MINIGAMES.CHOICE;
    
    if (mgType > 0) {
        let reward = (pendingMinigame == 1) ? 50 : 100;
        startMinigame(mgType, reward);
        pendingMinigame = null;
    }
});

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

btnToggleLang.addEventListener('click', () => {
    gameData.lang = gameData.lang === 'pt' ? 'en' : 'pt';
    saveGame();
    updateLanguage();
});

btnPause.addEventListener('click', () => {
    if (gameState === STATE.PLAYING) {
        gameState = STATE.PAUSE;
        uiPause.classList.remove('hidden');
    }
});

btnResume.addEventListener('click', () => {
    if (gameState === STATE.PAUSE) {
        gameState = STATE.PLAYING;
        uiPause.classList.add('hidden');
    }
});

function resetGame() {
    gameData.coins = 0;
    gameData.upgrades = { 1: false, 2: false, 3: false, 4: false, 5: false };
    saveGame();
    
    // Reset visual state
    gameState = STATE.START;
    uiPause.classList.add('hidden');
    uiWorkshop.classList.add('hidden');
    uiEnding.classList.add('hidden');
    uiHud.classList.add('hidden');
    uiStart.classList.remove('hidden');
    
    coinsArray = [];
    particlesArray = [];
    cloudsArray = [];
    treesArray = [];
    housesArray = [];
    alertActive = false;
    btnAlert.classList.add('hidden');
    
    player = new Car();
    updateStats();
    updateLanguage();
    
    btnDevMode.classList.toggle('active', gameData.dev);
    btnDevMode.innerText = `🛠️ DEV: ${gameData.dev ? 'ON' : 'OFF'}`;
}

btnRestartAction.addEventListener('click', resetGame);
btnRestart.addEventListener('click', resetGame);

btnDevMode.addEventListener('click', () => {
    gameData.dev = !gameData.dev;
    btnDevMode.classList.toggle('active', gameData.dev);
    btnDevMode.innerText = `🛠️ DEV: ${gameData.dev ? 'ON' : 'OFF'}`;
    saveGame();
    updateHUD();
    updateWorkshopUI();
});

btnBuys.forEach(btn => {
    btn.addEventListener('click', () => {
        let id = btn.dataset.id;
        let cost = parseInt(btn.dataset.cost);
        
        if (!gameData.upgrades[id] && (gameData.dev || gameData.coins >= cost)) {
            if (!gameData.dev) gameData.coins -= cost;
            gameData.upgrades[id] = true;
            saveGame();
            updateStats();
            updateWorkshopUI();
            checkEnding();

            // Trigger Alert after some time
            if (id != "4") {
                pendingMinigame = id;
                setTimeout(() => {
                    triggerMinigameAlert();
                }, 8000 + Math.random() * 5000); 
            }
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
    ctx.globalAlpha = 1.0;
    let groundColor = gameData.upgrades[4] ? '#43a047' : (gameData.upgrades[3] ? '#66bb6a' : (gameData.upgrades[1] ? '#8d6e63' : '#5d4037'));
    
    // Draw Sky Background (Canvas clearing handles part of it, but maybe we want a dedicated sky color?)
    // The CSS gradients already handle the sky.

    // Draw Clouds
    cloudsArray.forEach(c => {
        c.update();
        c.draw();
    });

    // Draw Ground
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, ch - ch*0.2, cw, ch*0.2);

    // Draw Road
    ctx.fillStyle = '#455a64';
    ctx.fillRect(0, ch - ch*0.18, cw, 100);
    
    // Road Lines
    ctx.strokeStyle = '#ffd54f';
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = -bgOffset;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, ch - ch*0.18 + 50);
    ctx.lineTo(cw, ch - ch*0.18 + 50);
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // Background Elements
    housesArray.forEach(h => {
        h.update();
        h.draw();
    });
    
    treesArray.forEach(t => {
        t.update();
        t.draw();
    });

    // City Layer Parallax (Distant)
    bgOffset -= bgSpeed * 0.4;
    if (bgOffset <= -cw) bgOffset = 0;
    
    // ... (rest of building logic is fine as distant layer)
    for(let w=0; w<2; w++) {
        for(let i=0; i<15; i++) {
            let bWidth = 80 + (i * 25) % 60;
            let bHeight = 150 + (i * 40) % 250;
            let bx = w * cw + i * 140 + bgOffset;
            let by = ch - ch*0.2 - bHeight;
            
            let buildingLayerHex = gameData.upgrades[4] ? '#1565c0' : (gameData.upgrades[2] ? '#3949ab' : '#263238');
            ctx.fillStyle = buildingLayerHex;
            ctx.globalAlpha = 0.15;
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

    if (gameState !== STATE.PLAYING && gameState !== STATE.UPGRADE && gameState !== STATE.PAUSE) return;

    if (gameState === STATE.PAUSE) {
        // Just keep drawing last frame or static bg
        ctx.clearRect(0, 0, cw, ch);
        drawBackground();
        player.draw();
        return;
    }

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
updateLanguage();
requestAnimationFrame(gameLoop);
