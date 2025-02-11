// src/pages/games/index.js

// Use Vite's glob with the { eager: true } option.
const gameModules = import.meta.glob('./*/*.jsx', { eager: true });
const imageModules = import.meta.glob('./*/image/*.png', { eager: true });

const games = Object.entries(gameModules).map(([path, module]) => {
  const parts = path.split('/');
  const folderName = parts[1]; // e.g., "PacMan"
  const fileName = parts[2];   // e.g., "PacMan.jsx"
  const gameName = fileName.replace('.jsx', ''); // e.g., "PacMan"

  // Construct the key for the corresponding image
  const imageKey = `./${folderName}/image/${gameName}.png`;
  const imageModule = imageModules[imageKey];
  const image = imageModule ? imageModule.default : '/lofi-games/default-image.png';

  // Convert the exported creation date to a timestamp
  const createdAt = module.createdAt ? new Date(module.createdAt).getTime() : 0;

  return {
    name: gameName,
    Component: module.default,
    image,
    createdAt,
  };
});

// Named export for 'games'
export { games };
