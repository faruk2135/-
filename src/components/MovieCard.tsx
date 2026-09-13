import React, { useState, useEffect } from 'react';
import { Play, Download, Plus, Check, Star, Clock, Info, ExternalLink, Film, Share2 } from 'lucide-react';
import { Movie } from '../types';
import { fetchMovieMetadata, getAlternativePoster } from '../utils/archiveMetadata';

interface MovieCardProps {
  movie: Movie;
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  isInMyList: boolean;
  onToggleMyList: (movie: Movie) => void;
  watchProgress?: number; // 0 to 100 percentage if in watch history
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onWatch,
  onDownload,
  onOpenDetails,
  isInMyList,
  onToggleMyList,
  watchProgress,
}) => {
  // Primary image url: https://archive.org/services/img/{identifier}
  const primaryImgUrl = `https://archive.org/services/img/${movie.identifier}`;
  const [currentImgSrc, setCurrentImgSrc] = useState<string>(primaryImgUrl);
  const [hasAttemptedAlt, setHasAttemptedAlt] = useState(false);
  const [useCinematicArt, setUseCinematicArt] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // If movie changes, reset state
  useEffect(() => {
    setCurrentImgSrc(`https://archive.org/services/img/${movie.identifier}`);
    setHasAttemptedAlt(false);
    setUseCinematicArt(false);
    setImageLoaded(false);
  }, [movie.identifier]);

  // Handle primary image error: fetch metadata and look for movie-specific image file
  const handleImageError = async () => {
    if (!hasAttemptedAlt) {
      setHasAttemptedAlt(true);
      try {
        const metadata = await fetchMovieMetadata(movie.identifier);
        if (metadata) {
          const altImg = getAlternativePoster(metadata);
          if (altImg && altImg !== currentImgSrc) {
            setCurrentImgSrc(altImg);
            return;
          }
        }
      } catch {
        // Fallback to stylized cinematic art
      }
    }
    // If no alternative movie image exists or failed, show stylized cinematic thumbnail
    setUseCinematicArt(true);
  };

  const mainGenre = movie.genres && movie.genres.length > 0 ? movie.genres[0] : 'Classic';
  const sourceArchiveUrl = `https://archive.org/details/${movie.identifier}`;

  // Unique thematic gradient per genre for cinematic thumbnail
  const getGenreGradient = (genre: string) => {
    const g = genre.toLowerCase();
    if (g.includes('horror')) return 'from-red-950 via-slate-900 to-black border-red-900/40 text-red-400';
    if (g.includes('sci-fi')) return 'from-cyan-950 via-slate-900 to-black border-cyan-900/40 text-cyan-400';
    if (g.includes('comedy')) return 'from-amber-950 via-slate-900 to-black border-amber-900/40 text-amber-400';
    if (g.includes('noir') || g.includes('crime')) return 'from-zinc-900 via-neutral-950 to-black border-zinc-700/40 text-zinc-300';
    if (g.includes('romance')) return 'from-rose-950 via-slate-900 to-black border-rose-900/40 text-rose-400';
    if (g.includes('action') || g.includes('adventure')) return 'from-blue-950 via-slate-900 to-black border-blue-900/40 text-blue-400';
    return 'from-slate-900 via-blue-950/80 to-black border-blue-800/40 text-blue-400';
  };

  const genreTheme = getGenreGradient(mainGenre);

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `🎬 Watch "${movie.title} (${movie.year})" free on CineVault:\nhttps://archive.org/details/${movie.identifier}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      id={`movie-card-${movie.identifier || movie.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-slate-900/90 border border-slate-800/80 shadow-md hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] select-none"
    >
      {/* Poster Container - 2:3 aspect ratio */}
      <div 
        className="relative w-full aspect-[2/3] overflow-hidden bg-slate-950 cursor-pointer"
        onClick={() => onOpenDetails(movie)}
      >
        {/* Skeleton loading background */}
        {!imageLoaded && !useCinematicArt && (
          <div className="absolute inset-0 bg-slate-900 animate-pulse" />
        )}

        {/* Real Movie Poster or Stylized Cinematic Illustrated Poster */}
        {!useCinematicArt ? (
          <img
            src={currentImgSrc}
            alt={movie.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          /* Guaranteed Cinematic Art Thumbnail when archive image is unavailable */
          <div className={`w-full h-full bg-gradient-to-b ${genreTheme} border flex flex-col justify-between p-4 text-center select-none`}>
            {/* Top brand header */}
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase pt-1">
              <span className="opacity-90">{mainGenre}</span>
              <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/60 text-white font-mono">
                {movie.year}
              </span>
            </div>

            {/* Middle Iconic Visual Emblem */}
            <div className="my-auto px-2 py-3 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-3 shadow-inner">
                <Film className="w-6 h-6 text-white/90" />
              </div>
              <h4 className="text-white font-black text-sm line-clamp-3 leading-snug tracking-tight drop-shadow-md">
                {movie.title}
              </h4>
              {movie.director && (
                <p className="text-slate-400 text-[10px] mt-1 italic line-clamp-1">
                  Dir: {movie.director}
                </p>
              )}
            </div>

            {/* Bottom tag */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2">
              <span className="font-semibold text-slate-300">{movie.copyrightStatus}</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                {movie.rating || '8.5'}
              </span>
            </div>
          </div>
        )}

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {movie.rightsVerified && (
              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide shadow-sm">
                FREE
              </span>
            )}
            {movie.copyrightStatus === 'Public Domain' && (
              <span className="bg-emerald-700/90 text-emerald-100 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                PD
              </span>
            )}
            {movie.copyrightStatus === 'Creative Commons' && (
              <span className="bg-amber-600/90 text-amber-100 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                CC
              </span>
            )}
            {movie.copyrightStatus === 'CC0' && (
              <span className="bg-teal-600/90 text-teal-100 text-[9px] font-bold px-1.5 py-0.5 rounded border border-teal-500/30">
                CC0
              </span>
            )}
          </div>
          {movie.quality && (
            <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700/60">
              {movie.quality}
            </span>
          )}
        </div>

        {/* Center Circular Play Button (Appears on Hover) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <button
            type="button"
            className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-900/60 transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 border border-blue-300/40 pointer-events-auto hover:bg-blue-500 hover:scale-110 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onWatch(movie);
            }}
            title="Watch Now"
          >
            <Play className="w-5 h-5 ml-0.5 fill-white" />
          </button>
        </div>

        {/* Watch Progress Bar (if in history) */}
        {typeof watchProgress === 'number' && watchProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800 z-10 pointer-events-none">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${Math.min(100, Math.max(5, watchProgress))}%` }}
            />
          </div>
        )}

        {/* Quick Action overlay buttons on hover */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-7 h-7 rounded-full bg-emerald-600/80 hover:bg-emerald-500 text-white flex items-center justify-center text-xs backdrop-blur-md transition-all cursor-pointer shadow-md"
            title="Share on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* My List Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMyList(movie);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs backdrop-blur-md transition-all cursor-pointer ${
              isInMyList
                ? 'bg-blue-600 text-white border border-blue-400'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/70 hover:bg-slate-800'
            }`}
            title={isInMyList ? 'Remove from My List' : 'Add to My List'}
          >
            {isInMyList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>

          {/* Details Modal */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(movie);
            }}
            className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 flex items-center justify-center text-xs backdrop-blur-md transition-all cursor-pointer"
            title="Movie Details & Legal Rights"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Information Bottom Body */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2.5 bg-slate-900/95 border-t border-slate-800/40">
        <div>
          {/* Title */}
          <h3
            onClick={() => onOpenDetails(movie)}
            className="text-white font-bold text-sm leading-snug line-clamp-1 group-hover:text-blue-400 transition-colors cursor-pointer"
            title={movie.title}
          >
            {movie.title}
          </h3>

          {/* Meta: Year, Genre, Runtime, Rating */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>{movie.year}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-slate-300 font-medium">{mainGenre}</span>
              {movie.runtime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="flex items-center gap-0.5 text-slate-400">
                    <Clock className="w-2.5 h-2.5" />
                    {movie.runtime}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{movie.rating || '8.5'}</span>
            </div>
          </div>
        </div>

        {/* Buttons: WATCH & DOWNLOAD (or OPEN SOURCE) */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onWatch(movie)}
            className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs py-1.5 px-2 rounded-lg transition-all shadow-sm shadow-blue-900/50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>WATCH</span>
          </button>

          {movie.downloadAllowed && movie.rightsVerified ? (
            <button
              type="button"
              onClick={() => onDownload(movie)}
              className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-semibold text-xs py-1.5 px-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              title="Legally download source archive file"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>DOWNLOAD</span>
            </button>
          ) : (
            <a
              href={sourceArchiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-semibold text-xs py-1.5 px-2 rounded-lg border border-slate-700 transition-all cursor-pointer"
              title="Open verified archival item on archive.org"
            >
              <ExternalLink className="w-3 h-3 text-slate-400" />
              <span className="truncate">SOURCE</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
