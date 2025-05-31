import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Search,
  Heart,
  Shuffle,
  Repeat,
  Music,
  Music2,
} from "lucide-react";
import axios from "axios";
import thumbnailImage from "/music.png";
import { useNavigate } from "react-router-dom";
import useFetchTracks from "./useFetchTracks";
import useStore from "../store";

const Home = () => {
  const navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [likedTracks, setLikedTracks] = useState(new Set());
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none"); // none, one, all
  const [loading, setLoading] = useState(true);
  const [favSong, setFavSong] = useState([]);
  const { playlists, user_email } = useStore();
  const { favourite_songs: tracks, setFavourite_songs, login , endpoint} = useStore();

  useEffect(() => {
    if (!login) {
      return navigate("/");
    }
  }, []);

  useFetchTracks();

  useEffect(() => {
    if (playlists.length != 0) {
      setLoading(false);
    }
  }, [playlists.length]);

  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const playTrack = (track) => {
    if (currentTrack?.id === track.id) {
      // Same track
      if (isPlaying) {
        pauseTrack();
      } else {
        audioRef.current.play(); // Resume from current time
        setIsPlaying(true);
      }
    } else {
      // New track
      setCurrentTrack(track);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const playNextTrack = () => {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack.id
    );
    let nextIndex;

    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }

    playTrack(tracks[nextIndex]);
  };

  const playPreviousTrack = () => {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack.id
    );
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;

    playTrack(tracks[prevIndex]);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnd = () => {
    if (repeatMode === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeatMode === "all" || tracks.length > 1) {
      playNextTrack();
    } else {
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleLike = (trackId) => {
    setLikedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    console.log("Fetching favorites for:", user_email, login);
    if (playlists.length !== 0 && login) {
      const fetchFavouriteSongs = async () => {
        try {
          const response = await axios.get(
            `${endpoint}/api/music-web-app/fetch/favourite/user/song/`,
            {
              params: { email: user_email },
            }
          );

          console.log(response.data.Data);
          const favoriteIds = response.data.Data; // Assuming it's an array of IDs

          // Filter songs from `playlists` using the IDs
          const filteredTracks = playlists.filter((track) =>
            favoriteIds.includes(track._id)
          );

          setFavourite_songs(filteredTracks);
          setFavSong(filteredTracks);
          console.log("Favourite tracks:", filteredTracks);
        } catch (error) {
          console.error("Error fetching favourite songs:", error);
        }
      };

      fetchFavouriteSongs();
    }
  }, [playlists, login]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnd}
        volume={volume}
      />

      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Header */}
          <div className="block md:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <img
                    className="w-12 h-12"
                    src="/icon.png"
                    alt="Music Player Icon"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white ">Music Player</h1>
                  <p className="text-gray-300 text-sm text-center">
                    Discover and enjoy your favorite tracks
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/search")}
                className="bg-white/10 backdrop-blur-sm rounded-lg flex items-center text-white font-medium border border-white/20 px-3 py-2 gap-2 hover:bg-white/20 transition-all duration-200 text-sm"
              >
                <Music2 className="w-4 h-4" />
                <span className="hidden xs:inline">Playlist</span>
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img
                  className="w-16 h-16"
                  src="/icon.png"
                  alt="Music Player Icon"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Music Player</h1>
                <p className="text-gray-300">
                  Discover and enjoy your favorite tracks
                </p>
              </div>
            </div>

            {/* Navigation Button */}
            <button
              onClick={() => navigate("/search")}
              className="bg-white/10 backdrop-blur-sm rounded-xl flex justify-center items-center text-white font-semibold border border-white/20 px-4 py-2 gap-2 hover:bg-white/20 transition-all duration-200 transform hover:scale-105"
            >
              <span>Go to Playlist</span>
              <Music2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          {/* Music List - Takes full width on smaller screens, 2 columns on xl */}
          <div className="xl:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
                Favourite Songs
              </h2>

              {favSong.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Music className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-base md:text-lg">
                    No favourite songs yet
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Add some songs to your favourites to see them here
                  </p>
                </div>
              ) : (
                <div className="music-library max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2 space-y-3">
                  {favSong.map((track) => (
                    <div
                      key={track._id}
                      className={`group p-3 md:p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                        currentTrack?._id === track._id
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-lg"
                          : "bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20"
                      }`}
                      onClick={() => playTrack(track)}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative">
                          <img
                            src={track.thumbnail}
                            alt={track.title}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {currentTrack?._id === track._id && isPlaying ? (
                              <Pause className="w-4 h-4 md:w-6 md:h-6 text-white" />
                            ) : (
                              <Play className="w-4 h-4 md:w-6 md:h-6 text-white" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate text-sm md:text-base">
                            {track.title}
                          </h3>
                          <p className="text-gray-300 text-xs md:text-sm truncate">
                            {track.artist}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {track.genre} • {formatTime(track.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Player Controls & Stats */}
          <div className="space-y-6">
            {/* Now Playing */}
            {currentTrack && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 md:p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Now Playing
                </h3>
                <div className="text-center">
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="w-40 h-40 md:w-48 md:h-48 rounded-2xl object-cover mx-auto mb-4 shadow-2xl"
                  />
                  <h4 className="text-lg md:text-xl font-bold text-white mb-1 truncate">
                    {currentTrack.title}
                  </h4>
                  <p className="text-gray-300 mb-4 truncate">
                    {currentTrack.artist}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div
                      ref={progressRef}
                      onClick={handleProgressClick}
                      className="w-full h-2 bg-gray-700 rounded-full cursor-pointer mb-2"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
                        style={{
                          width: `${
                            duration > 0 ? (currentTime / duration) * 100 : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
                    <button
                      onClick={() => setIsShuffled(!isShuffled)}
                      className={`p-2 rounded-lg transition-colors ${
                        isShuffled
                          ? "text-purple-400 bg-purple-500/20"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    <button
                      onClick={playPreviousTrack}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <button
                      onClick={() =>
                        isPlaying ? pauseTrack() : playTrack(currentTrack)
                      }
                      className="p-3 md:p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      ) : (
                        <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-1" />
                      )}
                    </button>

                    <button
                      onClick={playNextTrack}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <button
                      onClick={() => {
                        const modes = ["none", "one", "all"];
                        const currentIndex = modes.indexOf(repeatMode);
                        setRepeatMode(modes[(currentIndex + 1) % modes.length]);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        repeatMode !== "none"
                          ? "text-purple-400 bg-purple-500/20"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Repeat className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="flex-1 h-2 rounded-lg bg-gray-700 appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 md:p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Library Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm md:text-base">
                    Total Tracks
                  </span>
                  <span className="text-white font-medium text-sm md:text-base">
                    {tracks.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm md:text-base">
                    Favourite Songs
                  </span>
                  <span className="text-red-400 font-medium text-sm md:text-base">
                    {favSong.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm md:text-base">
                    Total Duration
                  </span>
                  <span className="text-white font-medium text-sm md:text-base">
                    {formatTime(
                      tracks.reduce((acc, track) => acc + track.duration, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-8 p-4 md:p-6">
        <div className="text-center">
          <div className="text-xs md:text-sm font-bold text-white mb-1">
            © Copyright 2025-2050
          </div>
          <div className="text-xs md:text-sm font-bold text-white">
            Developed by - Sujal Kumar Saini
          </div>
        </div>
      </footer>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: none;
        }

        /* Hide scrollbar but keep scroll functionality */
        .music-library::-webkit-scrollbar {
          display: none;
        }

        .music-library {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;     /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default Home;
