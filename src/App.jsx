// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ArticRun from "./pages/games/artic run/artic run";
import BubblePop from "./pages/games/bubble pop/bubble pop";
import MusicPlayer from "./components/MusicPlayer";
import GameGrid from './components/GameGrid/GameGrid';
import GamePage from './components/GameGrid/GamePage';

function App() {
  useEffect(() => {
    // Disable text selection
    document.body.style.userSelect = "none";

    // Disable right-click
    const disableContextMenu = (event) => event.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);

    // Disable zooming (Ctrl +, Ctrl -, Ctrl 0)
    const disableZoom = (event) => {
      if (event.ctrlKey && (event.key === "+" || event.key === "-" || event.key === "0")) {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", disableZoom);

    // Disable pinch-to-zoom on mobile
    const preventPinch = (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventPinch, { passive: false });

    // Disable Ctrl scroll zoom
    const disableCtrlScroll = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };
    window.addEventListener("wheel", disableCtrlScroll, { passive: false });

    // Cleanup event listeners on unmount
    return () => {
      document.body.style.userSelect = "auto";
      document.removeEventListener("contextmenu", disableContextMenu);
      window.removeEventListener("keydown", disableZoom);
      document.removeEventListener("touchmove", preventPinch);
      window.removeEventListener("wheel", disableCtrlScroll);
    };
  }, []);

  return (
    <Router basename="/lofi-games">
      <div className="app-container">
        <Sidebar />
        <MusicPlayer /> {/* Global Music Player */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/games/artic-run/artic-run" element={<ArticRun />} />
            <Route path="/games/bubble-pop/bubble-pop" element={<BubblePop />} />
            <Route path="/game/:gameName" element={<GamePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
