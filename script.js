const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');

context.scale(20, 20);
nextContext.scale(20, 20);

// Neon Colors
const colors = [
    null,
    '#FF0D72', // T - Magenta
    '#0DC2FF', // I - Cyan
    '#0DFF72', // S - Green
    '#F538FF', // Z - Purple
    '#FF8E0D', // L - Orange
    '#FFE138', // O - Yellow
    '#3877FF', // J - Blue
];

const pieces = 'ILJOTSZ';

// Game State
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    level: 1,
    lines: 0,
    next: null,
};

let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;
let isPaused = false;
let isGameOver = false;

const arena = createMatrix(12, 20);

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 2, 0, 0],
            [0, 2, 0, 0],
            [0, 2, 0, 0],
            [0, 2, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 5, 0],
            [0, 5, 0],
            [0, 5, 5],
        ];
    } else if (type === 'J') {
        return [
            [0, 7, 0],
            [0, 7, 0],
            [7, 7, 0],
        ];
    } else if (type === 'O') {
        return [
            [6, 6],
            [6, 6],
        ];
    } else if (type === 'Z') {
        return [
            [4, 4, 0],
            [0, 4, 4],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 3, 3],
            [3, 3, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset, ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const color = colors[value];
                const px = x + offset.x;
                const py = y + offset.y;

                // 1. Strong Outer Glow
                ctx.shadowBlur = 20;
                ctx.shadowColor = color;

                // 2. Main Block Fill (Slightly transparent for glass effect)
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.9;
                ctx.fillRect(px, py, 1, 1);
                ctx.globalAlpha = 1.0;

                // 3. Inner Highlight (Top-Left) for 3D/Glass look
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillRect(px, py, 1, 0.1); // Top edge
                ctx.fillRect(px, py, 0.1, 1); // Left edge
                
                // 4. Inner Shadow (Bottom-Right)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(px, py + 0.9, 1, 0.1); // Bottom edge
                ctx.fillRect(px + 0.9, py, 0.1, 1); // Right edge

                // Reset shadow
                ctx.shadowBlur = 0;
            }
        });
    });
}

// ... (keep existing game logic) ...

// Background Animation (Synthwave Grid + Falling Particles)
const bgCanvas = document.getElementById('bg-canvas');
const bgContext = bgCanvas.getContext('2d');

function resizeBg() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeBg);
resizeBg();

// Falling Pieces Logic
const bgPieces = [];
const bgPieceTypes = 'ILJOTSZ';

class BgPiece {
    constructor() {
        this.reset();
        this.y = Math.random() * bgCanvas.height;
    }

