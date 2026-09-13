import React, { useState, useEffect, useCallback } from 'react';
import { Play, Download, Plus, Check, ChevronLeft, ChevronRight, Star, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Movie } from '../types';

interface HeroSliderProps {
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  myListIds: string[];
  onToggleMyList: (movie: Movie) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  movies,
  onWatch,
  onDownload,
  onOpenDetails,
  myListIds,
  onToggleMyList,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Take the top featured movies (e.g. 6-8)
  const heroMovies = movies.slice(0, 8);
  const currentMovie = heroMovies[currentIndex] || heroMovies[0];

  const handleNext = useCallback(() => {
    if (heroMovies.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
  }, [heroMovies.length]);

  const handlePrev = useCallback(() => {
    if (heroMovies.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  }, [heroMovies.length]);

  // Auto rotate every 7 seconds when not hovered
  useEffect(() => {
    if (isPaused || heroMovies.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, heroMovies.length, handleNext]);

  if (!currentMovie) {
    return null;
  }

  const isInList = myListIds.includes(currentMovie.id) || myListIds.includes(currentMovie.identifier);
  const genresText = currentMovie.genres?.slice(0, 3).join(' • ') || 'Classic Cinema';

  return (
    <div
      className="relative w-full h-[520px] sm:h-[600px] lg:h-[720px] bg-slate-950 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Archival Backdrop */}
      <div className="absolute inset-0">
        <img
          key={currentMovie.id}
          src={currentMovie.backdropUrl || currentMovie.posterUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.08] transition-all duration-1000 transform scale-105 animate-fade-in"
        />

        {/* Deep cinematic multi-layered gradient overlays */}
        {/* Bottom fade to page background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080e] via-[#06080e]/60 to-transparent" />
        {/* Left side text shadow gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06080e] via-[#06080e]/85 to-transparent w-full md:w-3/4" />
        {/* Top header protection */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col justify-end pb-16 sm:pb-20 z-10">
        <div className="max-w-2xl lg:max-w-3xl space-y-3 sm:space-y-4">
          
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 bg-blue-600/90 text-white font-black text-xs px-2.5 py-1 rounded shadow-md tracking-wider">
              <Sparkles className="w-3 h-3" />
              FEATURED STREAM
            </span>
            <span className="flex items-center gap-1 bg-emerald-950/80 text-emerald-300 font-bold text-xs px-2.5 py-1 rounded border border-emerald-500/40 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {currentMovie.copyrightStatus}
            </span>
            {currentMovie.quality && (
              <span className="bg-slate-900/80 text-slate-300 font-bold text-xs px-2.5 py-1 rounded border border-slate-700 backdrop-blur-md">
                {currentMovie.quality}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {currentMovie.title}
          </h1>

          {/* Metadata chips: Year, Genres, Runtime, Rating, Director */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-xs sm:text-sm text-slate-300 flex-wrap font-medium">
            <span className="text-white font-semibold">{currentMovie.year}</span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400 font-semibold">{genresText}</span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {currentMovie.runtime}
            </span>
            <span className="text-slate-500">•</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{currentMovie.rating}</span>
            </div>
            {currentMovie.country && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{currentMovie.country}</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300/90 line-clamp-3 max-w-2xl leading-relaxed">
            {currentMovie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            {/* Watch Now Button */}
            <button
              type="button"
              onClick={() => onWatch(currentMovie)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base px-6 py-3 rounded-xl shadow-lg shadow-blue-900/60 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>WATCH NOW</span>
            </button>

            {/* Download Button (Legal) */}
            {currentMovie.downloadAllowed && currentMovie.rightsVerified ? (
              <button
                type="button"
                onClick={() => onDownload(currentMovie)}
                className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base px-5 py-3 rounded-xl border border-slate-700 hover:border-slate-500 backdrop-blur-md shadow-md transition-all cursor-pointer"
                title="Legal Direct Archival Download"
              >
                <Download className="w-5 h-5 text-blue-400" />
                <span>DOWNLOAD</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenDetails(currentMovie)}
                className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold text-sm sm:text-base px-5 py-3 rounded-xl border border-slate-700 backdrop-blur-md transition-all cursor-pointer"
              >
                <span>SOURCE PAGE</span>
              </button>
            )}

            {/* Add to My List */}
            <button
              type="button"
              onClick={() => onToggleMyList(currentMovie)}
              className={`flex items-center gap-2 font-semibold text-sm sm:text-base px-4 py-3 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                isInList
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/60 hover:bg-blue-600/30'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-700 hover:border-slate-500'
              }`}
            >
              {isInList ? (
                <>
                  <Check className="w-5 h-5 text-blue-400" />
                  <span>IN MY LIST</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-slate-400" />
                  <span>MY LIST</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slider Left / Right Navigation Controls */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-blue-600 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl transition-all cursor-pointer hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-blue-600 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl transition-all cursor-pointer hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slider Indicators Dots */}
      <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {heroMovies.map((m, idx) => (
          <button
            key={m.id || idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex
                ? 'w-8 bg-blue-500 shadow-sm shadow-blue-400'
                : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
