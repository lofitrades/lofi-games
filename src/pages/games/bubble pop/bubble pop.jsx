import { useState, useEffect, useRef, useCallback } from 'react';
import './BubblePop.css';

// Export a creation date in ISO format.
export const createdAt = '2024-01-01'; // YYYY-MM-DD (or full ISO if needed)

const BubblePop = () => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameActive, setGameActive] = useState(false);
  const [highestScore, setHighestScore] = useState(0);
  const [screenFlash, setScreenFlash] = useState(false);
  const gameContainerRef = useRef(null);
  const bubblesRef = useRef([]);
  const lastPopPosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef(null);

  // Game constants
  const SPIKE_HEIGHT = 20;
  const BASE_SPEED = 200000000;
  const GAME_LOOP_INTERVAL = 1000 / 0.60; // 60 FPS

  useEffect(() => {
    const savedScore = localStorage.getItem('bubbleHighScore') || 0;
    setHighestScore(parseInt(savedScore));
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameActive || !gameContainerRef.current) return;

    const container = gameContainerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Update bubble positions
    bubblesRef.current.forEach((bubble) => {
      // Update position
      bubble.x += bubble.dx;
      bubble.y += bubble.dy;

      // Horizontal boundaries
      if (bubble.x < 0 || bubble.x > containerRect.width - bubble.size) {
        bubble.dx *= -1;
        bubble.x = Math.max(0, Math.min(bubble.x, containerRect.width - bubble.size));
      }

      // Vertical collision detection
      if (bubble.y < SPIKE_HEIGHT || bubble.y > containerRect.height - bubble.size - SPIKE_HEIGHT) {
        handleSpikeCollision(bubble);
        return;
      }

      // Update visual position
      bubble.element.style.transform = `translate(${bubble.x}px, ${bubble.y}px)`;
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameActive]);

  const createBubble = useCallback((fromCollision = false) => {
    const container = gameContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const minSize = 45;
    const maxSize = 90;
    const size = Math.random() * (maxSize - minSize) + minSize;

    // Determine start position
    let startX, startY;
    if (fromCollision || !lastPopPosition.current.x) {
      startX = containerRect.width / 2 - size / 2;
      startY = containerRect.height / 2 - size / 2;
    } else {
      startX = lastPopPosition.current.x - size / 2;
      startY = lastPopPosition.current.y - size / 2;
    }

    // Calculate random direction and speed
    const speed = BASE_SPEED + Math.floor(score*1000) * 10000000;
    const angle = Math.random() * Math.PI * 2;
    const dx = Math.cos(angle) * speed * 100000;
    const dy = Math.sin(angle) * speed * 100000;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.transform = `translate(${startX}px, ${startY}px)`;
    
    container.appendChild(bubble);
    bubblesRef.current.push({ element: bubble, x: startX, y: startY, dx, dy, size });
  }, [score]);

  const handleBubbleClick = useCallback((e) => {
    if (!gameActive) return;
    
    const container = gameContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    if (!e.target.classList.contains('bubble')) {
      setScore(prev => Math.max(0, prev - 1));
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 100);
      return;
    }

    const bubble = bubblesRef.current.find(b => b.element === e.target);
    const points = Math.max(1, Math.floor((90 - bubble.size) / 45 * 9));

    // Update score and position
    setScore(prev => prev + points);
    lastPopPosition.current = {
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top
    };

    // Score pop
    const scorePop = document.createElement('div');
    scorePop.className = 'score-pop';
    scorePop.textContent = `+${points}`;
    scorePop.style.left = `${lastPopPosition.current.x}px`;
    scorePop.style.top = `${lastPopPosition.current.y}px`;
    container.appendChild(scorePop);
    setTimeout(() => scorePop.remove(), 500);

    // Remove bubble
    bubble.element.classList.add('popped');
    setTimeout(() => {
      bubble.element.remove();
      bubblesRef.current = bubblesRef.current.filter(b => b !== bubble);
    }, 200);

    createBubble();
  }, [gameActive, createBubble]);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setLives(3);
    bubblesRef.current.forEach(b => b.element.remove());
    bubblesRef.current = [];
    lastPopPosition.current = { x: 0, y: 0 };
    createBubble();
    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  const handleSpikeCollision = (bubble) => {
    bubble.element.classList.add('crashed');
    setTimeout(() => {
      bubble.element.remove();
      bubblesRef.current = bubblesRef.current.filter(b => b !== bubble);
    }, 200);
    
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) endGame();
      return newLives;
    });
    
    createBubble(true);
  };

  const endGame = () => {
    setGameActive(false);
    cancelAnimationFrame(animationFrameId.current);
    if (score > highestScore) {
      setHighestScore(score);
      localStorage.setItem('bubbleHighScore', score);
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);

  return (
    <div 
      className={`game-container ${screenFlash ? 'screen-flash' : ''}`} 
      ref={gameContainerRef}
      onClick={handleBubbleClick}
    >
      <div className="score-display">{score}</div>
      <div className="lives-display">
        {'♥'.repeat(lives)}{'♡'.repeat(3 - lives)}
      </div>

      {!gameActive && (
        <div className={`game-over-screen ${score > 0 ? 'visible' : ''}`}>
          <h2>Game Over!</h2>
          <p>Score: {score}</p>
          <p>High Score: {highestScore}</p>
          <button className="play-again" onClick={startGame}>
            Play Again
          </button>
        </div>
      )}

      {!gameActive && score === 0 && (
        <button className="start-button" onClick={startGame}>
          Pop!
        </button>
      )}
    </div>
  );
};

export default BubblePop;