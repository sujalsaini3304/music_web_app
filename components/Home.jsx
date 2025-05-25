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
} from "lucide-react";
import axios from "axios";
import thumbnailImage from "/music.png";

const Home = () => {
  const [tracks, setTracks] = useState([]);
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

  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const SERVER_API = "https://python-render-server.onrender.com/api/get/music_data";
  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      const Tracks = [];
      try {
        const data = await axios.get(SERVER_API);
        if (data) {
          data.data.forEach((element) => {
            Tracks.push({
              ...element,
              id: element._id,
              url: element.cloudinary_url,
              thumbnail: thumbnailImage,
            });
          });
        }

        setTimeout(() => {
          setTracks(Tracks);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching tracks:", error);
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const playTrack = (track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
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

  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-col  md:flex-row gap-4 md:gap-4 ">
            <div className="flex items-center gap-4">
              {/* <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Music className="w-8 h-8 text-white" />
              </div> */}
              <div>
                <img className="w-16 h-16" src="/icon.png" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Music Player</h1>
                <p className="text-gray-300">
                  Discover and enjoy your favorite tracks
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tracks, artists, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Music List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Your Music Library
              </h2>

              {filteredTracks.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No tracks found</p>
                </div>
              ) : (
                <div className=" music-library mt-2 max-h-[400px] overflow-y-auto pr-2  space-y-3">
                  {filteredTracks.map((track) => (
                    <div
                      key={track.id}
                      className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                        currentTrack?.id === track.id
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50"
                          : "bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20"
                      }`}
                      onClick={() => playTrack(track)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={track.thumbnail}
                            alt={track.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {currentTrack?.id === track.id && isPlaying ? (
                              <Pause className="w-6 h-6 text-white" />
                            ) : (
                              <Play className="w-6 h-6 text-white" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">
                            {track.title}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            {track.artist}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {track.genre} • {formatTime(track.duration)}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track.id);
                          }}
                          className={`transition-colors ${
                            likedTracks.has(track.id)
                              ? "text-red-500"
                              : "text-gray-400 hover:text-red-400"
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              likedTracks.has(track.id) ? "fill-current" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Player Controls */}
          <div className="space-y-6">
            {/* Now Playing */}
            {currentTrack && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Now Playing
                </h3>
                <div className="text-center">
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="w-48 h-48 rounded-2xl object-cover mx-auto mb-4 shadow-2xl"
                  />
                  <h4 className="text-xl font-bold text-white mb-1">
                    {currentTrack.title}
                  </h4>
                  <p className="text-gray-300 mb-4">{currentTrack.artist}</p>

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
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => setIsShuffled(!isShuffled)}
                      className={`p-2 rounded-lg transition-colors ${
                        isShuffled
                          ? "text-purple-400 bg-purple-500/20"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Shuffle className="w-5 h-5" />
                    </button>

                    <button
                      onClick={playPreviousTrack}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <SkipBack className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() =>
                        isPlaying ? pauseTrack() : playTrack(currentTrack)
                      }
                      className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </button>

                    <button
                      onClick={playNextTrack}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <SkipForward className="w-6 h-6" />
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
                      <Repeat className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Library Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Tracks</span>
                  <span className="text-white font-medium">
                    {tracks.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Liked Songs</span>
                  <span className="text-red-400 font-medium">
                    {likedTracks.size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Duration</span>
                  <span className="text-white font-medium">
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
     <div className="pb-6">
       <div className="text-sm font-bold text-white text-center">
        &#169; copyright 2025-2050{" "}
      </div>
      <div className="text-sm font-bold text-white text-center">
        Developed by - Sujal Kumar Saini
      </div>
     </div>
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
