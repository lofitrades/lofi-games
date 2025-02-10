import React, { useState, useRef, useCallback } from 'react';
import { games as allGames } from '../../pages/games';
import { useTheme } from '../../context/ThemeContext'; // still used for styling
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';
import './GameGrid.css'; // This should match the file path


const GameGrid = () => {
  const { theme } = useTheme(); // The current theme is available for styling.
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('A-Z');
  const [viewMode, setViewMode] = useState('grid'); // "grid" or "list"
  const [displayCount, setDisplayCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();

  // Filter games by search query
  const filteredGames = allGames.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort games based on the selected option
  const sortedGames = filteredGames.sort((a, b) => {
    if (sortOption === 'A-Z') {
      return a.name.localeCompare(b.name);
    } else if (sortOption === 'Z-A') {
      return b.name.localeCompare(a.name);
    } else if (sortOption === 'Newest to Oldest') {
      return b.createdAt - a.createdAt;
    } else if (sortOption === 'Oldest to Newest') {
      return a.createdAt - b.createdAt;
    }
    return 0;
  });

  // Slice the sorted games for infinite scrolling
  const gamesToDisplay = sortedGames.slice(0, displayCount);

  // Set up the Intersection Observer to load more games as the user scrolls
  const lastGameElementRef = useCallback(node => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayCount < sortedGames.length) {
        setLoading(true);
        setTimeout(() => {
          setDisplayCount(prev => prev + 10);
          setLoading(false);
        }, 500);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, displayCount, sortedGames.length]);

  // When a game card is clicked, navigate to the route that loads its actual JSX file.
  const handleCardClick = (gameName) => {
    navigate(`/game/${gameName}`);
  };

  return (
    <div className="game-grid-container">
      {/* Search, Sorting and View Toggle Button */}
      <div className="search-sort-view">
        <div className="search-sort">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-search"
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="select-sort"
          >
            <option value="A-Z">A-Z</option>
            <option value="Z-A">Z-A</option>
            <option value="Newest to Oldest">Newest to Oldest</option>
            <option value="Oldest to Newest">Oldest to Newest</option>
          </select>
        </div>
        <div className="view-toggle">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="toggle-view-btn"
          >
            {viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
          </button>
        </div>
      </div>

      {/* Render Grid or List view */}
      {viewMode === 'grid' ? (
        <div className="grid-view">
          {gamesToDisplay.map((game, index) => {
            const card = (
              <div
                key={game.name}
                className="game-card"
                onClick={() => handleCardClick(game.name)}
                style={{
                  backgroundColor: 'var(--game-bg)',
                  color: 'var(--element-color)',
                }}
              >
                <img
                  src={game.image}
                  alt={game.name}
                  onError={(e) => { e.target.src = '/lofi-games/default-image.png'; }}
                  className="game-card-image"
                />
                <div className="game-card-text">{game.name}</div>
              </div>
            );
            // Attach the ref to the last element to trigger infinite scroll.
            return index === gamesToDisplay.length - 1 ? (
              <div key={game.name} ref={lastGameElementRef}>
                {card}
              </div>
            ) : (
              card
            );
          })}
        </div>
      ) : (
        // List view: show only the game name.
        <div className="list-view">
          {gamesToDisplay.map((game, index) => {
            const card = (
              <div
                key={game.name}
                className="game-card-list"
                onClick={() => handleCardClick(game.name)}
                style={{
                  backgroundColor: 'var(--game-bg)',
                  color: 'var(--element-color)',
                }}
              >
                {game.name}
              </div>
            );
            return index === gamesToDisplay.length - 1 ? (
              <div key={game.name} ref={lastGameElementRef}>
                {card}
              </div>
            ) : (
              card
            );
          })}
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default GameGrid;
