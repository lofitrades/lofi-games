import React from 'react';
import { useParams } from 'react-router-dom';

const DynamicGame = () => {
  const { gameName } = useParams();

  // Use Vite's glob to eagerly import game components.
  // The relative path is from this file (located in src/components/GameGrid) to src/pages/games.
  const modules = import.meta.glob('../../pages/games/*/*.jsx', { eager: true });
  
  // Find the module whose filename (without .jsx) matches the gameName (case insensitive).
  const moduleKey = Object.keys(modules).find(key => {
    const parts = key.split('/');
    const fileName = parts[parts.length - 1]; // e.g., "PacMan.jsx"
    return fileName.toLowerCase() === `${gameName.toLowerCase()}.jsx`;
  });
  
  if (!moduleKey) {
    return <div>Game not found</div>;
  }
  
  const GameComponent = modules[moduleKey].default;
  return <GameComponent />;
};

export default DynamicGame;
