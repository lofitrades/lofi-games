// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Game1 from "./pages/games/penguin-run/PenguinRun";
import Game2 from "./pages/games/Game-2/Game2";
import Game3 from "./pages/games/Game3/Game3";

function App() {
  return (
    <Router basename="/lofi-games">
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/games/penguin-run/PenguinRun" element={<Game1 />} />
            <Route path="/games/Game-2/Game2" element={<Game2 />} />
            <Route path="/games/Game3/Game3" element={<Game3 />} />
          </Routes>
        </div>
      </div>

    </Router>
  );
}

export default App;
