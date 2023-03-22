const canvas = document.getElementById('game');
const game = canvas.getContext('2d');
let level = 0;
let hardMap = undefined;
let lives = 3;
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

// Getting HTML lives container
const livesText = document.querySelector('.lives-container').children[0];

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

class PlayerPosition extends ElementPosition{
    restartPosition(){
        this.xIndex = undefined;
        this.yIndex = undefined;
    }
}

class BombPosition extends ElementPosition{
    transformToExplosion(){
        hardMap[this.yIndex][this.xIndex] = 'BOMB_COLLISION';
    }
}

//  bombs position array
let bombsPosition = [];

const playerPostion = new PlayerPosition();
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
}

function reSizeCanvas() {
    canvasSize = Math.min(window.innerHeight, window.innerWidth)*.75;
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    renderMap();
}

function startGame() {
    sizeCanvas();
    renderMap();
}

function renderMap() {
    bombsPosition.length = 0;
    hardMap = hardMap === undefined ? maps[level] : hardMap;
    livesText.innerText = livesText.innerText === ''
        ? '💓💓💓'
        : livesText.innerText;
    // separate the map template by new line character, then erase the first and last element ('cause they're blank elements), then trim to erase whitespaces and finally split each line into an array of characters
        // hardMap = hardMap.split('\n').slice(1,-1).map(el => el.trim()).map(el => el.split(''));
    //another way to achieve it is with regex
    if (typeof hardMap === 'string') {
        hardMap = hardMap.match(/[IXO-]+/g).map(el=>el.split(''));
    }
    elementsSize = (canvasSize / 10) - 1;
    game.font = elementsSize + 'px Verdana';
    game.textAlign = 'start';
    try {
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
                    bombsPosition.push(new BombPosition(j, i))
                }
                game.fillText(trItem, elementsSize*j, elementsSize*(i+1));
            });
        });
    } catch (TypeError) {
        console.log('Ganaste!');
        // winModal()
    }
    game.fillText(emojis['PLAYER'], playerPostion.xPos, playerPostion.yPos);
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
    // If there are no more lives none key will work to move the player
    if (lives > 0)
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
            // when the player wins
            level += 1;
            lives = 3;
            livesText.innerText = '';
            hardMap = undefined;
            modalWin.children[0].children[0].innerText = 'Ganaste!';
            modalWin.classList.remove('inactive');
        } else if (verifyBomb() && lives === 0){
            // when the player loses
            gameOver();
            modalWin.children[0].children[0].innerText = 'Perdiste!';
            modalWin.classList.remove('inactive');
        }
    }
    game.clearRect(0,0,canvasSize,canvasSize);
    renderMap();
}

function verifyBomb() {
    return bombsPosition.some(bombPos => {
        if((bombPos.xIndex === playerPostion.xIndex) && (bombPos.yIndex === playerPostion.yIndex)){
            // Execute the transform to another char 
            bombPos.transformToExplosion();
            playerPostion.restartPosition();
            movePlayer(restart=true);
            restLives();
            return true;
        }
    });
}

function restLives() {
    lives -= 1;
    livesText.innerText = `${'💓'.repeat(lives)}${'💔'.repeat(3-lives)}`;
}
function closeModal(){
    modalWin.classList.toggle('inactive');
}

function gameOver() {
    bombsPosition.map(bomb => bomb.transformToExplosion());
    movePlayer(true)
}