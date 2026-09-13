import React from 'react';
import { ShieldCheck, ExternalLink, Heart, Film, Globe } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ActiveView } from '../types';

interface FooterProps {
  onNavigate: (view: ActiveView, extra?: any) => void;
  onOpenPolicy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPolicy }) => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 text-slate-400 select-none">
      
      {/* Top Section: Brand & High-level Legal Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1 & 2: Brand, Purpose & Archive Partners */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" />
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              CineVault is an open digital theater dedicated to the preservation, streaming, and legal distribution of public domain and Creative Commons cinema.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>100% Free • Verified Legal Rights • No DRM</span>
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Discovery
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Featured Cinema
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('movies')}
                  className="hover:text-blue-400 transition-colors"
                >
                  All 2,000+ Movies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('free-movies')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Free Download Catalog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('latest')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Recently Preserved
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('popular')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Most Watched Classics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Categories & Archives */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Archives &amp; Genres
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('genres')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Browse 18 Genres
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('countries')}
                  className="hover:text-blue-400 transition-colors"
                >
                  International Cinema
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('languages')}
                  className="hover:text-blue-400 transition-colors"
                >
                  World Languages
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('my-list')}
                  className="hover:text-blue-400 transition-colors"
                >
                  My Saved List
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Open Data */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Rights &amp; Sources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onOpenPolicy}
                  className="hover:text-blue-400 transition-colors font-semibold text-slate-300"
                >
                  Copyright &amp; License Policy
                </button>
              </li>
              <li>
                <a
                  href="https://archive.org/details/movies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <span>Internet Archive</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://creativecommons.org/publicdomain/mark/1.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <span>Public Domain Mark</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://commons.wikimedia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <span>Wikimedia Commons</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Legal Disclaimer Box */}
        <div className="mt-10 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2 leading-relaxed">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Legal Disclaimer &amp; Compliance Statement</span>
          </div>
          <p>
            This website only lists movies that are believed to be legally available for free viewing or download from their respective sources. Copyright and licensing status may vary by title and jurisdiction. Users are responsible for complying with applicable laws and license terms.
          </p>
        </div>

        {/* Copyright notice & bottom meta */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} CineVault. Built for public open culture and historical cinema preservation.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenPolicy}
              className="hover:text-slate-300 transition-colors"
            >
              Terms of Use
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenPolicy}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenPolicy}
              className="hover:text-slate-300 transition-colors"
            >
              DMCA &amp; Rights Notice
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
