import { useEffect } from "react";
import axios from "axios";
import useStore from "../store";
import thumbnailImage from "/music.png";

export default function useFetchTracks() {
  const playlists = useStore((state) => state.playlists);
  const setPlaylists = useStore((state) => state.setPlaylists);
  const {endpoint} = useStore();
  const SERVER_API = `${endpoint}/api/get/music_data`;
  useEffect(() => {
    if (playlists.length === 0) {
      const fetchTracks = async () => {
        try {
          const res = await axios.get(SERVER_API);
          if (res?.data) {
            const tracks = res.data.map((element) => ({
              ...element,
              id: element._id,
              url: element.cloudinary_url,
              thumbnail: thumbnailImage,
            }));
            setPlaylists(tracks);
          }
        } catch (error) {
          console.error("Failed to fetch tracks:", error);
        }
      };
      fetchTracks();
    }
  }, [playlists.length, setPlaylists]);
}
