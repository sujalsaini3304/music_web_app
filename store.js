import { LogIn } from "lucide-react";
import { create } from "zustand";

const useStore = create((set) => ({
  endpoint : "https://docker-python-server.onrender.com",
  user_email:null,
  user: null,
  login : false ,
  setLogin: (state) => set({ login: state }),
  logout: () => set({ user: null }),
  playlists: [],
  favourite_songs:[],
  setFavourite_songs: (state) => set({ favourite_songs: state }),
  currentTrack: null,
  isPlaying: false,
  setPlaylists: (list) => set({ playlists: list }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (status) => set({ isPlaying: status }),
  setEmailFunc: (status) => set({ user_email: status }),
}));

export default useStore;
