import React from 'react';
import { Bookmark, Film, Trash2, ArrowRight } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MyListViewProps {
  movies: Movie[];
  myListIds: string[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList: (movie: Movie) => void;
  onClearMyList: () => void;
  onBrowse: () => void;
}

export const MyListView: React.FC<MyListViewProps> = ({
  movies,
  myListIds,
  onWatch,
  onDownload,
  onOpenDetails,
  onToggleMyList,
  onClearMyList,
  onBrowse,
}) => {
  // Find movies that are in myListIds
  const savedMovies = myListIds
    .map(id => movies.find(m => m.id === id || m.identifier === id))
    .filter(Boolean) as Movie[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4 text-blue-400" />
            <span>Personal Watchlist</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            My List
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {savedMovies.length} saved movies saved locally in your personal browser vault.
          </p>
        </div>

        {savedMovies.length > 0 && (
          <button
            type="button"
            onClick={onClearMyList}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 p-2 px-3 rounded-lg bg-red-950/30 hover:bg-red-950/50 border border-red-500/20 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear List</span>
          </button>
        )}
      </div>

      {/* List content */}
      <div className="mt-8">
        {savedMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {savedMovies.map((movie) => (
              <MovieCard
                key={movie.id || movie.identifier}
                movie={movie}
                onWatch={onWatch}
                onDownload={onDownload}
                onOpenDetails={onOpenDetails}
                isInMyList={true}
                onToggleMyList={onToggleMyList}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Your List is Empty</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Explore the 2,000+ verified movies in our library and click the "+" or "Add to My List" button to keep track of what you want to watch.
            </p>
            <button
              type="button"
              onClick={onBrowse}
              className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl shadow-lg shadow-blue-900/50 transition-all cursor-pointer"
            >
              <span>Explore Movies</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
