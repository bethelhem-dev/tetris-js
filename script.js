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
let dropInterval = 1000;
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
                // Draw main block
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                
                // Add a slight inner glow/highlight for 3D effect
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(x + offset.x + 0.1, y + offset.y + 0.1, 0.8, 0.8);

                // Add border/outline
                ctx.lineWidth = 0.05;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

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
    dropInterval = Math.max(100, 1000 - (player.level - 1) * 100);
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
    dropInterval = 1000;
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
