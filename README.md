**📌 Music Player Overview**
The MusicPlayer component is a React-based music player built with Vite + React + Howler.js for audio playback. It fetches songs from Dropbox via getSongs() and allows users to play, pause, and skip tracks. The playlist is shuffled automatically, and the app ensures a seamless listening experience with intelligent playback handling.

**⚙️ Key Features**
✅ Fetches and plays songs dynamically from an external source (Dropbox).
✅ Shuffle mechanism that prevents repeating the last played song after reshuffling.
✅ Ensures only one song plays at a time to avoid overlapping playback issues.
✅ Auto-advances to the next song when a track finishes playing.
✅ Intuitive Play/Pause button with autoplay on the first user interaction.
✅ Hover-based UI enhancements for displaying track details.

**📂 File Structure**

/src
  ├── /components
  │     ├── MusicPlayer.jsx  <-- Main Music Player Component
  ├── /utils
  │     ├── dropbox.js  <-- Handles song retrieval from Dropbox
  ├── /assets
  │     ├── default-image.png  <-- Default song image
  
**🛠️ How It Works**
Fetching Songs:

getSongs() is called on mount to fetch the list of songs.
If no songs are available, playback is disabled.
Shuffling & Playback Management:

The playlist is shuffled initially and again after all songs are played.
Prevents the last played song from repeating immediately after a shuffle.
Playing a Song:

Uses Howler.js to play the selected song.
Stops the previous song before starting a new one.
The onend event automatically triggers playNextSong().
Skipping to the Next Song:

Ensures no double playback using isNextSongLoading ref.
Selects an unplayed song before reshuffling when necessary.

**🔧 Key Variables & State**
Variable	Type	Description
songs	Array	Stores the list of songs.
currentSong	Object	The currently playing song.
isPlaying	Boolean	Playback state (playing/paused).
playedSongs	Array	Keeps track of played songs to avoid repeats.
isNextSongLoading	Ref	Prevents multiple simultaneous song transitions.

**🎯 Best Practices for Further Development**
🔹 Lazy-load songs in chunks if dealing with a large playlist.
🔹 Improve UI responsiveness for mobile users with touch controls.
🔹 Add a progress bar to show song duration & seek control.
🔹 Persist last played song across sessions using localStorage.

**💡 Troubleshooting & Common Issues**
❌ Issue: Multiple songs playing at the same time.
✅ Solution: isNextSongLoading ref ensures only one transition at a time.

❌ Issue: The same song plays first after reshuffling.
✅ Solution: The first song is swapped with the second if it matches the last played one.

❌ Issue: Songs don’t load.
✅ Solution: Check getSongs() API response and ensure files exist in Dropbox.
