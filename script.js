const BLOCK_SIZE = 30;
const WIDTH_BLOCKS = 10;
const HEIGHT_BLOCKS = 20;
const BLOCKS_COUNT = WIDTH_BLOCKS * HEIGHT_BLOCKS;
const CANVAS_WIDTH = BLOCK_SIZE * WIDTH_BLOCKS;
const CANVAS_HEIGHT = BLOCK_SIZE * HEIGHT_BLOCKS;

const COLOR_WHITE = '#FFFFFF';
const COLOR_BLACK = '#000000';

const canvas = document.getElementById('canvas');
canvas.width = BLOCK_SIZE * WIDTH_BLOCKS;
canvas.height = BLOCK_SIZE * HEIGHT_BLOCKS;
const ctx = canvas.getContext('2d');

let ground = [];
let fallingBlock = [];

function generateFallingBlock() {
    fallingBlock = [[3,0],[4,0],[5,0],[6,0]];
}

const getBlockX = block => block[0];
const getBlockY = block => block[1];
const getBlockWidth = blocks => {
    const span = blocks.map(block => getBlockX(block));
    return Math.max(...span) - Math.min(...span);
}
const getBlockHeight = blocks => {
    const span = blocks.map(block => getBlockY(block));
    return Math.max(...span) - Math.min(...span);
}

const renderBlocks = blocks => blocks.forEach(block => {
    const xPix = getBlockX(block) * BLOCK_SIZE;
    const yPix = getBlockY(block) * BLOCK_SIZE;
    ctx.fillRect(xPix, yPix, BLOCK_SIZE, BLOCK_SIZE);
});

function renderAll() {
    // clear all
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // render blocks
    ctx.fillStyle = COLOR_BLACK;
    renderBlocks(ground);
    renderBlocks(fallingBlock);
}

const collidesWithGround = blocks =>
    blocks.reduce((prev, block) =>
        prev || (ground.findIndex(el => (el[0] == block[0] && el[1] == block[1])) > -1),
    false);
const reachedBottom = blocks => blocks.reduce((prev, block) => prev || (block[1] >= HEIGHT_BLOCKS-1), false);
const isSideRight = blocks => blocks.reduce((prev, block) => prev || (getBlockX(block) == WIDTH_BLOCKS-1), false);
const isSideLeft = blocks => blocks.reduce((prev, block) => prev || (getBlockX(block) == 0), false);
const moveLeft = blocks => blocks.map(block => [block[0] - 1, block[1]]);
const moveRight = blocks => blocks.map(block => [block[0] + 1, block[1]]);
const moveDown = blocks => blocks.map(block => [block[0], block[1] + 1]);
const rotate = blocks => {
    const minX = Math.min(...(blocks.map(block => getBlockX(block))));
    const minY = Math.min(...(blocks.map(block => getBlockY(block))));
    const width = getBlockWidth(blocks);
    const height = getBlockHeight(blocks);
    const translateX = -minX-width/2;
    const translateY = -minY-height/2;
    return blocks.map(pix => {
        const x = getBlockX(pix) + translateX;
        const y = getBlockY(pix) + translateY;
        const newX = -y - translateX;
        const newY = x - translateY;
        return [newX, newY];
    });
}

generateFallingBlock();
renderAll();
const mainLoop = setInterval(() => {
    if (reachedBottom(fallingBlock)) {
        console.log('reachedBottom');
        ground = [...ground, ...fallingBlock];
        generateFallingBlock();
    } else {
        const newFalling = moveDown(fallingBlock);
        if (collidesWithGround(newFalling)) {
            console.log('collides with ground')
            ground = [...ground, ...fallingBlock];
            generateFallingBlock();
            if (collidesWithGround(fallingBlock)) {
                alert('game over');
                clearInterval(mainLoop);
            }
        } else {
            console.log('next')
            fallingBlock = newFalling;
        }
    }
    renderAll();
}, 1000);

// keyboard
window.addEventListener('keydown', ev => {
    console.log('keydown', ev)
    let newBlock;
    switch (ev.key) {
        case 'ArrowRight':
            newBlock = moveRight(fallingBlock);
            if (!isSideRight(fallingBlock) && !collidesWithGround(newBlock)) {
                fallingBlock = newBlock;
                renderAll();
            }
            break;
        case 'ArrowLeft':
            newBlock = moveLeft(fallingBlock);
            if (!isSideLeft(fallingBlock) && !collidesWithGround(newBlock)) {
                fallingBlock = newBlock;
                renderAll();
            }
            break;
        case 'ArrowDown':
            newBlock = moveDown(fallingBlock);
            if (!reachedBottom(fallingBlock) && !collidesWithGround(newBlock)) {
                fallingBlock = newBlock;
                renderAll();
            }
    }
    if ('Space' == ev.code) {
        fallingBlock = rotate(fallingBlock);
        renderAll();
    }
});
