import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Flame, Skull, Rocket, Film, ShieldCheck, Download, 
  Sparkles, Award, Clock, ArrowRight, ShieldAlert, Heart 
} from 'lucide-react';
import { Movie, ActiveView, WatchHistoryItem } from './types';
import { SEED_MOVIES } from './data/seedMovies';
import { MovieService } from './utils/movieService';

import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { MovieRow } from './components/MovieRow';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { DownloadModal } from './components/DownloadModal';
import { MoviesView } from './components/MoviesView';
import { GenresView } from './components/GenresView';
import { CountriesLanguagesView } from './components/CountriesLanguagesView';
import { MyListView } from './components/MyListView';
import { ContinueWatchingRow } from './components/ContinueWatchingRow';
import { Footer } from './components/Footer';
import { ProfileModal } from './components/ProfileModal';
import { AdBanner } from './components/AdBanner';
import { BloggerGuideModal } from './components/BloggerGuideModal';

export default function App() {
  const [allMovies, setAllMovies] = useState<Movie[]>(SEED_MOVIES);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBloggerGuideOpen, setIsBloggerGuideOpen] = useState(false);
  
  // Selected movies for modals
  const [detailsMovie, setDetailsMovie] = useState<Movie | null>(null);
  const [watchMovie, setWatchMovie] = useState<Movie | null>(null);
  const [downloadMovie, setDownloadMovie] = useState<Movie | null>(null);
  const [playTrailerMode, setPlayTrailerMode] = useState<boolean>(false);

  const handleWatch = (movie: Movie, isTrailer = false) => {
    setPlayTrailerMode(isTrailer);
    setWatchMovie(movie);
  };

  // My List & Watch History
  const [myListIds, setMyListIds] = useState<string[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  
  // Profile / Settings Modal
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'preferences' | 'legal'>('preferences');

  // Specific filter state for navigation
  const [selectedGenreParam, setSelectedGenreParam] = useState<string>('All');
  const [selectedCountryParam, setSelectedCountryParam] = useState<string>('All');
  const [selectedLanguageParam, setSelectedLanguageParam] = useState<string>('All');

  // Load initial data and verified catalog
  useEffect(() => {
    // Load local storage states
    setMyListIds(MovieService.getMyList());
    setWatchHistory(MovieService.getWatchHistory());

    // Fetch full 2,120 verified movies catalog
    MovieService.getAllMovies().then((movies) => {
      if (movies && movies.length > 0) {
        setAllMovies(movies);
      }
    });
  }, []);

  // Sync My List toggle
  const handleToggleMyList = (movie: Movie) => {
    MovieService.toggleMyList(movie.id || movie.identifier);
    setMyListIds(MovieService.getMyList());
  };

  // Clear local storage callback
  const handleDataCleared = () => {
    setMyListIds(MovieService.getMyList());
    setWatchHistory(MovieService.getWatchHistory());
  };

  // Watch progress update
  const handleUpdateWatchProgress = (movieId: string, pos: number, dur: number) => {
    setWatchHistory(MovieService.getWatchHistory());
  };

  // Pick random movie
  const handleRandomMovie = useCallback(() => {
    if (allMovies.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allMovies.length);
    const chosen = allMovies[randomIndex];
    setDetailsMovie(chosen);
  }, [allMovies]);

  // Navigation router
  const handleNavigate = (view: ActiveView, extraFilter?: any) => {
    setActiveView(view);
    if (extraFilter?.genre) setSelectedGenreParam(extraFilter.genre);
    if (extraFilter?.country) setSelectedCountryParam(extraFilter.country);
    if (extraFilter?.language) setSelectedLanguageParam(extraFilter.language);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Curated collections for Homepage rows
  const popularMovies = useMemo(() => {
    return [...allMovies].sort((a, b) => b.views - a.views).slice(0, 20);
  }, [allMovies]);

  const horrorSciFiMovies = useMemo(() => {
    return allMovies
      .filter(m => m.genres.some(g => ['Horror', 'Sci-Fi', 'Mystery', 'Thriller'].includes(g)))
      .slice(0, 20);
  }, [allMovies]);

  const silentPioneers = useMemo(() => {
    return allMovies
      .filter(m => Number(m.year) <= 1930 || m.genres.includes('Silent Film'))
      .slice(0, 20);
  }, [allMovies]);

  const noirCrime = useMemo(() => {
    return allMovies
      .filter(m => m.genres.some(g => ['Crime', 'Drama', 'Mystery'].includes(g)) && Number(m.year) >= 1940 && Number(m.year) <= 1959)
      .slice(0, 20);
  }, [allMovies]);

  const comedyClassics = useMemo(() => {
    return allMovies
      .filter(m => m.genres.includes('Comedy'))
      .slice(0, 20);
  }, [allMovies]);

  const freeDownloadPicks = useMemo(() => {
    return allMovies
      .filter(m => m.downloadAllowed && m.rightsVerified)
      .slice(0, 20);
  }, [allMovies]);

  // Similar movies helper for details modal
  const similarMovies = useMemo(() => {
    if (!detailsMovie) return [];
    const mainGenre = detailsMovie.genres?.[0] || 'Classic';
    return allMovies
      .filter(m => m.id !== detailsMovie.id && m.genres.includes(mainGenre))
      .slice(0, 6);
  }, [detailsMovie, allMovies]);

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Fixed Sticky Header */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        myListCount={myListIds.length}
        onRandomMovie={handleRandomMovie}
        onOpenProfile={() => {
          setProfileInitialTab('preferences');
          setIsProfileOpen(true);
        }}
        onSearch={(q) => {
          setSearchQuery(q);
          if (q.trim() && activeView !== 'search' && activeView !== 'movies') {
            setActiveView('search');
          }
        }}
        searchQuery={searchQuery}
        allMovies={allMovies}
        onSelectMovie={(movie) => setDetailsMovie(movie)}
        onOpenBloggerGuide={() => setIsBloggerGuideOpen(true)}
      />

      {/* 1-File Full Code Download & Blogger Quick Bar */}
      <div className="pt-20 lg:pt-24 bg-gradient-to-r from-blue-950/90 via-indigo-950/90 to-slate-950/90 border-b border-blue-500/40 px-4 py-2.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-white font-semibold">
              📥 <strong className="text-blue-300">১টি ফাইলের মধ্যে ওয়েবসাইটের সমস্ত কোড</strong> (Blogger &amp; Ads Ready):
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <a
              href="/html.html"
              download="html.html"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>html.html ফাইল ডাউনলোড</span>
            </a>

            <a
              href="/cinevault_blogger_theme.xml"
              download="cinevault_blogger_theme.xml"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Blogger XML থিম</span>
            </a>

            <button
              type="button"
              onClick={() => setIsBloggerGuideOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-all cursor-pointer"
            >
              <span>📋 সব কোড দেখুন ও কপি</span>
            </button>

            <a
              href="/html.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-blue-400 hover:text-blue-300 text-xs hover:underline"
            >
              <span>নতুন ট্যাবে html.html খুলুন ↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* Top Header Leaderboard Ad (728x90 on Desktop, 320x50 on Mobile) */}
      <div className="w-full bg-slate-950/80 border-b border-slate-900 flex justify-center py-2">
        <AdBanner type="leaderboard" />
      </div>

      {/* Main Content Body */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME */}
        {activeView === 'home' && (
          <div className="space-y-6">
            {/* Cinematic Hero Slider */}
            <HeroSlider
              movies={allMovies.slice(0, 10)}
              onWatch={(m) => setWatchMovie(m)}
              onDownload={(m) => setDownloadMovie(m)}
              onOpenDetails={(m) => setDetailsMovie(m)}
              myListIds={myListIds}
              onToggleMyList={handleToggleMyList}
            />

            {/* Continue Watching Section */}
            <ContinueWatchingRow
              watchHistory={watchHistory}
              allMovies={allMovies}
              onWatch={(m) => setWatchMovie(m)}
              onOpenDetails={(m) => setDetailsMovie(m)}
              onExplore={() => handleNavigate('movies')}
            />

            {/* Movie Row 1: Popular Classics */}
            <MovieRow
              title="Most Popular Masterpieces"
              subtitle="Timeless films watched and cherished by millions globally"
              icon={<Flame className="w-5 h-5 text-amber-400" />}
              badge="Top Watched"
              movies={popularMovies}
              onWatch={(m) => setWatchMovie(m)}
              onDownload={(m) => setDownloadMovie(m)}
              onOpenDetails={(m) => setDetailsMovie(m)}
              myListIds={myListIds}
              onToggleMyList={handleToggleMyList}
              watchHistory={watchHistory}
              onViewAll={() => handleNavigate('popular')}
            />

            {/* Movie Row 2: Sci-Fi & Vintage Horror */}
            <MovieRow
              title="Gothic Horror &amp; Retro Sci-Fi"
              subtitle="From Nosferatu and House on Haunted Hill to early space odysseys"
              icon={<Skull className="w-5 h-5 text-red-400" />}
              badge="Cult Classics"
              movies={horrorSciFiMovies}
              onWatch={(m) => setWatchMovie(m)}
              onDownload={(m) => setDownloadMovie(m)}
              onOpenDetails={(m) => setDetailsMovie(m)}
              myListIds={myListIds}
              onToggleMyList={handleToggleMyList}
              watchHistory={watchHistory}
              onViewAll={() => {
                setSelectedGenreParam('Horror');
                handleNavigate('movies');
              }}
            />

            {/* Middle Trust & Legality Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/40 border border-blue-500/30 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Access Cultural Heritage</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    2,000+ Legitimate Films in the Public Domain &amp; Open Archives
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Unlike copyright-infringing pirate hubs, CineVault solely catalogues verifiable Public Domain and Creative Commons cinema curated from legitimate archives such as the Internet Archive. Every title is legal to watch, study, and archive.
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileInitialTab('legal');
                      setIsProfileOpen(true);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm py-3 px-5 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    Rights &amp; Policy
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('movies')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-lg shadow-blue-900/50 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Browse All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Native Sponsored Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <AdBanner type="native" />
            </div>

            {/* Movie Row 3: Silent Pioneers */}
            <MovieRow
              title="Silent Era Pioneers"
              subtitle="The foundational masterworks that invented the visual grammar of motion pictures"
              icon={<Film className="w-5 h-5 text-purple-400" />}
              badge="Pre-1930"
              movies={silentPioneers}
              onWatch={(m) => setWatchMovie(m)}
              onDownload={(m) => setDownloadMovie(m)}
              onOpenDetails={(m) => setDetailsMovie(m)}
              myListIds={myListIds}
              onToggleMyList={handleToggleMyList}
              watchHistory={watchHistory}
              onViewAll={() => {
                setSelectedGenreParam('Silent Film');
                handleNavigate('movies');
              }}
            />

            {/* Movie Row 4: Film Noir & Crime */}
            <MovieRow
              title="Film Noir &amp; Post-War Suspense"
              subtitle="Cynical detectives, femme fatales, and shadowy high-contrast cinematography"
              icon={<ShieldAlert className="w-5 h-5 text-emerald-400" />}
              badge="1940s-1950s"
              movies={noirCrime}
              onWatch={(m) => setWatchMovie(m)}
              onDownload={(m) => setDownloadMovie(m)}
              onOpenDetails={(m) => setDetailsMovie(m)}
              myListIds={myListIds}
              onToggleMyList={handleToggleMyList}
              watchHistory={watchHistory}
              onViewAll={() => {
                setSelectedGenreParam('Crime');
                handleNavigate('movies');
              }}
            />

            {/* Movie Row 5: Golden Age Comedy */}
            <MovieRow
              title="Legendary Comedies &amp; Farces"
              subtitle="Buster Keaton, Charlie Chaplin, Cary Grant, and sparkling screwball humor"
              icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
              badge="Comedy"
              movies={comedyClassics}
              onWatch={(m) => setWatchMovie(m)}
              onDownload={(m) => setDownloadMovie(m)}
              onOpenDetails={(m) => setDetailsMovie(m)}
              myListIds={myListIds}
              onToggleMyList={handleToggleMyList}
              watchHistory={watchHistory}
              onViewAll={() => {
                setSelectedGenreParam('Comedy');
                handleNavigate('movies');
              }}
            />

            {/* Movie Row 6: Verified Free Downloads */}
            <MovieRow
              title="Verified Free Downloads"
              subtitle="High quality MP4 prints ready for direct offline archiving"
              icon={<Download className="w-5 h-5 text-blue-400" />}
              badge="Direct MP4"
              movies={freeDownloadPicks}
              onWatch={(m) => setWatchMovie(m)}
              onDownload={(m) => setDownloadMovie(m)}
              onOpenDetails={(m) => setDetailsMovie(m)}
              myListIds={myListIds}
              onToggleMyList={handleToggleMyList}
              watchHistory={watchHistory}
              onViewAll={() => handleNavigate('free-movies')}
            />
          </div>
        )}

        {/* VIEW 2: ALL MOVIES CATALOG / SEARCH */}
        {(activeView === 'movies' || activeView === 'search') && (
          <MoviesView
            movies={allMovies}
            onWatch={(m) => setWatchMovie(m)}
            onDownload={(m) => setDownloadMovie(m)}
            onOpenDetails={(m) => setDetailsMovie(m)}
            myListIds={myListIds}
            onToggleMyList={handleToggleMyList}
            initialGenre={selectedGenreParam}
          />
        )}

        {/* VIEW 3: LATEST */}
        {activeView === 'latest' && (
          <MoviesView
            movies={allMovies}
            onWatch={(m) => setWatchMovie(m)}
            onDownload={(m) => setDownloadMovie(m)}
            onOpenDetails={(m) => setDetailsMovie(m)}
            myListIds={myListIds}
            onToggleMyList={handleToggleMyList}
            initialSort="latest"
          />
        )}

        {/* VIEW 4: POPULAR */}
        {activeView === 'popular' && (
          <MoviesView
            movies={allMovies}
            onWatch={(m) => setWatchMovie(m)}
            onDownload={(m) => setDownloadMovie(m)}
            onOpenDetails={(m) => setDetailsMovie(m)}
            myListIds={myListIds}
            onToggleMyList={handleToggleMyList}
            initialSort="popular"
          />
        )}

        {/* VIEW 5: FREE MOVIES */}
        {activeView === 'free-movies' && (
          <MoviesView
            movies={allMovies}
            onWatch={(m) => setWatchMovie(m)}
            onDownload={(m) => setDownloadMovie(m)}
            onOpenDetails={(m) => setDetailsMovie(m)}
            myListIds={myListIds}
            onToggleMyList={handleToggleMyList}
            initialLicense="Public Domain"
          />
        )}

        {/* VIEW 6: GENRES */}
        {activeView === 'genres' && (
          <GenresView
            movies={allMovies}
            onSelectGenre={(genre) => {
              setSelectedGenreParam(genre);
              setActiveView('movies');
            }}
          />
        )}

        {/* VIEW 7: COUNTRIES */}
        {activeView === 'countries' && (
          <CountriesLanguagesView
            movies={allMovies}
            initialTab="countries"
            onSelectCountry={(country) => {
              setSelectedCountryParam(country);
              setActiveView('movies');
            }}
            onSelectLanguage={(language) => {
              setSelectedLanguageParam(language);
              setActiveView('movies');
            }}
          />
        )}

        {/* VIEW 8: LANGUAGES */}
        {activeView === 'languages' && (
          <CountriesLanguagesView
            movies={allMovies}
            initialTab="languages"
            onSelectCountry={(country) => {
              setSelectedCountryParam(country);
              setActiveView('movies');
            }}
            onSelectLanguage={(language) => {
              setSelectedLanguageParam(language);
              setActiveView('movies');
            }}
          />
        )}

        {/* VIEW 9: MY LIST */}
        {activeView === 'my-list' && (
          <MyListView
            movies={allMovies}
            myListIds={myListIds}
            onWatch={(m) => setWatchMovie(m)}
            onDownload={(m) => setDownloadMovie(m)}
            onOpenDetails={(m) => setDetailsMovie(m)}
            onToggleMyList={handleToggleMyList}
            onClearMyList={() => {
              localStorage.removeItem('cinevault_my_list');
              setMyListIds([]);
            }}
            onBrowse={() => handleNavigate('movies')}
          />
        )}
      </main>

      {/* Bottom Ad Banner (468x60 on Desktop, 320x50 on Mobile) */}
      <div className="w-full bg-slate-950/60 border-t border-slate-900/80 flex justify-center py-4">
        <AdBanner type="banner_468" />
      </div>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPolicy={() => {
          setProfileInitialTab('legal');
          setIsProfileOpen(true);
        }}
      />

      {/* MODAL 1: Movie Details & Rights Verification */}
      <MovieDetailsModal
        movie={detailsMovie}
        onClose={() => setDetailsMovie(null)}
        onWatch={(m, playTrailer) => handleWatch(m, playTrailer)}
        onDownload={(m) => setDownloadMovie(m)}
        isInMyList={Boolean(detailsMovie && (myListIds.includes(detailsMovie.id) || myListIds.includes(detailsMovie.identifier)))}
        onToggleMyList={handleToggleMyList}
        similarMovies={similarMovies}
        onSelectSimilar={(m) => setDetailsMovie(m)}
      />

      {/* MODAL 2: Professional HTML5 Theater Video Player */}
      {watchMovie && (
        <VideoPlayerModal
          movie={watchMovie}
          onClose={() => {
            setWatchMovie(null);
            setPlayTrailerMode(false);
          }}
          onUpdateWatchProgress={handleUpdateWatchProgress}
          initialPlayTrailer={playTrailerMode}
        />
      )}

      {/* MODAL 3: Legal Download Manager */}
      {downloadMovie && (
        <DownloadModal
          movie={downloadMovie}
          onClose={() => setDownloadMovie(null)}
        />
      )}

      {/* MODAL 4: Profile, Local Storage & Rights Information */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        myListCount={myListIds.length}
        watchHistoryCount={watchHistory.length}
        onDataCleared={handleDataCleared}
        initialTab={profileInitialTab}
      />

      {/* MODAL 5: Blogger & WhatsApp Setup Guide */}
      <BloggerGuideModal
        isOpen={isBloggerGuideOpen}
        onClose={() => setIsBloggerGuideOpen(false)}
      />
    </div>
  );
}
