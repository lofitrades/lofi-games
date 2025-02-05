// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Game1 from "./pages/games/penguin run/penguin run";
import Game2 from "./pages/games/Game-2/zgame2";

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
            <Route path="/games/penguin run/penguin run" element={<Game1 />} />
            <Route path="/games/Game-2/zgame2" element={<Game2 />} />

          </Routes>
        </div>
      </div>

    </Router>
  );
}

export default App;
