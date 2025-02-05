import React, { useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext"; // adjust the path as needed
import "./PenguinRun.css";

const PenguinRun = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const gameContainer = document.getElementById("game-container");
    const penguin = document.getElementById("penguin");
    const scoreElement = document.getElementById("score");
    const gameOverScreen = document.querySelector(".game-over");
    const startScreen = document.querySelector(".start-screen");

    let isGameStarted = false;
    let isGameOver = false;
    let penguinVelocity = 0;
    let score = 0;
    let gameSpeed = 5;
    let obstacles = [];
    let lastSpawnTime = 0;
    let animationFrameId;
    let gameStartTime = 0; // Timestamp for when the game starts

    const SPAWN_MIN = 1000;
    const SPAWN_MAX = 2000;
    const GRAVITY = 0.9;
    const JUMP_FORCE = -16;
    const PENGUIN_GROUND = 120;

    // Ensure penguin starts on the ground
    penguin.style.bottom = `${PENGUIN_GROUND}px`;

    const jump = () => {
      if (isGameStarted && !isGameOver && parseFloat(penguin.style.bottom) === PENGUIN_GROUND) {
        penguinVelocity = JUMP_FORCE;
      }
    };

    const updatePenguin = () => {
      if (!isGameStarted || isGameOver) return;
      penguinVelocity += GRAVITY;
      const currentBottom = parseFloat(penguin.style.bottom) || PENGUIN_GROUND;
      const newBottom = currentBottom - penguinVelocity;
      if (newBottom <= PENGUIN_GROUND) {
        penguin.style.bottom = `${PENGUIN_GROUND}px`;
        penguinVelocity = 0;
      } else {
        penguin.style.bottom = `${newBottom}px`;
      }
    };

    const createObstacle = () => {
      const obstacle = document.createElement("div");
      obstacle.className = "obstacle";
      // Random width and height between 30px and 60px
      const width = Math.floor(Math.random() * 31) + 30;
      const height = 35
      obstacle.style.width = `${width}px`;
      obstacle.style.height = `${height}px`;
      obstacle.style.right = "-30px";
      gameContainer.appendChild(obstacle);
      obstacles.push({
        element: obstacle,
        x: gameContainer.clientWidth,
      });
    };

    const updateObstacles = (timestamp) => {
      obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;
        obstacle.element.style.right = `${gameContainer.clientWidth - obstacle.x}px`;

        const penguinRect = penguin.getBoundingClientRect();
        const obstacleRect = obstacle.element.getBoundingClientRect();

        if (
          !isGameOver &&
          penguinRect.right > obstacleRect.left &&
          penguinRect.left < obstacleRect.right &&
          penguinRect.bottom > obstacleRect.top
        ) {
          endGame();
        }

        if (obstacle.x < -60) {
          // Remove obstacles that have left the screen
          obstacle.element.remove();
          obstacles.splice(index, 1);
        }
      });

      if (timestamp - lastSpawnTime > Math.random() * (SPAWN_MAX - SPAWN_MIN) + SPAWN_MIN) {
        createObstacle();
        lastSpawnTime = timestamp;
      }
    };

    const endGame = () => {
      isGameOver = true;
      isGameStarted = false;
      gameOverScreen.style.display = "flex"; // Show full overlay
      document.getElementById("final-score").textContent = score;
      const highScore = localStorage.getItem("highScore") || 0;
      if (score > highScore) {
        localStorage.setItem("highScore", score);
        document.getElementById("high-score").textContent = score;
      } else {
        document.getElementById("high-score").textContent = highScore;
      }
    };

    const startGame = () => {
      isGameStarted = true;
      isGameOver = false;
      score = 0;
      gameSpeed = 5;
      penguinVelocity = 0;

      // Remove all existing obstacles
      obstacles.forEach((obstacle) => obstacle.element.remove());
      obstacles = [];

      penguin.style.bottom = `${PENGUIN_GROUND}px`;
      gameOverScreen.style.display = "none";
      startScreen.style.display = "none";
      scoreElement.textContent = "0";
      gameStartTime = performance.now();
      lastSpawnTime = gameStartTime;
      gameLoop(gameStartTime);
    };

    const gameLoop = (timestamp) => {
      if (isGameOver) return;
      updatePenguin();
      updateObstacles(timestamp);
      // Increase score over time (1 point per 100ms)
      score = Math.floor((timestamp - gameStartTime) / 100);
      scoreElement.textContent = score;
      gameSpeed += 0.005;
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const pointerdownHandler = (e) => {
      // When the game hasn't started (or after game over) tap to start/restart.
      if (!isGameStarted) {
        startGame();
      } else if (isGameStarted && !isGameOver) {
        // Only allow left mouse clicks or any touch events to trigger a jump.
        if (e.button === 0 || e.pointerType !== "mouse") {
          jump();
        }
      }
    };

    // Attach pointerdown to the game container and game over overlay.
    gameContainer.addEventListener("pointerdown", pointerdownHandler);
    gameOverScreen.addEventListener("pointerdown", pointerdownHandler);

    // Allow the Space key to trigger a jump during gameplay.
    const keydownHandler = (e) => {
      if (e.code === "Space" && isGameStarted && !isGameOver) {
        jump();
      } else {
        startGame();  
      }
    };
    document.addEventListener("keydown", keydownHandler);

    // Cleanup listeners on unmount.
    return () => {
      cancelAnimationFrame(animationFrameId);
      gameContainer.removeEventListener("pointerdown", pointerdownHandler);
      gameOverScreen.removeEventListener("pointerdown", pointerdownHandler);
      document.removeEventListener("keydown", keydownHandler);
    };
  }, []);

  return (
    <div id="game-container">
      <div className="score">
        Score: <span id="score">0</span>
      </div>
      <div className="start-screen">
        <h1 className="h1">artic run</h1>
        <p>Tap to start</p>
      </div>
      <div id="ground"></div>
      <div id="penguin"></div>
      <div className="game-over">
        <div>
          <h2 className="h2">Game Over!</h2>
          <p>
            Score: <span id="final-score">0</span>
          </p>
          <p>
            High Score: <span id="high-score">0</span>
          </p>
          <p>Tap to play again</p>
        </div>
      </div>
    </div>
  );
};

export default PenguinRun;
