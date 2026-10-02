// snake.js - a small, calm snake game. No score pressure shown,
// though the board does track length internally.

const canvas = document.getElementById("snake-canvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let velocity = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let gameStarted = false;

function placeFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
  };
}

function drawCell(pos, color) {
  ctx.fillStyle = color;
  ctx.fillRect(pos.x * gridSize, pos.y * gridSize, gridSize - 2, gridSize - 2);
}

function gameLoop() {
  if (!gameStarted) return;

  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  // wrap around edges instead of ending the game - keeps it low-pressure
  if (head.x < 0) head.x = tileCount - 1;
  if (head.x >= tileCount) head.x = 0;
  if (head.y < 0) head.y = tileCount - 1;
  if (head.y >= tileCount) head.y = 0;

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    placeFood();
    trackEvent("snake_food_eaten", "snake");
  } else {
    snake.pop();
  }

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  snake.forEach((segment, index) => {
    drawCell(segment, index === 0 ? "#ffffff" : "#66ff66");
  });
  drawCell(food, "#ff5d73");

  requestAnimationFrame(() => setTimeout(gameLoop, 120));
}

document.addEventListener("keydown", (e) => {
  if (!gameStarted) {
    gameStarted = true;
    trackEvent("snake_start", "snake");
    gameLoop();
  }
  switch (e.key) {
    case "ArrowUp":
      velocity = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      velocity = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      velocity = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      velocity = { x: 1, y: 0 };
      break;
  }
});

// initial draw before the game starts
ctx.fillStyle = "#000000";
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawCell(snake[0], "#ffffff");
drawCell(food, "#ff5d73");
