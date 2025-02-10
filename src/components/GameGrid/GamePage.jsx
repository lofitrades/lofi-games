import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { games } from '../../pages/games';

const GamePage = () => {
  const { gameName } = useParams();
  const navigate = useNavigate();
  
  // Find the game whose name matches the URL parameter (case-insensitive)
  const game = games.find(g => g.name.toLowerCase() === gameName.toLowerCase());

  if (!game) {
    return (
      <div className="p-4">
        <h1 className='h1Home'>Game Not Found</h1>
        <button onClick={() => navigate(-1)} className="button">
          Go Back
        </button>
      </div>
    );
  }

  const GameComponent = game.Component;

  return (
    <div className="p-4">

      <div>
        <GameComponent />
      </div>
    </div>
  );
};

export default GamePage;
