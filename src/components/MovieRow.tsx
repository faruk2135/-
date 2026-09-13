import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Movie, WatchHistoryItem } from '../types';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  myListIds: string[];
  onToggleMyList: (movie: Movie) => void;
  watchHistory?: WatchHistoryItem[];
  onViewAll?: () => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  subtitle,
  icon,
  badge,
  movies,
  onWatch,
  onDownload,
  onOpenDetails,
  myListIds,
  onToggleMyList,
  watchHistory = [],
  onViewAll,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) {
    return null;
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative py-4 group/row select-none">
      {/* Row Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 mb-3.5">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-blue-400">{icon}</span>}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center">
                {title}
              </h2>
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 tracking-wider uppercase">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-blue-500/10 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation Arrows for Desktop */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        aria-label="Scroll left"
        className="hidden md:flex absolute left-2 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-blue-600 text-white items-center justify-center backdrop-blur-md border border-slate-800 shadow-xl opacity-0 group-hover/row:opacity-100 transition-all duration-200 cursor-pointer hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={() => handleScroll('right')}
        aria-label="Scroll right"
        className="hidden md:flex absolute right-2 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-blue-600 text-white items-center justify-center backdrop-blur-md border border-slate-800 shadow-xl opacity-0 group-hover/row:opacity-100 transition-all duration-200 cursor-pointer hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden px-4 sm:px-6 lg:px-10 pb-2 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie) => {
          const historyItem = watchHistory.find(h => h.movieId === movie.id || h.movieId === movie.identifier);
          const watchPercent = historyItem && historyItem.duration > 0
            ? (historyItem.position / historyItem.duration) * 100
            : undefined;

          return (
            <div
              key={movie.id || movie.identifier}
              className="w-[160px] sm:w-[185px] md:w-[210px] lg:w-[230px] flex-shrink-0"
            >
              <MovieCard
                movie={movie}
                onWatch={onWatch}
                onDownload={onDownload}
                onOpenDetails={onOpenDetails}
                isInMyList={myListIds.includes(movie.id) || myListIds.includes(movie.identifier)}
                onToggleMyList={onToggleMyList}
                watchProgress={watchPercent}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
