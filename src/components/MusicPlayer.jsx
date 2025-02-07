// src/components/MusicPlayer.jsx
import React, { useEffect, useState, useRef } from "react";
import { getSongs } from "../utils/dropbox";
import { Howl } from "howler";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

let globalPlayer = null;

const MusicPlayer = () => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasInteracted = useRef(false);
  const [playedSongs, setPlayedSongs] = useState([]);
  const [defaultImageUrl, setDefaultImageUrl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    async function loadSongs() {
      try {
        const songList = await getSongs();
        if (songList.length === 0) return;

        const defaultImage = await getDefaultImage();
        setDefaultImageUrl(defaultImage);

        const shuffled = [...songList].sort(() => Math.random() - 0.5);
        setSongs(shuffled);
      } catch (error) {
        console.error("Error loading songs or default image:", error);
      }
    }
    loadSongs();
  }, []);

  const getDefaultImage = async () => {
    try {
      return "/lofi-games/default-image.png";
    } catch (error) {
      console.error("Error fetching default image:", error);
      return "";
    }
  };

  const playSong = (song) => {
    if (!song) return;
    if (globalPlayer) {
      globalPlayer.stop();
      globalPlayer = null;
    }
    globalPlayer = new Howl({
      src: [song.url],
      html5: true,
      volume: 0.7,
      onend: playNextSong,
    });
    setCurrentSong(song);
    globalPlayer.play();
    setIsPlaying(true);
    setPlayedSongs((prevSongs) => [...prevSongs, song.name]);
  };

  const togglePlay = () => {
    if (currentSong && globalPlayer) {
      if (isPlaying) {
        globalPlayer.pause();
        setIsPlaying(false);
      } else {
        globalPlayer.play();
        setIsPlaying(true);
      }
    } else if (!currentSong && songs.length > 0) {
      playSong(songs[0]);
    }
  };

  const playNextSong = () => {
    if (songs.length === 0) return;

    let nextSong;
    
    if (playedSongs.length >= songs.length) {
      // Reset playlist when all songs played
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setSongs(shuffled);
      setPlayedSongs([]);
      nextSong = shuffled[0];
    } else {
      // Find available unplayed songs
      const availableSongs = songs.filter(song => 
        !playedSongs.includes(song.name)
      );
      
      if (availableSongs.length === 0) {
        // Fallback shuffle if somehow no available songs
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        setSongs(shuffled);
        setPlayedSongs([]);
        nextSong = shuffled[0];
      } else {
        // Select random song from available
        nextSong = availableSongs[
          Math.floor(Math.random() * availableSongs.length)
        ];
      }
    }

    setPlayedSongs(prev => [...prev, nextSong.name]);
    playSong(nextSong);
  };

  const removeExtension = (filename) => {
    return filename.replace(/\.[^/.]+$/, "");
  };

  useEffect(() => {
    if (titleRef.current) {
      setIsOverflow(titleRef.current.scrollWidth > titleRef.current.clientWidth);
    }
  }, [currentSong, isHovered]);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasInteracted.current && songs.length > 0) {
        hasInteracted.current = true;
        playSong(songs[0]);
      }
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("scroll", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);
    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [songs]);

  return (
    <div 
      className="music-player-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundImage:
          isHovered && currentSong
            ? `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${currentSong.imageUrl})`
            : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        src={currentSong ? currentSong.imageUrl : "/lofi-games/default-image.png"}
        alt="Song"
        className="song-image"
      />
      {!isHovered && (
        <button onClick={togglePlay} className="play-toggle-button">
          {isPlaying ? "❚❚" : "▶"}
        </button>
      )}
      {isHovered && (
        <table className="music-player-table" onClick={togglePlay}>
          <tbody>
            <tr>
              <td>
                <div className="song-title-wrapper">
                  <p
                    ref={titleRef}
                    className={`song-title ${isOverflow ? "overflow" : ""}`}
                  >
                    {currentSong
                      ? removeExtension(currentSong.name)
                      : "No song playing"}
                  </p>
                </div>
              </td>
            </tr>
            <tr>
                <td>
                    <p className="pPlayer">lofi-games</p>
                </td>
            </tr>
            <tr>
              <td>
                <div className="music-player-controls">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    disabled={songs.length === 0}
                    className="play-button"
                  >
                    {isPlaying ? "❚❚" : "▶"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playNextSong();
                    }}
                    disabled={songs.length === 0}
                    className="next-button"
                  >
                    ▶▶
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MusicPlayer;