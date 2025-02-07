import { useState, useEffect, useRef, useCallback } from 'react';
import './BubblePop.css';

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

  // Load high score from localStorage
  useEffect(() => {
    const savedScore = localStorage.getItem('bubbleHighScore') || 0;
    setHighestScore(parseInt(savedScore));
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameActive || !gameContainerRef.current) return;

    const container = gameContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const spikeHeight = 20;

    // Update bubble positions
    bubblesRef.current = bubblesRef.current.filter(bubble => {
      const newX = bubble.x + bubble.dx;
      const newY = bubble.y + bubble.dy;

      // Check spike collision
      if (newY < spikeHeight || newY > containerRect.height - bubble.size - spikeHeight) {
        handleSpikeCollision(bubble);
        return false;
      }

      // Wall bounce
      if (newX < 0 || newX > containerRect.width - bubble.size) {
        bubble.dx *= -1;
        return true;
      }

      // Update position
      bubble.element.style.transform = `translate(${newX}px, ${newY}px)`;
      bubble.x = newX;
      bubble.y = newY;
      return true;
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameActive]);

  // Handle spike collision
  const handleSpikeCollision = (bubble) => {
    bubble.element.classList.add('crashed');
    setTimeout(() => bubble.element.remove(), 200);
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) endGame();
      return newLives;
    });
    createBubble(true);
  };

  // Create new bubble
  const createBubble = useCallback((fromCollision = false) => {
    const container = gameContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const minSize = 45;
    const maxSize = 90;
    const size = Math.random() * (maxSize - minSize) + minSize;
    
    // Calculate initial position
    let startX, startY;
    if (fromCollision || !lastPopPosition.current.x) {
      startX = containerRect.width / 2 - size / 2;
      startY = containerRect.height / 2 - size / 2;
    } else {
      startX = lastPopPosition.current.x - size / 2;
      startY = lastPopPosition.current.y - size / 2;
    }

    // Determine direction (away from nearest spike)
    const baseSpeed = 1 + Math.floor(score / 20) * 0.5;
    const angle = fromCollision 
      ? (startY < containerRect.height / 2 ? Math.PI / 2 : -Math.PI / 2) + (Math.random() * Math.PI/4 - Math.PI/8)
      : Math.random() * Math.PI * 2;

    const dx = Math.cos(angle) * baseSpeed;
    const dy = Math.sin(angle) * baseSpeed;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.transform = `translate(${startX}px, ${startY}px)`;
    
    container.appendChild(bubble);
    bubblesRef.current.push({ element: bubble, x: startX, y: startY, dx, dy, size });
  }, [score]);

  // Handle bubble click
  const handleBubbleClick = useCallback((e) => {
    if (!gameActive || !e.target.classList.contains('bubble')) {
      if (gameActive) {
        setScore(prev => Math.max(0, prev - 1));
        setScreenFlash(true);
        setTimeout(() => setScreenFlash(false), 100);
      }
      return;
    }

    const bubble = bubblesRef.current.find(b => b.element === e.target);
    const points = Math.max(1, Math.floor((90 - bubble.size) / 45 * 9));
    
    // Update score and position
    setScore(prev => prev + points);
    lastPopPosition.current = { 
      x: bubble.x + bubble.size / 2, 
      y: bubble.y + bubble.size / 2 
    };

    // Animate and remove bubble
    bubble.element.classList.add('popped');
    setTimeout(() => bubble.element.remove(), 200);
    createBubble();
  }, [gameActive, createBubble]);

  // Start game
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

  // End game
  const endGame = () => {
    setGameActive(false);
    cancelAnimationFrame(animationFrameId.current);
    if (score > highestScore) {
      setHighestScore(score);
      localStorage.setItem('bubbleHighScore', score);
    }
  };

  // Cleanup
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