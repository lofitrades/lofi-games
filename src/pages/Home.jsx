// src/pages/Home.jsx
import React from "react";
import GameGrid from "../components/GameGrid/GameGrid";

const Home = () => {
  return (
    <div className="page">
      <h1 className="h1Home">lofi-games</h1>
      <p className="pHome">
        developed by @<u>juandiegocr</u>
      </p>
      {/* Include the GameGrid below your header */}
      <GameGrid />
    </div>
  );
};

export default Home;
