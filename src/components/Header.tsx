import React, { useState, useEffect, useRef } from 'react';
import { Search, Shuffle, Bookmark, User, Menu, X, ShieldCheck, Film, Compass, Globe, Sparkles, Share2, Download } from 'lucide-react';
import { ActiveView, Movie } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, extraFilter?: any) => void;
  myListCount: number;
  onRandomMovie: () => void;
  onOpenProfile: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onOpenBloggerGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  myListCount,
  onRandomMovie,
  onOpenProfile,
  onSearch,
  searchQuery,
  allMovies,
  onSelectMovie,
  onOpenBloggerGuide,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchPreviewResults, setSearchPreviewResults] = useState<Movie[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Monitor scroll for header background darkening
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update live search dropdown preview
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchPreviewResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = allMovies
      .filter(m => 
        m.title.toLowerCase().includes(q) ||
        m.originalTitle.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        (m.director && m.director.toLowerCase().includes(q))
      )
      .slice(0, 6);
    setSearchPreviewResults(matches);
  }, [searchQuery, allMovies]);

  // Click outside search container to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchPreviewResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: ActiveView; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'movies', label: 'Movies' },
    { id: 'genres', label: 'Genres' },
    { id: 'countries', label: 'Countries' },
    { id: 'languages', label: 'Languages' },
    { id: 'latest', label: 'Latest' },
    { id: 'popular', label: 'Popular' },
    { id: 'free-movies', label: 'Free Movies' },
    { id: 'my-list', label: 'My List' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search');
      setSearchPreviewResults([]);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl shadow-black/80 py-2.5'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-6 lg:gap-8">
            <div onClick={() => onNavigate('home')}>
              <BrandLogo size="md" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-white bg-blue-600/30 border border-blue-500/40 text-blue-300 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                    {item.id === 'my-list' && myListCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-blue-600 text-white font-bold">
                        {myListCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Random, My List, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Input Bar (Desktop) */}
            <div ref={searchContainerRef} className="relative hidden md:block w-48 lg:w-64">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search 2,000+ films..."
                    className="w-full pl-9 pr-8 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearch('')}
                      className="absolute right-2.5 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </form>

              {/* Instant Search Dropdown Preview */}
              {searchPreviewResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 divide-y divide-slate-800">
                  <div className="p-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Matching Movies</span>
                    <button
                      onClick={() => {
                        onNavigate('search');
                        setSearchPreviewResults([]);
                      }}
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      View All Results
                    </button>
                  </div>
                  {searchPreviewResults.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => {
                        onSelectMovie(movie);
                        setSearchPreviewResults([]);
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-blue-950/40 cursor-pointer transition-colors"
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-8 h-11 object-cover rounded bg-slate-800 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">
                          {movie.title}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span>{movie.year}</span>
                          <span>•</span>
                          <span className="text-blue-400 truncate">{movie.genres?.[0] || 'Classic'}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Search Toggle Icon */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={() => {
                const text = encodeURIComponent(
                  "🎬 CineVault - Stream & Download verified public domain and classic movies for free legally:\n" + window.location.href
                );
                window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
              }}
              className="hidden lg:flex items-center gap-1.5 bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 font-semibold text-xs py-1.5 px-3 rounded-lg transition-all cursor-pointer"
              title="Share CineVault on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Blogger & Ad Setup Guide */}
            {onOpenBloggerGuide && (
              <button
                type="button"
                onClick={onOpenBloggerGuide}
                className="hidden md:flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 font-semibold text-xs py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                title="Blogger-এ আপলোড ও অ্যাড সেটআপ গাইড"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Blogger গাইড</span>
              </button>
            )}

            {/* Single HTML Standalone Website Download */}
            <a
              href="/html.html"
              download="html.html"
              className="hidden xl:flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/40 font-semibold text-xs py-1.5 px-3 rounded-lg transition-all cursor-pointer"
              title="এক ফাইলে সম্পূর্ণ ওয়েবসাইট ডাউনলোড করুন (Download Complete Single html.html)"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>html.html ডাউনলোড</span>
            </a>

            {/* Random Movie Button */}
            <button
              type="button"
              onClick={onRandomMovie}
              className="hidden sm:flex items-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 hover:text-blue-200 border border-blue-500/30 font-semibold text-xs py-1.5 px-3 rounded-lg transition-all cursor-pointer hover:border-blue-400"
              title="Discover a random verified movie"
            >
              <Shuffle className="w-3.5 h-3.5 text-blue-400" />
              <span>Random</span>
            </button>

            {/* My List Icon Button (Tablet / Mobile Shortcut) */}
            <button
              type="button"
              onClick={() => onNavigate('my-list')}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="My Saved List"
            >
              <Bookmark className="w-5 h-5 text-blue-400" />
              {myListCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                  {myListCount}
                </span>
              )}
            </button>

            {/* Profile / Preferences Icon */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Settings & Rights Policy"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {isSearchOpen && (
          <div className="md:hidden px-4 pt-3 pb-2 border-t border-slate-800/80 bg-slate-950">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search titles, actors, genres..."
                  className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearch('')}
                    className="absolute right-3 text-slate-400 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Slide-Over Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Menu Body */}
          <div className="fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <BrandLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Verified Catalog Counter Banner */}
              <div className="mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center gap-2.5 text-xs text-blue-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong className="text-white">2,000+ Movies</strong> verified under Public Domain & Creative Commons.
                </span>
              </div>

              {/* Navigation Items */}
              <div className="mt-6 flex flex-col space-y-1">
                {navItems.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.id === 'my-list' && myListCount > 0 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white font-bold">
                          {myListCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Mobile Action Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(
                      "🎬 CineVault - Stream & Download verified public domain and classic movies for free legally:\n" + window.location.href
                    );
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                {onOpenBloggerGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenBloggerGuide();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Blogger গাইড</span>
                  </button>
                )}

                <a
                  href="/html.html"
                  download="html.html"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="col-span-2 flex items-center justify-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 py-2.5 rounded-xl font-semibold text-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>সম্পূর্ণ html.html ফাইল ডাউনলোড করুন</span>
                </a>
              </div>

              {/* Random Movie Button on Mobile */}
              <button
                type="button"
                onClick={() => {
                  onRandomMovie();
                  setIsMobileMenuOpen(false);
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-blue-500/30 py-2.5 rounded-xl font-semibold text-sm transition-all"
              >
                <Shuffle className="w-4 h-4" />
                <span>Pick Random Movie</span>
              </button>
            </div>

            {/* Bottom Footer Details */}
            <div className="pt-6 border-t border-slate-900 text-xs text-slate-500">
              <p>CineVault v2.4 • Legal Open Archives</p>
              <p className="mt-1 text-[11px] text-slate-600">Powered by Internet Archive & Open Cultural Repositories</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
