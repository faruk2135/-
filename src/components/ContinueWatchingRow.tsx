import React from 'react';
import { Play, Clock, Sparkles, Film, ArrowRight } from 'lucide-react';
import { Movie, WatchHistoryItem } from '../types';

interface ContinueWatchingRowProps {
  watchHistory: WatchHistoryItem[];
  allMovies: Movie[];
  onWatch: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onExplore: () => void;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  watchHistory,
  allMovies,
  onWatch,
  onOpenDetails,
  onExplore,
}) => {
  // Map history to movie objects
  const historyMovies = watchHistory
    .map((item) => {
      const movie = allMovies.find(
        (m) => m.id === item.movieId || m.identifier === item.movieId
      );
      return movie ? { movie, history: item } : null;
    })
    .filter(Boolean) as { movie: Movie; history: WatchHistoryItem }[];

  const formatMinsLeft = (pos: number, dur: number) => {
    if (!dur || dur <= pos) return 'Completed';
    const remainingSecs = Math.max(0, dur - pos);
    const mins = Math.ceil(remainingSecs / 60);
    return `${mins}m left`;
  };

  // If no watch history exists, show the welcoming "Start Watching" section!
  if (historyMovies.length === 0) {
    const recommendedStarter = allMovies.slice(0, 4);

    return (
      <section className="px-4 sm:px-6 lg:px-10 py-6 select-none">
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-slate-900/40 border border-blue-500/20 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Start Watching</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Discover Verified Masterpieces in Public Domain
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Stream restored cinema classics from Buster Keaton, Cary Grant, Alfred Hitchcock, and George A. Romero—100% legal, gratis, and ad-free.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onExplore}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-lg shadow-blue-900/50 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 select-none">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 mb-3.5">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Continue Watching
          </h2>
          <span className="text-xs text-slate-400 font-medium ml-1">
            ({historyMovies.length})
          </span>
        </div>
      </div>

      <div
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 lg:px-10 pb-2 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {historyMovies.map(({ movie, history }) => {
          const percent = history.duration > 0
            ? Math.min(100, Math.max(5, (history.position / history.duration) * 100))
            : 15;

          return (
            <div
              key={movie.id}
              className="w-[220px] sm:w-[260px] flex-shrink-0 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-blue-500/50 shadow-md group transition-all"
            >
              {/* Thumbnail Container */}
              <div
                className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                onClick={() => onWatch(movie)}
              >
                <img
                  src={movie.backdropUrl || movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Play hover button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600/90 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 ml-0.5 fill-white" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4
                    onClick={() => onOpenDetails(movie)}
                    className="text-xs sm:text-sm font-bold text-white truncate hover:text-blue-400 cursor-pointer"
                  >
                    {movie.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatMinsLeft(history.position, history.duration)} • {movie.genres?.[0]}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onWatch(movie)}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex-shrink-0 transition-colors cursor-pointer"
                  title="Resume Watching"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
