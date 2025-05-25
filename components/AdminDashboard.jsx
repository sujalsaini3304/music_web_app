import React, { useState, useRef } from 'react';
import { Upload, Music, X, Check, AlertCircle, Play, Pause } from 'lucide-react';

const AdminDashboard = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  // Server configuration
  const SERVER_URL = 'https://python-server-pearl.vercel.app'; // Replace with your Python server URL

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const audioFiles = selectedFiles.filter(file => file.type.startsWith('audio/'));
    
    const newFiles = audioFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      metadata: null,
      serverId: null
    }));

    // Extract metadata for each file
    newFiles.forEach(fileObj => {
      extractMetadata(fileObj.file).then(metadata => {
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, metadata } : f
        ));
      });
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const extractMetadata = (file) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        const metadata = {
          duration: Math.round(audio.duration) || 0,
          title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ').replace(/-/g, ' '),
          artist: extractArtistFromFilename(file.name) || "Unknown Artist",
          genre: extractGenreFromFilename(file.name) || "Unknown Genre",
          album: "Unknown Album",
          year: new Date().getFullYear(),
          fileSize: file.size,
          format: file.name.split('.').pop().toLowerCase(),
          bitRate: null, // Will be detected by server
          sampleRate: null // Will be detected by server
        };
        URL.revokeObjectURL(url);
        resolve(metadata);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve({
          duration: 0,
          title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ').replace(/-/g, ' '),
          artist: extractArtistFromFilename(file.name) || "Unknown Artist",
          genre: extractGenreFromFilename(file.name) || "Unknown Genre",
          album: "Unknown Album",
          year: new Date().getFullYear(),
          fileSize: file.size,
          format: file.name.split('.').pop().toLowerCase(),
          bitRate: null,
          sampleRate: null
        });
      });
      
      audio.src = url;
    });
  };

  const extractArtistFromFilename = (filename) => {
    // Try to extract artist from common patterns like "Artist - Song.mp3"
    const patterns = [
      /^([^-]+)\s*-\s*[^-]+\./i, // "Artist - Song.ext"
      /^([^_]+)_[^_]+\./i,       // "Artist_Song.ext"
    ];
    
    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  };

  const extractGenreFromFilename = (filename) => {
    // Try to extract genre from filename or folder structure
    const genres = ['rock', 'pop', 'jazz', 'classical', 'electronic', 'hip-hop', 'country', 'blues'];
    const lowerFilename = filename.toLowerCase();
    
    for (const genre of genres) {
      if (lowerFilename.includes(genre)) {
        return genre.charAt(0).toUpperCase() + genre.slice(1);
      }
    }
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadToServer = async (fileObj) => {
    const formData = new FormData();
    formData.append('audio_file', fileObj.file);
    
    // Send metadata as JSON string
    const metadata = {
      ...fileObj.metadata,
      originalFilename: fileObj.file.name
    };
    formData.append('metadata', JSON.stringify(metadata));

    try {
      const response = await fetch(`${SERVER_URL}/api/upload/music`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.status !== 'pending' || !file.metadata) continue;

      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === file.id && f.progress < 90) {
              return { ...f, progress: f.progress + Math.random() * 20 };
            }
            return f;
          }));
        }, 500);

        const result = await uploadToServer(file);
        clearInterval(progressInterval);

        // Update with success
        setFiles(prev => prev.map(f => 
          f.id === file.id ? {
            ...f,
            status: 'completed',
            progress: 100,
            serverId: result.id,
            cloudinaryUrl: result.cloudinary_url
          } : f
        ));

        // Add to uploaded tracks
        setUploadedTracks(prev => [...prev, {
          id: result.id,
          name: result.title,
          artist: result.artist,
          genre: result.genre,
          album: result.album,
          url: result.cloudinary_url,
          duration: result.duration,
          uploadedAt: result.created_at || new Date().toISOString()
        }]);

      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'error', 
            progress: 0,
            error: error.message 
          } : f
        ));
      }
    }
    
    setUploading(false);
  };

  const playTrack = (track) => {
    if (currentlyPlaying === track.id) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioRef.current && track.url) {
        audioRef.current.src = track.url;
        audioRef.current.play();
        setCurrentlyPlaying(track.id);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Music className="w-5 h-5 text-gray-400" />;
    }
  };

  const canUpload = files.some(f => f.status === 'pending' && f.metadata);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />
      
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Music Upload Dashboard</h1>
              <p className="text-gray-300">Upload and manage your music tracks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Upload Section */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Music Files</h2>
              
              {/* Drag & Drop Area */}
              <div 
                className="border-2 border-dashed border-purple-400/50 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer bg-gradient-to-br from-purple-500/10 to-pink-500/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Drop your music files here</p>
                <p className="text-gray-300 mb-4">or click to browse</p>
                <p className="text-gray-400 text-sm mb-4">
                  Supported formats: MP3, WAV, FLAC, AAC, OGG
                </p>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Selected Files ({files.length})</h3>
                    <button
                      onClick={uploadFiles}
                      disabled={uploading || !canUpload}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Uploading...' : 'Upload All'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getStatusIcon(file.status)}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{file.name}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                <span>{formatFileSize(file.size)}</span>
                                {file.metadata && (
                                  <>
                                    <span>•</span>
                                    <span>{file.metadata.title}</span>
                                    <span>•</span>
                                    <span>{file.metadata.artist}</span>
                                    {file.metadata.duration > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>{formatDuration(file.metadata.duration)}</span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                              {file.error && (
                                <p className="text-red-400 text-xs mt-1">❌ {file.error}</p>
                              )}
                              {!file.metadata && file.status === 'pending' && (
                                <p className="text-yellow-400 text-xs mt-1">📊 Extracting metadata...</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {file.status === 'uploading' && (
                          <div className="mt-3">
                            <div className="bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(file.progress, 100)}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{Math.round(file.progress)}% uploaded</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Preview */}
            {files.some(f => f.metadata) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Metadata Preview</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {files.filter(f => f.metadata).map((file) => (
                    <div key={file.id} className="bg-black/20 rounded-lg p-3 border border-white/10">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Title:</span>
                          <span className="text-white ml-2">{file.metadata.title}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Artist:</span>
                          <span className="text-white ml-2">{file.metadata.artist}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Genre:</span>
                          <span className="text-white ml-2">{file.metadata.genre}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Format:</span>
                          <span className="text-white ml-2">{file.metadata.format.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Tracks Section */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Uploaded Tracks</h2>
              
              {uploadedTracks.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No tracks uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {uploadedTracks.map((track) => (
                    <div key={track.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{track.name}</p>
                          <p className="text-gray-400 text-sm">{track.artist} • {track.genre}</p>
                          <p className="text-gray-500 text-xs">
                            {track.duration ? formatDuration(track.duration) : 'Unknown duration'}
                          </p>
                        </div>
                        <button
                          onClick={() => playTrack(track)}
                          className="text-purple-400 hover:text-purple-300 transition-colors ml-2"
                        >
                          {currentlyPlaying === track.id ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Server Connection Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Server Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Server URL</span>
                  <span className="text-white font-mono text-sm">{SERVER_URL}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Upload Endpoint</span>
                  <span className="text-white font-mono text-sm">/api/upload-music</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upload Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Tracks</span>
                  <span className="text-white font-medium">{uploadedTracks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Pending</span>
                  <span className="text-yellow-400 font-medium">
                    {files.filter(f => f.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Completed</span>
                  <span className="text-green-400 font-medium">
                    {files.filter(f => f.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Failed</span>
                  <span className="text-red-400 font-medium">
                    {files.filter(f => f.status === 'error').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;