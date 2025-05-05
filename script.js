// Elements
const splash = document.getElementById('splash');
const startBtn = document.getElementById('start-btn');
const app = document.getElementById('app');
const uploadBtn = document.getElementById('upload-btn');
const inputFile = document.getElementById('image-input');
const clearBtn = document.getElementById('clear-btn');
const musicToggle = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');
const piecesContainer = document.getElementById('pieces-container');
const boardContainer = document.getElementById('board-container');

let solved = false;

// Audio elements
const moveSound  = document.getElementById('move-sound');
const placeSound = document.getElementById('place-sound');

function tryPlay(sound){
  if(!sound) return;
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}


const GRID = 4;
const TILE_SIZE = 100;

// Splash start
startBtn.addEventListener('click', () => {
  bgMusic.play();
  splash.classList.add('hidden');
  app.classList.remove('hidden');
});

// Music toggle
musicToggle.addEventListener('click', () => {
  if(bgMusic.paused) {
    bgMusic.play();
    musicToggle.querySelector('img').src = 'music_on.png';
  } else {
    bgMusic.pause();
    musicToggle.querySelector('img').src = 'music_off.png';
  }
});

// Upload button -> trigger file input
uploadBtn.addEventListener('click', () => inputFile.click());

// Clear
clearBtn.addEventListener('click', () => {
  inputFile.value = '';
  piecesContainer.innerHTML = '';
  boardContainer.innerHTML = '';
});

// Handle upload
inputFile.addEventListener('change', e => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => initPuzzle(ev.target.result);
  reader.readAsDataURL(file);
});

function initPuzzle(src) {
  piecesContainer.innerHTML = '';
  boardContainer.innerHTML = '';

  // Create board cells
  for(let i=0;i<GRID*GRID;i++){
    const cell = document.createElement('div');
    cell.dataset.pos = i;
    cell.addEventListener('dragover', e => e.preventDefault());
    cell.addEventListener('drop', e => {
      const idx = e.dataTransfer.getData('text');
      const piece = document.querySelector(`.piece[data-idx='${idx}']`);
      if(piece && !e.currentTarget.hasChildNodes()) {
        tryPlay(placeSound);
        piece.draggable = false;
        piece.style.width = '100%';
        piece.style.height = '100%';
        e.currentTarget.appendChild(piece);
        if(!solved && checkSolved()){ solved = true; celebrate(); }
        piece.classList.add('snapped');
        piece.addEventListener('animationend', () => piece.classList.remove('snapped'), {once:true});
      }
    });
    boardContainer.appendChild(cell);
  }

  // Load image & slice
  const img = new Image();
  img.onload = () => {
    const minD = Math.min(img.width, img.height);
    const cvs = document.createElement('canvas');
    cvs.width = TILE_SIZE*GRID;
    cvs.height = TILE_SIZE*GRID;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img,(img.width-minD)/2,(img.height-minD)/2,minD,minD,0,0,cvs.width,cvs.height);
    // create pieces
    let arr=[];
    for(let y=0;y<GRID;y++){
      for(let x=0;x<GRID;x++){
        let c = document.createElement('canvas');
        c.width=TILE_SIZE; c.height=TILE_SIZE;
        let ct=c.getContext('2d');
        ct.drawImage(cvs,x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE,TILE_SIZE,0,0,TILE_SIZE,TILE_SIZE);
        arr.push(c.toDataURL());
      }
    }
    // shuffle and render
    arr.sort(()=>Math.random()-0.5).forEach((src,i)=>{
      let d = document.createElement('div');
      d.classList.add('piece');
      d.dataset.idx = i;
      d.draggable = true;
      d.style.backgroundImage = `url(${src})`;
      d.addEventListener('dragstart', e => { e.dataTransfer.setData('text', e.target.dataset.idx); tryPlay(moveSound); });
      piecesContainer.appendChild(d);
    });
  };
  img.src = src;
}

// Override start button click to launch puzzle
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash');
  const app = document.getElementById('app');
  const start = document.getElementById('start-btn');
  start.addEventListener('click', () => {
    splash.style.display = 'none';
    app.style.display = 'block';
    initPuzzle('kabir_title.png');
  });
});

function checkSolved() {
  const cells = Array.from(boardContainer.children);
  return cells.every(cell => {
    if(!cell.firstChild) return false;
    return cell.dataset.pos === cell.firstChild.dataset.idx;
  });
}

function celebrate() {
  if(typeof confetti === 'function'){
    confetti({
      particleCount: 160,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}
