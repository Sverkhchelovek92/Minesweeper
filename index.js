const board = document.querySelector(".board");
const flagsDisplay = document.querySelector(".flags_count");
const resultsDisplay = document.querySelector(".results_display");

let bombsCount = 10;

const timerDisplay = document.querySelector(".timer");

const flagIcon = `<img src="flag.svg" width="21">`;
const bombIcon = `<img src="bomb.svg" width="21">`;

const squares = [];

// Таймер
let timer = null;
let startTime = 0;
let elapsedTime = 0;

let paused = true;

let intervalId;

let hrs = 0;
let mins = 0;
let secs = 0;

const timerGo = () => {
  if (paused) {
    paused = false;
    startTime = Date.now() - elapsedTime;
    timer = setInterval(updateTime, 10);
  }
};

function updateTime() {
  const currentTime = Date.now();
  elapsedTime = currentTime - startTime;

  secs = Math.floor((elapsedTime / 1000) % 60);
  mins = Math.floor((elapsedTime / (1000 * 60)) % 60);

  secs = pad(secs);
  mins = pad(mins);

  timerDisplay.textContent = `${mins}:${secs}`;

  function pad(unit) {
    return ("0" + unit).length > 2 ? unit : "0" + unit;
  }
}

timerGo();

// Creating Game Board

const bombsArray = Array(bombsCount).fill("bomb");
const emptyArray = Array(80 - bombsCount).fill("empty");
const fullArray = emptyArray.concat(bombsArray);
const finalArray = fullArray.sort(() => Math.random() - 0.5);

const createBombArray = (arr) => {
  const bombArr = [];
  let idx = arr.indexOf("bomb");
  while (idx !== -1) {
    bombArr.push(idx);
    idx = arr.indexOf("bomb", idx + 1);
  }
  return bombArr;
};

const bombArray = createBombArray(finalArray);

const createNeighboursBombArray = (arr1, arr2) => {
  const bombsArr = [...new Set(arr1)].filter((item) => arr2.includes(item));
  return bombsArr;
};

const leftIds = [0, 8, 16, 24, 32, 40, 48, 56, 64, 72];
const rightIds = [7, 15, 23, 31, 39, 47, 55, 63, 71, 79];

const countMines = (id, arr) => {
  let squareId = Number(id);
  const squaresIdsArray = [
    squareId - 9,
    squareId - 8,
    squareId - 7,
    squareId - 1,
    squareId + 1,
    squareId + 7,
    squareId + 8,
    squareId + 9,
  ];

  const createNeighboursArray = (id) => {
    let neighboursTilesArray = squaresIdsArray.filter(
      (num) => num >= 0 && num <= 79
    );

    if (leftIds.includes(id)) {
      // console.log("left row");
      neighboursTilesArray = neighboursTilesArray.filter(
        (num) => !rightIds.includes(num)
      );
      return neighboursTilesArray;
    } else if (rightIds.includes(id)) {
      // console.log("right row");
      neighboursTilesArray = neighboursTilesArray.filter(
        (num) => !leftIds.includes(num)
      );
      return neighboursTilesArray;
    } else {
      return neighboursTilesArray;
    }
  };

  const neighboursIds = createNeighboursArray(squareId);

  const bombsId = createBombArray(arr);

  const neighbourBombs = createNeighboursBombArray(bombsId, neighboursIds);
  // console.log(neighbourBombs);

  const bombsAround = neighbourBombs.length;
  // console.log(bombsAround);
  return bombsAround;
};

/// Function to create board

const createBoard = (arr) => {
  flagsDisplay.innerHTML = bombsCount;

  for (let i = 0; i < 80; i++) {
    const square = document.createElement("button");
    square.classList = "field_square";
    square.id = i;
    square.classList.add(arr[i]);
    board.appendChild(square);
    squares.push(square);
    console.log(squares);

    square.addEventListener("click", () => {
      clickBomb(square);
    });

    square.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      markBomb(square);
      if (revealedBombsCount === 80 - bombsCount) {
        gameWin();
      }
    });
  }

  console.log(squares);

  // Place countmines function here?!
  for (let i = 0; i < squares.length; i++) {
    let total = countMines(i, finalArray);

    squares[i].setAttribute("data", total);
  }
};

createBoard(finalArray);

console.log(bombArray);

// Click and Mark