    reset() {
        this.x = Math.random() * bgCanvas.width;
        this.y = -50;
        this.speed = 0.5 + Math.random() * 2; // Slower, floaty feel
        this.size = 10 + Math.random() * 40;
        this.type = bgPieceTypes[Math.floor(Math.random() * bgPieceTypes.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.color = colors[pieces.indexOf(this.type) + 1];
        this.opacity = 0.1 + Math.random() * 0.4;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        if (this.y > bgCanvas.height + 50) {
            this.reset();
        }
    }

    draw() {
        bgContext.save();
        bgContext.translate(this.x, this.y);
        bgContext.rotate(this.rotation);
        bgContext.globalAlpha = this.opacity;
        
        // Neon Glow for background pieces
        bgContext.shadowBlur = 15;
        bgContext.shadowColor = this.color;
        bgContext.fillStyle = this.color;
        
        // Draw a simple square representing the piece
        bgContext.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        bgContext.restore();
    }
}

// Initialize background pieces
for (let i = 0; i < 15; i++) {
    bgPieces.push(new BgPiece());
}

let offset = 0;
const speed = 1; // Grid speed

function animateBg() {
    // 1. Clear Background
    bgContext.fillStyle = '#050510';
    bgContext.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    const w = bgCanvas.width;
    const h = bgCanvas.height;
    const horizon = h * 0.4;
    const gridGap = 40;

    // 2. Draw Synthwave Grid
    bgContext.save();
    bgContext.shadowBlur = 20;
    bgContext.shadowColor = '#bc13fe';
    bgContext.strokeStyle = 'rgba(188, 19, 254, 0.3)';
    bgContext.lineWidth = 2;
    bgContext.beginPath();

    // Vertical Lines
    const centerX = w / 2;
    for (let x = -w; x < w * 2; x += gridGap * 2) {
        bgContext.moveTo(x, h);
        bgContext.lineTo(centerX, horizon);
    }

    // Horizontal Lines
    offset = (offset + speed) % gridGap;
    for (let z = 0; z < h; z += gridGap) {
        const y = h - z + offset;
        if (y < horizon) continue;
        bgContext.moveTo(0, y);
        bgContext.lineTo(w, y);
    }
    bgContext.stroke();
    bgContext.restore();

    // 3. Draw Horizon Glow
    const gradient = bgContext.createRadialGradient(w/2, horizon, 10, w/2, horizon, 400);
    gradient.addColorStop(0, 'rgba(0, 243, 255, 0.15)');
    gradient.addColorStop(1, 'transparent');
    bgContext.fillStyle = gradient;
    bgContext.fillRect(0, 0, w, h);

    // 4. Draw Falling Neon Pieces
    bgPieces.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateBg);
}

animateBg();

function draw() {
    // Clear main canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0}, context);
    drawMatrix(player.matrix, player.pos, context);
}

function drawNext() {
    // Clear next canvas
    nextContext.fillStyle = '#00000000'; // Transparent
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (player.next) {
        // Center the piece in the 5x5 preview area
        const offsetX = (5 - player.next[0].length) / 2;
        const offsetY = (5 - player.next.length) / 2;
        drawMatrix(player.next, {x: offsetX, y: offsetY}, nextContext);
    }
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function playerReset() {
    if (player.next === null) {
        player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
    }
    player.matrix = player.next;
    player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
    drawNext();
    
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
                   
    if (collide(arena, player)) {
        gameOver();
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        player.lines += 1;
        rowCount *= 2;
    }
    
    // Level up every 10 lines
    player.level = Math.floor(player.lines / 10) + 1;
    // Faster speed curve: Start at 800ms, decrease by 100ms per level, min 50ms
    dropInterval = Math.max(50, 800 - (player.level - 1) * 100);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
    document.getElementById('level').innerText = player.level;
    document.getElementById('lines').innerText = player.lines;
}

function gameOver() {
    isGameOver = true;
    document.getElementById('final-score').innerText = player.score;
    document.getElementById('game-over-overlay').classList.add('active');
}

function resetGame() {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    player.lines = 0;
    player.level = 1;
    player.next = null;
    dropInterval = 800;
    updateScore();
    document.getElementById('game-over-overlay').classList.remove('active');
    isGameOver = false;
    isPaused = false;
    playerReset();
    update();
}

function togglePause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    const overlay = document.getElementById('pause-overlay');
    if (isPaused) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
        lastTime = 0; // Reset lastTime to prevent jump
        requestAnimationFrame(update);
    }
}

function update(time = 0) {
    if (isPaused || isGameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (isGameOver) return;

    if (event.keyCode === 37) { // Left
        playerMove(-1);
    } else if (event.keyCode === 39) { // Right
        playerMove(1);
    } else if (event.keyCode === 40) { // Down
        playerDrop();
    } else if (event.keyCode === 81) { // Q (Rotate Left)
        playerRotate(-1);
    } else if (event.keyCode === 87 || event.keyCode === 38) { // W or Up (Rotate Right)
        playerRotate(1);
    } else if (event.keyCode === 32) { // Space (Hard Drop)
        // Hard drop logic
        while (!collide(arena, player)) {
            player.pos.y++;
        }
        player.pos.y--; // Move back up one step
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        dropCounter = 0; // Reset drop counter
    } else if (event.keyCode === 80) { // P (Pause)
        togglePause();
    }
});

// Button Event Listeners
document.getElementById('restart-btn').addEventListener('click', resetGame);
document.getElementById('resume-btn').addEventListener('click', togglePause);

// Start game
playerReset();
update();


