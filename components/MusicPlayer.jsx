import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useStore from "../store";

const MusicPlayer = () => {
  const { currentTrack, setCurrentTrack, login, isPlaying, setIsPlaying } =
    useStore();
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const location = useLocation();
  const { tracks = [], currentTrack: initialTrack } = location.state || {};

  useEffect(()=>{
    if (!login) {
      return navigate("/");
    }
  },[])


  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  // Handle track change
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrack]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const playTrack = (track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const playNextTrack = () => {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack.id
    );
    let nextIndex;

    if (isShuffled) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentIndex && tracks.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }

    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const playPreviousTrack = () => {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack.id
    );
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;

    setCurrentTrack(tracks[prevIndex]);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
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
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audioRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className=" flex justify-center   items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnd}
      />

      {currentTrack && (
        <div className=" max-w-100  mx-4 sm:mx-0   w-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 pt-10">
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
                onClick={() => (isPlaying ? pauseTrack() : setIsPlaying(true))}
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
                className="slider h-2 bg-gray-700 appearance-none cursor-pointer  rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      )}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
        }
        
      

      `}</style>
    </div>
  );
};

export default MusicPlayer;
