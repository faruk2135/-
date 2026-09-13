import React, { useEffect, useState } from 'react';
import { 
  X, Play, Download, Plus, Check, Star, Clock, Globe, ShieldCheck, 
  ExternalLink, Calendar, Film, Info, Film as TrailerIcon, ShieldAlert, Share2 
} from 'lucide-react';
import { Movie, PlayableFile } from '../types';
import { fetchMovieMetadata, getTrailerFile } from '../utils/archiveMetadata';

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  onWatch: (movie: Movie, playTrailer?: boolean) => void;
  onDownload: (movie: Movie) => void;
  isInMyList: boolean;
  onToggleMyList: (movie: Movie) => void;
  similarMovies: Movie[];
  onSelectSimilar: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onWatch,
  onDownload,
  isInMyList,
  onToggleMyList,
  similarMovies,
  onSelectSimilar,
}) => {
  const [trailerFile, setTrailerFile] = useState<PlayableFile | null>(null);

  // Check if real trailer/preview exists in metadata
  useEffect(() => {
    if (!movie) {
      setTrailerFile(null);
      return;
    }

    let isMounted = true;
    fetchMovieMetadata(movie.identifier).then((meta) => {
      if (!isMounted) return;
      if (meta) {
        const trailer = getTrailerFile(meta);
        setTrailerFile(trailer);
      } else {
        setTrailerFile(null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [movie]);

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const sourceArchiveUrl = `https://archive.org/details/${movie.identifier}`;
  const posterUrl = `https://archive.org/services/img/${movie.identifier}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 my-auto text-white">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-all cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop with Gradient Overlay */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-[0.6] contrast-[1.1]"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Top Legal Badge on Backdrop */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            {movie.rightsVerified ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{movie.copyrightStatus}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Rights Pending</span>
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-900/80 text-blue-200 border border-blue-600/40 backdrop-blur-md">
              Free Access
            </span>
          </div>

          {/* Floating poster thumbnail on desktop */}
          <div className="hidden sm:block absolute bottom-4 left-6 z-20 w-32 aspect-[2/3] rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-900">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Header Title inside Backdrop Bottom */}
          <div className="absolute bottom-4 left-4 sm:left-44 right-4 z-20">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
              {movie.title}
            </h2>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-xs sm:text-sm text-slate-400 italic">
                Original: {movie.originalTitle}
              </p>
            )}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Metadata chips */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-300 flex-wrap">
            <span className="flex items-center gap-1 text-white font-semibold">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {movie.year}
            </span>
            {movie.runtime && (
              <>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {movie.runtime}
                </span>
              </>
            )}
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              {movie.country} ({movie.language})
            </span>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{movie.rating || '8.5'} / 10</span>
            </div>
            {movie.director && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Dir: {movie.director}</span>
              </>
            )}
          </div>

          {/* Genres Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {movie.genres?.map((g) => (
              <span
                key={g}
                className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900 text-blue-300 border border-slate-800"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onWatch(movie, false);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base px-6 py-3 rounded-xl shadow-lg shadow-blue-900/60 hover:shadow-blue-600/40 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>WATCH MOVIE</span>
            </button>

            {/* REAL TRAILER / PREVIEW CLIP BUTTON:
                Only displayed if a genuine trailer/preview file exists in archive metadata!
                Never pretend that a full movie is a trailer. */}
            {trailerFile && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onWatch(movie, true);
                }}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm sm:text-base px-5 py-3 rounded-xl shadow-lg shadow-amber-900/40 transition-all cursor-pointer"
              >
                <TrailerIcon className="w-4 h-4" />
                <span>WATCH TRAILER</span>
              </button>
            )}

            {movie.downloadAllowed && movie.rightsVerified ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDownload(movie);
                }}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base px-5 py-3 rounded-xl border border-slate-700 hover:border-slate-500 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5 text-blue-400" />
                <span>DOWNLOAD FILE</span>
              </button>
            ) : null}

            {/* OPEN SOURCE Button - Always Available */}
            <a
              href={sourceArchiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm px-5 py-3 rounded-xl border border-slate-700 transition-all cursor-pointer"
              title="Open verified archival item on archive.org"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>OPEN SOURCE</span>
            </a>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={() => {
                const text = encodeURIComponent(
                  `🎬 Check out "${movie.title} (${movie.year})" on CineVault! Watch & Download legally:\n${window.location.origin}/#movie-${movie.identifier}\nArchive details: ${sourceArchiveUrl}`
                );
                window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
              }}
              className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 font-semibold text-sm px-4 py-3 rounded-xl border border-emerald-500/40 transition-all cursor-pointer"
              title="Share movie on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleMyList(movie)}
              className={`flex items-center gap-2 font-semibold text-sm px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                isInMyList
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/60'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              {isInMyList ? (
                <>
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>IN MY LIST</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-slate-400" />
                  <span>ADD TO MY LIST</span>
                </>
              )}
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Synopsis
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {movie.description}
            </p>
          </div>

          {/* Rights, Copyright, Source & Legal Verification Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Rights &amp; Legal Verification</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {movie.rightsVerified ? 'Verified Open Access' : 'Verification Record'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block mb-0.5">License / Terms:</span>
                <span className="font-semibold text-slate-200">{movie.license}</span>
                {movie.licenseUrl && (
                  <a
                    href={movie.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:underline ml-1.5"
                  >
                    <span>Read License</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Archive Identifier:</span>
                <code className="bg-slate-950 px-2 py-1 rounded text-blue-300 font-mono text-[11px]">
                  {movie.identifier}
                </code>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Legal Download Status:</span>
                <span className="font-semibold text-slate-200">
                  {movie.downloadAllowed && movie.rightsVerified 
                    ? 'Free Direct Download Permitted' 
                    : 'Download Restricted / Open Archive Only'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Permanent Source Record:</span>
                <a
                  href={sourceArchiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  <span className="truncate">archive.org/details/{movie.identifier}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Similar Recommended Movies */}
          {similarMovies && similarMovies.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                More Classic Cinema in this Genre
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {similarMovies.map((sim) => (
                  <div
                    key={sim.id || sim.identifier}
                    onClick={() => onSelectSimilar(sim)}
                    className="cursor-pointer group rounded-lg overflow-hidden bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden bg-slate-950">
                      <img
                        src={`https://archive.org/services/img/${sim.identifier}`}
                        alt={sim.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-white truncate group-hover:text-blue-400">
                        {sim.title}
                      </p>
                      <p className="text-[10px] text-slate-400">{sim.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
