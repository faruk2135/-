import React from 'react';
import { 
  Film, Sparkles, Ghost, Skull, Smile, ShieldAlert, 
  Heart, Compass, Rocket, Swords, Tv, Award, Play 
} from 'lucide-react';
import { Movie } from '../types';

interface GenresViewProps {
  movies: Movie[];
  onSelectGenre: (genre: string) => void;
}

export const GenresView: React.FC<GenresViewProps> = ({ movies, onSelectGenre }) => {
  const genresConfig = [
    { name: 'Horror', icon: Skull, gradient: 'from-red-950 via-slate-900 to-black', desc: 'Classic monster, gothic, and vintage chills' },
    { name: 'Sci-Fi', icon: Rocket, gradient: 'from-cyan-950 via-slate-900 to-black', desc: 'Space exploration, retro-futurism & alien wonders' },
    { name: 'Comedy', icon: Smile, gradient: 'from-amber-950 via-slate-900 to-black', desc: 'Slapstick, farce, and legendary golden age wit' },
    { name: 'Silent Film', icon: Film, gradient: 'from-slate-800 via-slate-900 to-black', desc: 'Expressive pioneer storytelling & cinema origins' },
    { name: 'Drama', icon: Award, gradient: 'from-purple-950 via-slate-900 to-black', desc: 'Deep human narratives and intense character studies' },
    { name: 'Crime', icon: ShieldAlert, gradient: 'from-emerald-950 via-slate-900 to-black', desc: 'Film noir, detectives, heists, and shadowy alleys' },
    { name: 'Mystery', icon: Ghost, gradient: 'from-indigo-950 via-slate-900 to-black', desc: 'Unsolved puzzles, whodunits, and suspense' },
    { name: 'Thriller', icon: Sparkles, gradient: 'from-rose-950 via-slate-900 to-black', desc: 'Psychological tension and edge-of-seat pacing' },
    { name: 'Action', icon: Swords, gradient: 'from-orange-950 via-slate-900 to-black', desc: 'High adrenaline stunts, chases, and heroic feats' },
    { name: 'Adventure', icon: Compass, gradient: 'from-teal-950 via-slate-900 to-black', desc: 'Expeditions, lost worlds, and epic journeys' },
    { name: 'Romance', icon: Heart, gradient: 'from-pink-950 via-slate-900 to-black', desc: 'Timeless love affairs and poetic melodrama' },
    { name: 'Western', icon: Compass, gradient: 'from-yellow-950 via-slate-900 to-black', desc: 'Frontier lore, outlaws, and desert shootouts' },
    { name: 'Animation', icon: Tv, gradient: 'from-blue-950 via-slate-900 to-black', desc: 'Pioneering hand-drawn cartoons and cel animation' },
    { name: 'Documentary', icon: Film, gradient: 'from-stone-900 via-slate-900 to-black', desc: 'Historic chronicles, real events, and cultural records' },
    { name: 'Fantasy', icon: Sparkles, gradient: 'from-violet-950 via-slate-900 to-black', desc: 'Folkloric myths, sorcery, and enchanting realms' },
    { name: 'War', icon: Swords, gradient: 'from-neutral-900 via-slate-900 to-black', desc: 'Historic conflicts, battlefield bravery, and sacrifice' },
    { name: 'Classic', icon: Award, gradient: 'from-slate-900 via-blue-950 to-black', desc: 'Foundational works that defined cinema history' },
    { name: 'Experimental', icon: Sparkles, gradient: 'from-fuchsia-950 via-slate-900 to-black', desc: 'Avant-garde techniques, visual poetry, and abstract art' },
  ];

  // Calculate real counts from movies data
  const getGenreCount = (genreName: string) => {
    return movies.filter(m => 
      m.genres.some(g => g.toLowerCase() === genreName.toLowerCase())
    ).length;
  };

  // Find sample poster for genre
  const getGenreSampleImage = (genreName: string) => {
    const sample = movies.find(m => 
      m.genres.some(g => g.toLowerCase() === genreName.toLowerCase()) && m.posterUrl
    );
    return sample?.posterUrl || null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 select-none">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Browse by Genre
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore {genresConfig.length} diverse genres across 2,000+ verified public domain and creative commons movies.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {genresConfig.map((genre) => {
          const count = getGenreCount(genre.name);
          const sampleImg = getGenreSampleImage(genre.name);
          const Icon = genre.icon;

          return (
            <div
              key={genre.name}
              onClick={() => onSelectGenre(genre.name)}
              className={`group relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br ${genre.gradient} border border-slate-800/80 hover:border-blue-500/60 shadow-lg hover:shadow-2xl hover:shadow-blue-950/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px]`}
            >
              {/* Subtle background sample image */}
              {sampleImg && (
                <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none">
                  <img
                    src={sampleImg}
                    alt={genre.name}
                    className="w-full h-full object-cover filter blur-[2px]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>
              )}

              {/* Top Row: Icon & Count */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-blue-600/30 text-white flex items-center justify-center border border-white/10 transition-colors">
                  <Icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-black/50 text-slate-300 border border-slate-700">
                  {count > 0 ? `${count} films` : 'Catalog'}
                </span>
              </div>

              {/* Bottom: Genre Name & Description */}
              <div className="relative z-10 mt-4">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
                  <span>{genre.name}</span>
                  <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity fill-blue-400 text-blue-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {genre.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
