// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";

// Dynamically import game pages
const gamePages = import.meta.glob("/src/pages/games/*/*.{jsx,tsx}");

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [gamesDropdown, setGamesDropdown] = useState(false);
  const location = useLocation();

  // Mark "Games" as active if the URL starts with /games
  const isGamesActive = location.pathname.startsWith("/games");

  // Framer Motion variants for sidebar slide in/out
  const sidebarVariants = {
    open: { x: 0, transition: { stiffness: 20 } },
    closed: { x: "-100%", transition: { stiffness: 20 } },
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleGamesDropdown = () => setGamesDropdown(!gamesDropdown);

  // Function for NavLink active class
  const getLinkClass = ({ isActive }) =>
    isActive ? "menu-link active" : "menu-link";

  // Extract and sort the game names dynamically
  const gameNames = Object.keys(gamePages)
    .map((path) => {
      const folderName = path.split("/").slice(-2, -1)[0]; // Extract folder name
      const gameName = path.split("/").slice(-1)[0].replace(/\.[^.]+$/, ''); // Extract game name (without extension)
    
      return {
        name: gameName,
        path: path,
        folder: folderName,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by game name

  // Close Games dropdown if the user navigates away
  useEffect(() => {
    if (!isGamesActive) {
      setGamesDropdown(false); // Close the dropdown if the path is not related to "Games"
    }
  }, [location.pathname, isGamesActive]);

  return (
    <>
      {/* Mobile: Hamburger Button */}
      <div className="hamburger-button" onClick={toggleSidebar}>
        <FaBars />
      </div>

      {/* Mobile Sidebar (Animated) */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            className="sidebar"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
          >
            {/* Sidebar header with fixed order: ThemeToggle on left, Close button on right */}
            <div className="sidebar-header mobile-header">
              <ThemeToggle />
              <div className="close-button" onClick={toggleSidebar}>
                <FaTimes />
              </div>
            </div>
            <ul>
              <li>
                <NavLink
                  to="/"
                  onClick={toggleSidebar}
                  className={getLinkClass}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <div
                  className={`menu-item ${isGamesActive ? "active" : ""}`}
                  onClick={toggleGamesDropdown}
                >
                  <span className="menu-text">Games</span>
                  <FaChevronDown
                    className="dropdown-arrow"
                    style={{
                      transform: gamesDropdown
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </div>
                <AnimatePresence>
                  {gamesDropdown && (
                    <motion.ul
                      className="dropdown"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {gameNames.map(({ name, folder }) => (
                        <li key={name}>
                          <NavLink
                            to={`/games/${encodeURIComponent(folder)}/${encodeURIComponent(name)}`}
                            onClick={toggleSidebar}
                            className={getLinkClass}
                          >
                            {name}
                          </NavLink>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
              <li>
                <NavLink
                  to="/about"
                  onClick={toggleSidebar}
                  className={getLinkClass}
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  onClick={toggleSidebar}
                  className={getLinkClass}
                >
                  Contact
                </NavLink>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Always Visible) */}
      <motion.nav className="sidebar-desktop" initial={{ x: 0 }} animate={{ x: 0 }}>
        <div className="sidebar-header desktop-header">
          <ThemeToggle />
        </div>
        <ul>
          <li>
            <NavLink to="/" className={getLinkClass}>
              Home
            </NavLink>
          </li>
          <li>
            <div
              className={`menu-item ${isGamesActive ? "active" : ""}`}
              onClick={toggleGamesDropdown}
            >
              <span className="menu-text">Games</span>
              <FaChevronDown
                className="dropdown-arrow"
                style={{
                  transform: gamesDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </div>
            <AnimatePresence>
              {gamesDropdown && (
                <motion.ul
                  className="dropdown"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {gameNames.map(({ name, folder }) => (
                    <li key={name}>
                      <NavLink
                        to={`/games/${encodeURIComponent(folder)}/${encodeURIComponent(name)}`}
                        className={getLinkClass}
                      >
                        {name}
                      </NavLink>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>
          <li>
            <NavLink to="/about" className={getLinkClass}>
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={getLinkClass}>
              Contact
            </NavLink>
          </li>
        </ul>
      </motion.nav>
    </>
  );
};

export default Sidebar;
