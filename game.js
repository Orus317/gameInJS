const canvas = document.getElementById('game');
const game = canvas.getContext('2d');

// Getting the btns for movements
const upBtn = document.getElementById('up');
const downBtn = document.getElementById('down');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');

// Getting modal win window
const modalWin = document.querySelector('.modal-win-card');

// Getting btns for play again and exit game
const playAgainBtn = document.getElementById('winBtn') ;
const exitBtn = document.getElementById('exitBtn');  

// Global Position -> It'll be saved
class ElementPosition {
    constructor (x = undefined, y = undefined){
        this.xIndex = x;
        this.yIndex = y;
    }
    get xPos(){
        return this.xIndex*elementsSize;
    }
    get yPos(){
        return (this.yIndex+1)*elementsSize;
    }
}

//  bombs position array
const bombsPosition = [];

const playerPostion = new ElementPosition();
const giftPosition = new ElementPosition();

let elementsSize = undefined;
let canvasSize = undefined;


// Una vez que window renderice se ejecutará startGame
window.addEventListener('load', startGame);

window.addEventListener('resize', reSizeCanvas);
// window.onresize = (event) => console.log(event);

// Borra todo lo que tenga por dentro
function sizeCanvas() {
    canvasSize = Math.min(window.innerHeight, window.innerWidth)*.75;
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    // return canvasSize;
}

function reSizeCanvas() {
    canvasSize = Math.min(window.innerHeight, window.innerWidth)*.75;
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    renderMap(canvasSize);
}

function startGame() {
    sizeCanvas();
    renderMap(canvasSize);   
}

function renderMap() {
    let hardMap = maps[1];
    // separate the map template by new line character, then erase the first and last element ('cause they're blank elements), then trim to erase whitespaces and finally split each line into an array of characters
        // hardMap = hardMap.split('\n').slice(1,-1).map(el => el.trim()).map(el => el.split(''));
    //another way to achieve it is with regex
    hardMap = hardMap.match(/[IXO-]+/g).map(el=>el.split(''));
    elementsSize = (canvasSize / 10) - 1;
    game.font = elementsSize + 'px Verdana';
    game.textAlign = 'start';
    // game.textBaseLine= 'top';
    hardMap.forEach((row, i) => {
        row.forEach((item, j) => {
            const trItem = emojis[item];
            if (trItem === '🚪' && (playerPostion.xIndex === undefined && playerPostion.yIndex === undefined)){
                playerPostion.xIndex = j;
                playerPostion.yIndex = i;
            }else if (trItem == '🎁') {
                giftPosition.xIndex = j;
                giftPosition.yIndex = i;
            }else if (trItem === '💣') {
                bombsPosition.push(new ElementPosition(j, i))
            }
            game.fillText( trItem, elementsSize*j, elementsSize*(i+1));
        });
    });
    game.fillText(emojis['PLAYER'], playerPostion.xPos,playerPostion.yPos);
}

// Movements for keys
upBtn.addEventListener('click', () => move('ArrowUp'));
downBtn.addEventListener('click', () => move('ArrowDown'));
leftBtn.addEventListener('click', () => move('ArrowLeft'));
rightBtn.addEventListener('click', () => move('ArrowRight'));
// Movements for keyboard keys
window.addEventListener('keydown', ({key}) => move(key));
// Movements functions
function move(key){
    switch (key) {
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
            moveUp();
            break;
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        default:
            console.log("Another key");
            break;
    }
}

function moveUp() {
    playerPostion.yIndex -= 1;
    if (playerPostion.yIndex < 0) 
        playerPostion.yIndex = 0;
    movePlayer();
}
function moveDown() {
    playerPostion.yIndex += 1;
    if (playerPostion.yIndex > 9) 
        playerPostion.yIndex = 9;
    movePlayer();
}
function moveLeft() {
    playerPostion.xIndex -= 1;
    if (playerPostion.xIndex < 0)
        playerPostion.xIndex = 0;
    movePlayer();
}
function moveRight() {
    playerPostion.xIndex += 1;
    if (playerPostion.xIndex > 9) 
        playerPostion.xIndex = 9;
    movePlayer();
}

function movePlayer(restart = false){
    if (!restart){
        if((playerPostion.xIndex === giftPosition.xIndex) && (playerPostion.yIndex === giftPosition.yIndex)){
            modalWin.children[0].children[0].innerText = 'Ganaste!';
            modalWin.classList.remove('inactive');
        } else if (verifyBomb()){
            modalWin.children[0].children[0].innerText = 'Perdiste!';
            modalWin.classList.remove('inactive');
        }
    }
    game.clearRect(0,0,canvasSize,canvasSize);
    renderMap(false);
}

function verifyBomb() {
    const res = bombsPosition.some(bombPos => {
        if((bombPos.xIndex === playerPostion.xIndex) && (bombPos.yIndex === playerPostion.yIndex)){
            // Execute the transform to another char 
            game.fillText('ssss', bombPos.xPos, bombPos.yPos);
            // Reset player position
            playerPostion.xPos = 0;
            playerPostion.yPos = 0;
            movePlayer(true);
            return true;
        }
    });

    return res;
}

function closeModal(){
    modalWin.classList.toggle('inactive');
}