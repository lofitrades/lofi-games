// src/pages/PenguinRun.jsx
import React from "react";
import { useParams } from "react-router-dom";

const GamePage = () => {
  const { gameId } = useParams();  // Get the gameId from the URL

  return (
    <div className="page">
      <h1>{gameId} penguin run</h1>
      <p>Tap to start</p>
      {/* You can dynamically load different game components here if needed */}
    </div>
  );
};

export default GamePage;
