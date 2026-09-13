import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  RotateCcw, RotateCw, Settings, ShieldCheck, ExternalLink, RefreshCw,
  AlertCircle, Film, Tv, Check
} from 'lucide-react';
import { Movie, PlayableFile } from '../types';
import { MovieService } from '../utils/movieService';
import { fetchMovieMetadata, getPlayableFiles, getTrailerFile } from '../utils/archiveMetadata';

interface VideoPlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
  onUpdateWatchProgress?: (movieId: string, position: number, duration: number) => void;
  initialPlayTrailer?: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  movie,
  onClose,
  onUpdateWatchProgress,
  initialPlayTrailer = false,
}) => {
  // Playable files state
  const [playableFiles, setPlayableFiles] = useState<PlayableFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true);
  const [playbackError, setPlaybackError] = useState<boolean>(false);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);

  // Playback control states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showFileMenu, setShowFileMenu] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPipActive, setIsPipActive] = useState<boolean>(false);

  // Resume prompt state
  const [savedResumePosition, setSavedResumePosition] = useState<number>(0);
  const [hasResumedPrompt, setHasResumedPrompt] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Load real metadata and playable files from Internet Archive
  useEffect(() => {
    if (!movie) return;

    let isMounted = true;
    setIsLoadingMetadata(true);
    setPlaybackError(false);
    setUseIframeFallback(false);
    setActiveFileIndex(0);

    fetchMovieMetadata(movie.identifier).then((meta) => {
      if (!isMounted) return;

      if (meta) {
        if (initialPlayTrailer) {
          const trailer = getTrailerFile(meta);
          if (trailer) {
            setPlayableFiles([trailer]);
            setIsLoadingMetadata(false);
            return;
          }
        }

        const files = getPlayableFiles(meta);
        if (files.length > 0) {
          setPlayableFiles(files);
        } else {
          // If no video extension was in metadata.files
          setPlaybackError(true);
        }
      } else {
        setPlaybackError(true);
      }
      setIsLoadingMetadata(false);
    });

    // Check saved watch position
    const savedPos = MovieService.getWatchPosition(movie.id || movie.identifier);
    if (savedPos && savedPos > 30) {
      setSavedResumePosition(savedPos);
      setHasResumedPrompt(true);
    }

    return () => {
      isMounted = false;
    };
  }, [movie, initialPlayTrailer]);

  const activeFile = playableFiles[activeFileIndex] || null;
  const currentVideoSrc = activeFile ? activeFile.url : '';
  const embedPlayerUrl = movie ? `https://archive.org/embed/${movie.identifier}?autoplay=1` : '';
  const sourceArchiveUrl = movie ? `https://archive.org/details/${movie.identifier}` : 'https://archive.org';

  // Handle idle mouse hiding controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowFileMenu(false);
      }
    }, 3500);
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!movie) return;

    if (e.key === 'Escape') {
      if (isFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        onClose();
      }
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowLeft') {
      seekDelta(-10);
    } else if (e.key === 'ArrowRight') {
      seekDelta(10);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      adjustVolume(0.1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      adjustVolume(-0.1);
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    } else if (e.key.toLowerCase() === 'm') {
      toggleMute();
    }
  }, [movie, isPlaying, volume, isMuted, isFullscreen, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Periodic watch progress recording
  useEffect(() => {
    if (!movie || currentTime <= 0) return;
    const timer = setInterval(() => {
      MovieService.updateWatchHistory(movie.id || movie.identifier, currentTime, duration);
      if (onUpdateWatchProgress) {
        onUpdateWatchProgress(movie.id || movie.identifier, currentTime, duration);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [movie, currentTime, duration, onUpdateWatchProgress]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (movie && currentTime > 0) {
        MovieService.updateWatchHistory(movie.id || movie.identifier, currentTime, duration);
      }
    };
  }, [movie, currentTime, duration]);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {
        setPlaybackError(true);
      });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekDelta = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
    setCurrentTime(target);
  };

  const adjustVolume = (delta: number) => {
    const newVol = Math.min(Math.max(0, volume + delta), 1);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (nextMuted) {
      videoRef.current.volume = 0;
    } else {
      videoRef.current.volume = volume || 0.8;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch {
      // PiP not supported or failed
    }
  };

  // Try next playable format when current file fails
  const handleTryAnotherFile = () => {
    if (playableFiles.length > 1) {
      const nextIndex = (activeFileIndex + 1) % playableFiles.length;
      setActiveFileIndex(nextIndex);
      setPlaybackError(false);
      setIsPlaying(false);
      setCurrentTime(0);
    } else {
      // If only one file exists, switch to archive embed fallback
      setUseIframeFallback(true);
      setPlaybackError(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fade-in">
      {/* Player Container */}
      <div 
        ref={playerContainerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col group select-none"
      >
        {/* Top Floating Bar */}
        <div 
          className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-30 flex items-center justify-between transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-blue-900/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-blue-500/30 text-blue-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{movie.copyrightStatus}</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-sm sm:text-base line-clamp-1 drop-shadow-md">
                {movie.title}
              </h2>
              <p className="text-slate-400 text-xs flex items-center gap-2">
                <span>{movie.year}</span>
                {activeFile && (
                  <>
                    <span>•</span>
                    <span className="text-blue-400 font-medium">{activeFile.formatLabel}</span>
                    <span>•</span>
                    <span>{activeFile.sizeFormatted}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Open Source Button */}
            <a
              href={sourceArchiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Open verified archival item on archive.org"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">OPEN SOURCE</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
              title="Close Player (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingMetadata && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center p-6 z-20">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-white font-bold text-lg">Retrieving Archival Video Stream</p>
            <p className="text-slate-400 text-xs mt-1 max-w-md">
              Accessing official Internet Archive metadata for &quot;{movie.title}&quot;...
            </p>
          </div>
        )}

        {/* Resume Prompt Toast */}
        {hasResumedPrompt && !playbackError && (
          <div className="absolute top-18 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-blue-500/40 text-white px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3">
            <div className="text-xs">
              <span className="text-slate-300">Resume playback at </span>
              <span className="text-blue-400 font-bold">{formatTime(savedResumePosition)}</span>?
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = savedResumePosition;
                  }
                  setCurrentTime(savedResumePosition);
                  setHasResumedPrompt(false);
                  if (videoRef.current) videoRef.current.play().catch(() => {});
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={() => setHasResumedPrompt(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Main Video Element or Error / Fallback View */}
        {!useIframeFallback && !playbackError && currentVideoSrc ? (
          <video
            ref={videoRef}
            src={currentVideoSrc}
            controls={false}
            playsInline
            preload="metadata"
            className="w-full h-full object-contain bg-black"
            onClick={togglePlay}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={() => {
              console.warn(`[CineVault] HTML5 video error on source: ${currentVideoSrc}`);
              setPlaybackError(true);
            }}
          />
        ) : useIframeFallback ? (
          /* Archive Official Responsive Embed Player */
          <div className="relative w-full h-full bg-black">
            <iframe
              src={embedPlayerUrl}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              title={`Streaming ${movie.title} from Internet Archive`}
            />
          </div>
        ) : (
          /* Required Error Handling UI: DO NOT show a blank player! */
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              Playback unavailable for this file.
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
              The direct browser video stream could not be loaded. You can try another format from the archival metadata or access the official item record on archive.org.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {playableFiles.length > 1 && (
                <button
                  type="button"
                  onClick={handleTryAnotherFile}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-900/50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>TRY ANOTHER FILE ({activeFileIndex + 1}/{playableFiles.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setUseIframeFallback(true);
                  setPlaybackError(false);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Tv className="w-4 h-4 text-blue-400" />
                <span>TRY ARCHIVE EMBED</span>
              </button>

              <a
                href={sourceArchiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-800 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <span>OPEN SOURCE</span>
              </a>
            </div>
          </div>
        )}

        {/* Custom Video Player Controls Overlay */}
        {!useIframeFallback && !playbackError && (
          <div 
            className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-30 space-y-3 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Scrub Bar */}
            <div className="relative flex items-center group/scrub">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2.5 transition-all"
                title="Seek video"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              {/* Left Controls: Play/Pause, Rewind, Forward, Volume, Elapsed Time */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-blue-900/50"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
                </button>

                <button
                  type="button"
                  onClick={() => seekDelta(-10)}
                  className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Rewind 10s (Left Arrow)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => seekDelta(10)}
                  className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Forward 10s (Right Arrow)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-2 group/volume ml-1">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    title="Volume (Up/Down Arrow)"
                  />
                </div>

                {/* Timestamp */}
                <div className="text-xs text-slate-300 font-mono ml-2">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-slate-500"> / </span>
                  <span className="text-slate-400">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Controls: Formats, Speed, PiP, Fullscreen */}
              <div className="flex items-center gap-2">
                {/* Available Files Selector */}
                {playableFiles.length > 1 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFileMenu(!showFileMenu);
                        setShowSpeedMenu(false);
                      }}
                      className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                      title="Select video file"
                    >
                      <Film className="w-3.5 h-3.5 text-blue-400" />
                      <span>{activeFile ? activeFile.format.toUpperCase() : 'Format'}</span>
                    </button>

                    {showFileMenu && (
                      <div className="absolute bottom-full right-0 mb-2 w-56 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 z-40 backdrop-blur-md">
                        <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Verified Files ({playableFiles.length})
                        </div>
                        {playableFiles.map((file, idx) => (
                          <button
                            key={file.name}
                            type="button"
                            onClick={() => {
                              setActiveFileIndex(idx);
                              setShowFileMenu(false);
                              setPlaybackError(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              idx === activeFileIndex
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span className="truncate max-w-[140px]">{file.formatLabel}</span>
                            <span className="text-[10px] opacity-80">{file.sizeFormatted}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Playback Speed Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSpeedMenu(!showSpeedMenu);
                      setShowFileMenu(false);
                    }}
                    className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold px-2 py-1 rounded-md border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                    title="Playback Speed"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{playbackRate}x</span>
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-28 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 z-40 backdrop-blur-md">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleSpeedChange(rate)}
                          className={`w-full text-left px-2.5 py-1 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            rate === playbackRate
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span>{rate}x</span>
                          {rate === playbackRate && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Picture in Picture */}
                {typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && (
                  <button
                    type="button"
                    onClick={togglePip}
                    className={`text-slate-300 hover:text-white p-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                      isPipActive ? 'text-blue-400' : ''
                    }`}
                    title="Picture-in-Picture"
                  >
                    <Tv className="w-4 h-4" />
                  </button>
                )}

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="text-slate-300 hover:text-white p-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
