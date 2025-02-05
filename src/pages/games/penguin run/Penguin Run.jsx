// src/pages/PenguinRun.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import "./PenguinRun.css";

const PenguinRun = () => {
  const { gameId } = useParams(); // Get the gameId from the URL
  const { theme } = useTheme(); // Access the current theme

  // Refs for DOM elements and game state
  const gameContainerRef = useRef(null);
  const penguinRef = useRef(null);
  const animationFrameId = useRef(null);

  // Game state
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState("start"); // 'start', 'playing', 'over'

  // Game physics
  const gameSpeed = useRef(5);
  const penguinVelocity = useRef(0);
  const obstacles = useRef([]);
  const lastSpawnTime = useRef(0);

  // Constants
  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;
  const PENGUIN_GROUND = 120;
  const SPAWN_MIN = 500;
  const SPAWN_MAX = 2000;

  // Jump function
  const jump = useCallback(() => {
    if (gameState === "playing" && parseFloat(penguinRef.current.style.bottom) === PENGUIN_GROUND) {
      penguinVelocity.current = JUMP_FORCE;
    }
  }, [gameState]);

  // Update penguin position
  const updatePenguin = useCallback(() => {
    if (gameState !== "playing") return;

    penguinVelocity.current += GRAVITY;
    const currentBottom = parseFloat(penguinRef.current.style.bottom) || PENGUIN_GROUND;
    const newBottom = currentBottom - penguinVelocity.current;

    penguinRef.current.style.bottom = `${Math.min(newBottom, PENGUIN_GROUND)}px`;
    if (newBottom <= PENGUIN_GROUND) penguinVelocity.current = 0;
  }, [gameState]);

  // Create a new obstacle
  const createObstacle = useCallback(() => {
    const obstacle = document.createElement("div");
    obstacle.className = "obstacle";

    const width = Math.floor(Math.random() * 31) + 30;
    const height = Math.floor(Math.random() * 31) + 30;

    obstacle.style.width = `${width}px`;
    obstacle.style.height = `${height}px`;
    obstacle.style.right = "-30px";

    gameContainerRef.current.appendChild(obstacle);
    obstacles.current.push({
      element: obstacle,
      x: gameContainerRef.current.clientWidth,
      width,
      height,
    });
  }, []);

  // Update obstacles and check for collisions
  const updateObstacles = useCallback((timestamp) => {
    obstacles.current.forEach((obstacle, index) => {
      obstacle.x -= gameSpeed.current;
      obstacle.element.style.right = `${gameContainerRef.current.clientWidth - obstacle.x}px`;

      // Collision detection
      const penguinRect = penguinRef.current.getBoundingClientRect();
      const obstacleRect = obstacle.element.getBoundingClientRect();

      if (
        gameState === "playing" &&
        penguinRect.right > obstacleRect.left &&
        penguinRect.left < obstacleRect.right &&
        penguinRect.bottom > obstacleRect.top
      ) {
        endGame();
      }

      // Remove off-screen obstacles
      if (obstacle.x < -60) {
        obstacle.element.remove();
        obstacles.current.splice(index, 1);
        setScore((prev) => prev + 10);
      }
    });

    // Spawn new obstacles
    if (timestamp - lastSpawnTime.current > Math.random() * (SPAWN_MAX - SPAWN_MIN) + SPAWN_MIN) {
      createObstacle();
      lastSpawnTime.current = timestamp;
    }
  }, [createObstacle, gameState]);

  // Main game loop
  const gameLoop = useCallback(
    (timestamp) => {
      if (gameState !== "playing") return;

      updatePenguin();
      updateObstacles(timestamp);
      gameSpeed.current += 0.002;
      animationFrameId.current = requestAnimationFrame(gameLoop);
    },
    [gameState, updatePenguin, updateObstacles]
  );

  // Start the game
  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    gameSpeed.current = 5;
    penguinVelocity.current = 0;

    // Clear existing obstacles
    obstacles.current.forEach((obstacle) => obstacle.element.remove());
    obstacles.current = [];

    lastSpawnTime.current = performance.now();
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // End the game
  const endGame = useCallback(() => {
    setGameState("over");
    cancelAnimationFrame(animationFrameId.current);

    // Update high score
    const storedHighScore = localStorage.getItem("highScore") || 0;
    if (score > storedHighScore) {
      localStorage.setItem("highScore", score);
      setHighScore(score);
    } else {
      setHighScore(storedHighScore);
    }
  }, [score]);

  // Event listeners for controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [jump]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      obstacles.current.forEach((obstacle) => obstacle.element.remove());
    };
  }, []);

  return (
    <div className={`page game-container ${theme}-theme`} ref={gameContainerRef}>
      <div className="score">Score: {score}</div>

      {gameState === "start" && (
        <div className="start-screen">
          <h2>Penguin Run</h2>
          <p>Click or tap to start</p>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {gameState === "over" && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Score: {score}</p>
          <p>High Score: {highScore}</p>
          <button onClick={startGame}>Play Again</button>
        </div>
      )}

      <div className="ground" />
      <div
        ref={penguinRef}
        className="penguin"
        style={{ bottom: `${PENGUIN_GROUND}px` }}
      />
    </div>
  );
};

export default PenguinRun;