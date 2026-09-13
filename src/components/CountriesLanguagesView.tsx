import React, { useState } from 'react';
import { Globe, MapPin, Film, ChevronRight } from 'lucide-react';
import { Movie } from '../types';

interface CountriesLanguagesViewProps {
  movies: Movie[];
  onSelectCountry: (country: string) => void;
  onSelectLanguage: (language: string) => void;
  initialTab?: 'countries' | 'languages';
}

export const CountriesLanguagesView: React.FC<CountriesLanguagesViewProps> = ({
  movies,
  onSelectCountry,
  onSelectLanguage,
  initialTab = 'countries',
}) => {
  const [activeTab, setActiveTab] = useState<'countries' | 'languages'>(initialTab);

  const countries = [
    { code: 'USA', name: 'United States', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'France', name: 'France', flag: '🇫🇷' },
    { code: 'Germany', name: 'Germany', flag: '🇩🇪' },
    { code: 'Italy', name: 'Italy', flag: '🇮🇹' },
    { code: 'Spain', name: 'Spain', flag: '🇪🇸' },
    { code: 'Japan', name: 'Japan', flag: '🇯🇵' },
    { code: 'China', name: 'China', flag: '🇨🇳' },
    { code: 'India', name: 'India', flag: '🇮🇳' },
    { code: 'Russia', name: 'Russia / USSR', flag: '🇷🇺' },
    { code: 'Canada', name: 'Canada', flag: '🇨🇦' },
    { code: 'Australia', name: 'Australia', flag: '🇦🇺' },
  ];

  const languages = [
    { code: 'English', name: 'English', native: 'English' },
    { code: 'French', name: 'French', native: 'Français' },
    { code: 'German', name: 'German', native: 'Deutsch' },
    { code: 'Italian', name: 'Italian', native: 'Italiano' },
    { code: 'Spanish', name: 'Spanish', native: 'Español' },
    { code: 'Japanese', name: 'Japanese', native: '日本語' },
    { code: 'Chinese', name: 'Chinese', native: '中文' },
    { code: 'Hindi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'Russian', name: 'Russian', native: 'Русский' },
  ];

  const getCountryCount = (countryCode: string) => {
    return movies.filter(m => m.country?.toLowerCase() === countryCode.toLowerCase()).length;
  };

  const getLanguageCount = (langName: string) => {
    return movies.filter(m => m.language?.toLowerCase().includes(langName.toLowerCase())).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 select-none">
      
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            International Archives
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover cultural heritage films across global regions and linguistic traditions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('countries')}
            className={`flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-lg transition-all cursor-pointer ${
              activeTab === 'countries'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Countries</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('languages')}
            className={`flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-lg transition-all cursor-pointer ${
              activeTab === 'languages'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Languages</span>
          </button>
        </div>
      </div>

      {/* Content Panels */}
      {activeTab === 'countries' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {countries.map((c) => {
            const count = getCountryCount(c.code);
            return (
              <div
                key={c.code}
                onClick={() => onSelectCountry(c.code)}
                className="group p-5 rounded-2xl bg-slate-900/80 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {count > 0 ? `${count} movies available` : 'Archival selection'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {languages.map((l) => {
            const count = getLanguageCount(l.code);
            return (
              <div
                key={l.code}
                onClick={() => onSelectLanguage(l.code)}
                className="group p-5 rounded-2xl bg-slate-900/80 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {l.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-normal">
                      ({l.native})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {count > 0 ? `${count} movies available` : 'Archival collection'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
