import React, { useEffect, useState } from "react";
import { Play, Pause, Heart, Music, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useStore from "../store";
import useFetchTracks from "./useFetchTracks";
import axios from "axios";

const SearchPage = () => {
  const {
    playlists,
    currentTrack,
    isPlaying,
    setCurrentTrack,
    setIsPlaying,
    user,
  } = useStore();
  const navigate = useNavigate();
  const { user_email, favourite_songs, login , endpoint } = useStore();

   useEffect(()=>{
     if (!login) {
       return navigate("/");
     }
   },[])
 
  useFetchTracks();
  const [searchQuery, setSearchQuery] = useState("");
  const [likedTracks, setLikedTracks] = useState(new Set());

  useEffect(() => {
    if (favourite_songs && Array.isArray(favourite_songs)) {
      const initialLiked = new Set(
        favourite_songs.map((song) =>
          typeof song === "object" ? song._id : song
        )
      );
      setLikedTracks(initialLiked);
    }
  }, [favourite_songs]);

  const toggleLike = async (trackId) => {
    setLikedTracks((prev) => {
      const updated = new Set(prev);
      updated.has(trackId) ? updated.delete(trackId) : updated.add(trackId);
      return updated;
    });

    try {
      const response = await axios.post(
        `${endpoint}/api/music-web-app/update/favourite/user/song/`,
        {
          email: user_email,
          song_id: trackId,
        }
      );

      console.log("Response from API:", response.data);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredTracks = playlists.filter((track) =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="lg:col-span-2 flex justify-center">
        <div className="w-full max-w-230 bg-white/10 backdrop-blur-sm border border-white/20 p-3">
          <h2 className="text-2xl font-bold text-white mb-3">Songs</h2>

          {/* Search input */}
          <div className="relative max-w-md w-full mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tracks, artists, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* No results */}
          {filteredTracks.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No tracks found</p>
            </div>
          ) : (
            filteredTracks.map((track) => (
              <div
                key={track.id}
                className={`group mb-2 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  currentTrack?.id === track.id
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50"
                    : "bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20"
                }`}
                onClick={() => {
                  setCurrentTrack(track);
                  setIsPlaying(true);
                  navigate("/player", { state: { tracks: playlists } });
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {currentTrack?.id === track.id ? (
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
                    <p className="text-gray-300 text-sm">{track.artist}</p>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
