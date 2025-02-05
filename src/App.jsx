// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Game1 from "./pages/games/Game1";
import Game2 from "./pages/games/Game2";
import Game3 from "./pages/games/Game3";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/games/game1" element={<Game1 />} />
            <Route path="/games/game2" element={<Game2 />} />
            <Route path="/games/game3" element={<Game3 />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