const clickBomb = (square) => {
  square.classList.add("revealed");
  let revealedBombsCount = document.querySelectorAll(".revealed").length;
  console.log(revealedBombsCount);
  console.log(typeof revealedBombsCount);
  let squareId = square.id;
  console.log(squareId);
  let minesNum = countMines(squareId, finalArray);

  if (square.classList.contains("marked")) {
    return;
  } else if (square.classList.contains("bomb")) {
    square.innerHTML = bombIcon;
    square.classList.remove("bomb");
    square.classList.add("bomb_exploaded");
    gameOver();
  } else if (revealedBombsCount === 70) {
    revealSquare(square, minesNum);
    gameWin();
  } else {
    console.log(minesNum);

    revealSquare(square, minesNum);
  }
  console.log(square);
  console.log(countMines(square.id, finalArray));
};

const markBomb = (square) => {
  if (square.classList.contains("marked")) {
    square.classList.remove("marked");
    square.innerHTML = "";
    bombsCount += 1;
    flagsDisplay.innerHTML = bombsCount;
  } else {
    square.innerHTML = flagIcon;
    square.classList.add("marked");
    bombsCount -= 1;
    flagsDisplay.innerHTML = bombsCount;
  }
};

const gameOver = () => {
  resultsDisplay.innerHTML = `<h2 class="gameover-state">YOU LOST!</h2>`;
  resultsDisplay.innerHTML += `<button class="again-btn">Play Again?</button>`;
  const againBtn = document.querySelector(".again-btn");
  board.classList.add("disabled");
  revealBombs();
  againBtn.addEventListener("click", () => {
    location.reload();
  });
};

// Function to reveal bombs after Game Over

const revealBombs = () => {
  console.log("revelation");
  for (let i = 0; i < 80; i++) {
    let revealedSquare = squares[i];
    if (revealedSquare.classList.contains("bomb")) {
      console.log(revealedSquare);
      revealedSquare.innerHTML = bombIcon;
    }
  }
};

// GameWin function

const gameWin = () => {
  resultsDisplay.innerHTML = `<h2 class="gameover-state">YOU WON!</h2>`;
  const wonTime = timerDisplay.textContent;
  resultsDisplay.innerHTML += `<div>Your time is: ${wonTime}</div>`;
  resultsDisplay.innerHTML += `<button class="again-btn">Play Again?</button>`;
  const againBtn = document.querySelector(".again-btn");
  board.classList.add("disabled");
  console.log("you won!");
  againBtn.addEventListener("click", () => {
    location.reload();
  });
};

const revealSquare = (square, num) => {
  if (square.classList.contains("marked")) {
    return;
  } else {
    if (num !== 0) {
      square.innerHTML = num;
      square.classList.add("clicked");
      square.classList.add("revealed");
      square.classList.add("revealed-num");
      if (num === 1) square.classList.add("one");
      if (num === 2) square.classList.add("two");
      if (num === 3) square.classList.add("three");
      if (num === 4) square.classList.add("four");
      if (num === 5) square.classList.add("five");
    } else {
      square.classList.add("clicked");
      square.classList.add("revealed-empty");
      console.log(square);
      checkSquare(square);
    }
  }
};

const checkSquare = (square) => {
  const thisSquareId = Number(square.id);
  let isLeft = leftIds.includes(thisSquareId);
  let isRight = rightIds.includes(thisSquareId);

  if (square.classList.contains("checked")) {
    return;
  }

  square.classList.add("checked");
  square.classList.add("revealed");

  const checkNewSquare = (square) => {
    if (square.classList.contains("empty")) {
      clickBomb(square);
    }
  };

  setTimeout(function () {
    if (thisSquareId >= 0 && thisSquareId <= 7) {
      let newId = Number(thisSquareId) + 8;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (thisSquareId >= 72 && thisSquareId <= 79) {
      let newId = Number(thisSquareId) - 8;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (leftIds.includes(thisSquareId)) {
      let newId = Number(thisSquareId) + 1;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (rightIds.includes(thisSquareId)) {
      let newId = Number(thisSquareId) - 1;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (thisSquareId >= 8 && thisSquareId <= 71) {
      let newId = Number(thisSquareId) - 8;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (thisSquareId >= 8 && thisSquareId <= 71) {
      let newId = Number(thisSquareId) + 8;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (thisSquareId >= 1 && thisSquareId <= 78 && !isLeft && !isRight) {
      let newId = Number(thisSquareId) - 1;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (thisSquareId >= 1 && thisSquareId <= 78 && !isLeft && !isRight) {
      let newId = Number(thisSquareId) + 1;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (thisSquareId <= 70 && !isRight) {
      let newId = Number(thisSquareId) + 9;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (thisSquareId <= 71 && !isLeft) {
      let newId = Number(thisSquareId) + 7;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (thisSquareId >= 8 && !isRight) {
      let newId = Number(thisSquareId) - 7;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
    if (thisSquareId >= 9 && !isLeft) {
      let newId = Number(thisSquareId) - 9;
      const newSquare = document.getElementById(newId);
      checkNewSquare(newSquare);
    }
  }, 10);
};
