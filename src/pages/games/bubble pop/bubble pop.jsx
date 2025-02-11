// src/pages/games/bubble pop/Bubble Pop.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../../context/ThemeContext';

// Import theme-specific bubble images
import bubbleDark from './images/bubble-dark.png';
import bubbleLight from './images/bubble-light.png';

// Import sound effects
import popSound from './sounds/pop.wav';
import bounceSound from './sounds/bounce.wav';
import crashSound from './sounds/crash.wav';
import liveSound from './sounds/live.wav';
import endSound from './sounds/end.wav';
import missSound from './sounds/miss.wav';

import './BubblePop.css';

const BubblePop = () => {
  // Game states
  const { theme } = useTheme();
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bubbles, setBubbles] = useState([]);
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem("bubblePopHighScore") || "0")
  );
  const [showRestartButton, setShowRestartButton] = useState(false);
  const [muted, setMuted] = useState(false);
  const [invertAnimation, setInvertAnimation] = useState(false);

  // Refs
  const gameAreaRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastSpawnPosition = useRef({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2 
  });
  const bubbleIdCounter = useRef(0);
  const collisionSideRef = useRef(null);

  // Audio refs
  const popAudioRef = useRef(null);
  const bounceAudioRef = useRef(null);
  const crashAudioRef = useRef(null);
  const liveAudioRef = useRef(null);
  const endAudioRef = useRef(null);
  const missAudioRef = useRef(null);

  // Theme-specific bubble image
  const bubbleImage = theme === 'dark' ? bubbleDark : bubbleLight;

  useEffect(() => {
    popAudioRef.current = new Audio(popSound);
    bounceAudioRef.current = new Audio(bounceSound);
    crashAudioRef.current = new Audio(crashSound);
    liveAudioRef.current = new Audio(liveSound);
    endAudioRef.current = new Audio(endSound);
    missAudioRef.current = new Audio(missSound);
  }, []);

  const playSound = (audioRef) => {
    if (audioRef.current && !muted) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const getFacingAngle = useCallback((yPosition) => {
    const isNearTop = yPosition < window.innerHeight / 2;
    return isNearTop 
      ? Math.random() * Math.PI
      : Math.PI + Math.random() * Math.PI;
  }, []);

  const getPoppedAngle = useCallback((yPosition) => {
    const topSpikeY = 20;
    const bottomSpikeY = window.innerHeight - 20;
    const distanceToTop = yPosition - topSpikeY;
    const distanceToBottom = bottomSpikeY - yPosition;
    return distanceToTop < distanceToBottom
      ? Math.random() * Math.PI
      : Math.PI + Math.random() * Math.PI;
  }, []);

  const spawnBubble = useCallback((spawnPosition, angle = Math.random() * Math.PI * 2) => {
    const size = 45 + Math.random() * 45;
    const rotation = Math.random() * 360;
    const rotationSpeed = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 1.5 + 0.5);
    setBubbles(prev => [...prev, {
      id: bubbleIdCounter.current++,
      x: spawnPosition.x,
      y: spawnPosition.y,
      size,
      angle,
      status: "normal",
      rotation,
      rotationSpeed,
      bounced: false
    }]);
  }, []);

  const gameLoop = useCallback(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    setBubbles(prevBubbles => {
      return prevBubbles.map(bubble => {
        const newRotation = bubble.rotation + bubble.rotationSpeed;
        let newBubble = { ...bubble, rotation: newRotation };

        if (bubble.status === "normal") {
          let { x, y, size, angle } = bubble;
          const speed = 2 + (score / 20) * 0.5;
          x += speed * Math.cos(angle);
          y += speed * Math.sin(angle);

          let bounced = bubble.bounced || false;
          if (x - size/2 < 0 || x + size/2 > window.innerWidth) {
            if (!bounced) playSound(bounceAudioRef);
            bounced = true;
            angle = Math.PI - angle + (Math.random() - 0.5) * 0.2;
            x = Math.max(size/2, Math.min(x, window.innerWidth - size/2));
          } else {
            bounced = false;
          }
          newBubble = { ...newBubble, x, y, angle, bounced };

          if (y - size / 2 < 20 || y + size / 2 > window.innerHeight - 20) {
            collisionSideRef.current = y - size / 2 < 20 ? 'top' : 'bottom';
            playSound(crashAudioRef);
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives > 0) {
                playSound(liveAudioRef);
                const newAngle = getFacingAngle(y);
                spawnBubble(lastSpawnPosition.current, newAngle);
              } else {
                setGameState("gameover");
                if (score > highScore) {
                  localStorage.setItem("bubblePopHighScore", score);
                  setHighScore(score);
                }
                playSound(endAudioRef);
                setTimeout(() => setShowRestartButton(true), 1000);
              }
              return newLives;
            });
            return { ...newBubble, status: "crashed", crashTime: Date.now(), rotationSpeed: -bubble.rotationSpeed };
          }
          return newBubble;
        } else {
          return newBubble;
        }
      });
    });
  }, [score, highScore, getFacingAngle, spawnBubble]);

  useEffect(() => {
    if (gameState === "active") {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, gameLoop]);

  const startGame = (e) => {
    e.stopPropagation();
    setGameState("active");
    setScore(0);
    setLives(3);
    setBubbles([]);
    setShowRestartButton(false);
    lastSpawnPosition.current = { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    };
    spawnBubble(lastSpawnPosition.current);
  };

  const handleBubbleClick = (e, bubbleId) => {
    e.stopPropagation();
    setBubbles(prev => prev.map(bubble => {
      if (bubble.id === bubbleId && bubble.status === "normal") {
        const points = Math.max(1, Math.floor((90 - bubble.size) / 45 * 9));
        setScore(s => s + points);
        lastSpawnPosition.current = { x: bubble.x, y: bubble.y };
        spawnBubble(lastSpawnPosition.current, getPoppedAngle(bubble.y));
        playSound(popAudioRef);
        return { ...bubble, status: "popped", popTime: Date.now(), rotationSpeed: -bubble.rotationSpeed };
      }
      return bubble;
    }));
  };

  const handleMissedClick = () => {
    if (gameState === "active") {
      setScore(prev => Math.max(0, prev - 1));
      playSound(missAudioRef);
      setInvertAnimation(true);
      setTimeout(() => setInvertAnimation(false), 100);
    }
  };

  return (
    <div
      className={`game-container ${invertAnimation ? 'invert' : ''}`}
      ref={gameAreaRef}
      onClick={handleMissedClick}
    >
      <button 
        className="mute-toggle" 
        onClick={(e) => {
          e.stopPropagation();
          setMuted(prev => !prev);
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000
        }}
      >
        {muted ? "Unmute" : "Mute"}
      </button>

      {gameState === "active" && (
        <div className="score-display">Score: {score}</div>
      )}

      {gameState === "active" && (
        <div className="lives-display">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i}>{i < lives ? '♥' : '♡'}</span>
          ))}
        </div>
      )}

      {bubbles.map(bubble => (
        <img
          key={bubble.id}
          src={bubbleImage}
          alt="bubble"
          className={`bubble ${bubble.status}`}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            position: 'absolute',
            left: `${bubble.x - bubble.size / 2}px`,
            top: `${bubble.y - bubble.size / 2}px`,
            transition: 'transform 0.2s, opacity 0.2s',
            transform: `rotate(${bubble.rotation}deg)`,
            backgroundColor: 'transparent'
          }}
          onClick={(e) => handleBubbleClick(e, bubble.id)}
        />
      ))}

      {gameState === "start" && (
        <div className="overlay">
          <button 
            className="start-button" 
            onClick={startGame}
            onTouchStart={(e) => e.stopPropagation()}
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="overlay">
          <h1>Game Over</h1>
          <p>Score: {score}</p>
          <p>High Score: {highScore}</p>
          {showRestartButton && (
            <button 
              className="restart-button" 
              onClick={startGame}
              onTouchStart={(e) => e.stopPropagation()}
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BubblePop;