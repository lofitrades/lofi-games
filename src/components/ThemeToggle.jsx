// src/components/ThemeToggle.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const iconStyle = { fontSize: "1.8rem", cursor: "pointer" };

  return (
    <div className="theme-toggle-switch" onClick={toggleTheme}>
      {theme === "light" ? (
        <FaToggleOff style={iconStyle} />
      ) : (
        <FaToggleOn style={iconStyle} />
      )}
    </div>
  );
};

export default ThemeToggle;
