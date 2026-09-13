import React, { useState, useMemo } from 'react';
import { 
  Filter, Search, ArrowUpDown, ChevronLeft, ChevronRight, 
  RotateCcw, ShieldCheck, Film, Star, Check 
} from 'lucide-react';
import { Movie, FilterState } from '../types';
import { MovieCard } from './MovieCard';
import { MovieService } from '../utils/movieService';

interface MoviesViewProps {
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  myListIds: string[];
  onToggleMyList: (movie: Movie) => void;
  initialGenre?: string;
  initialLicense?: string;
  initialSort?: FilterState['sortBy'];
}

export const MoviesView: React.FC<MoviesViewProps> = ({
  movies,
  onWatch,
  onDownload,
  onOpenDetails,
  myListIds,
  onToggleMyList,
  initialGenre = 'All',
  initialLicense = 'All',
  initialSort = 'popular',
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    genre: initialGenre,
    country: 'All',
    language: 'All',
    yearRange: 'All',
    license: initialLicense,
    minRating: 0,
    sortBy: initialSort,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const ITEMS_PER_PAGE = 36;

  const genresList = [
    'All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance',
    'Sci-Fi', 'Thriller', 'War', 'Western', 'Silent Film', 'Classic', 'Experimental'
  ];

  const countriesList = [
    'All', 'USA', 'UK', 'France', 'Germany', 'Italy', 'Spain',
    'Japan', 'China', 'India', 'Russia', 'Canada', 'Australia'
  ];

  const languagesList = [
    'All', 'English', 'French', 'German', 'Italian', 'Spanish',
    'Japanese', 'Chinese', 'Hindi', 'Russian'
  ];

  const yearRanges = [
    { label: 'All Years', value: 'All' },
    { label: 'Pre-1930 (Silent Era)', value: 'pre-1930' },
    { label: '1930s (Golden Age)', value: '1930s' },
    { label: '1940s (Noir & War)', value: '1940s' },
    { label: '1950s (Sci-Fi & Classic)', value: '1950s' },
    { label: '1960s+ (New Hollywood & CC)', value: '1960s+' },
  ];

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    return MovieService.filterMovies(movies, filters);
  }, [movies, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / ITEMS_PER_PAGE));
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      genre: 'All',
      country: 'All',
      language: 'All',
      yearRange: 'All',
      license: 'All',
      minRating: 0,
      sortBy: 'popular',
    });
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 select-none">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Public Cinema Archive</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Explore Open Cinema
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {movies.length >= 2000 ? '2,000+ Movies' : `${movies.length} Movies`} verified for legal streaming and downloading.
          </p>
        </div>

        {/* Results Badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
            Showing <strong className="text-white">{filteredMovies.length}</strong> titles
          </span>

          <button
            type="button"
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="md:hidden flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="mt-6 space-y-4">
        
        {/* Row 1: Search & Sorting */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              placeholder="Search title, director, keyword..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => handleFilterChange('searchQuery', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="latest">Latest Year</option>
              <option value="oldest">Oldest Year</option>
              <option value="rating">Highest Rating</option>
              <option value="a-z">Title (A - Z)</option>
            </select>

            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Row 2: Desktop Filter Selects */}
        <div className="hidden md:grid grid-cols-5 gap-2.5 text-xs">
          
          {/* Genre */}
          <div>
            <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">Genre</label>
            <select
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 cursor-pointer"
            >
              {genresList.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Era / Year */}
          <div>
            <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">Time Era</label>
            <select
              value={filters.yearRange}
              onChange={(e) => handleFilterChange('yearRange', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 cursor-pointer"
            >
              {yearRanges.map(yr => (
                <option key={yr.value} value={yr.value}>{yr.label}</option>
              ))}
            </select>
          </div>

          {/* License / Rights */}
          <div>
            <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">Copyright License</label>
            <select
              value={filters.license}
              onChange={(e) => handleFilterChange('license', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Verified Licenses</option>
              <option value="Public Domain">Public Domain</option>
              <option value="Creative Commons">Creative Commons</option>
              <option value="CC0">CC0 (Dedication)</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">Origin Country</label>
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 cursor-pointer"
            >
              {countriesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">Language</label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 cursor-pointer"
            >
              {languagesList.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showFilterDrawer && (
          <div className="md:hidden p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                >
                  {genresList.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">License</label>
                <select
                  value={filters.license}
                  onChange={(e) => handleFilterChange('license', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                >
                  <option value="All">All Licenses</option>
                  <option value="Public Domain">Public Domain</option>
                  <option value="Creative Commons">Creative Commons</option>
                  <option value="CC0">CC0</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Time Era</label>
                <select
                  value={filters.yearRange}
                  onChange={(e) => handleFilterChange('yearRange', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                >
                  {yearRanges.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                >
                  {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-400 hover:text-white"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowFilterDrawer(false)}
                className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Movies Grid */}
      <div className="mt-8">
        {paginatedMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {paginatedMovies.map((movie) => (
              <MovieCard
                key={movie.id || movie.identifier}
                movie={movie}
                onWatch={onWatch}
                onDownload={onDownload}
                onOpenDetails={onOpenDetails}
                isInMyList={myListIds.includes(movie.id) || myListIds.includes(movie.identifier)}
                onToggleMyList={onToggleMyList}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No movies found</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mt-1">
              No verified archival records matched your filter criteria. Try adjusting the search query or resetting filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({filteredMovies.length} total titles)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            {/* Jump direct page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pNum = Math.min(totalPages - 4 + i, Math.max(1, currentPage - 2 + i));
                }
                return (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      currentPage === pNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-semibold"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
