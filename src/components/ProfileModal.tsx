import React, { useState } from 'react';
import { X, ShieldCheck, Trash2, Check, Globe, HelpCircle, HardDrive, Info } from 'lucide-react';
import { MovieService } from '../utils/movieService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  myListCount: number;
  watchHistoryCount: number;
  onDataCleared: () => void;
  initialTab?: 'preferences' | 'legal';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  myListCount,
  watchHistoryCount,
  onDataCleared,
  initialTab = 'preferences',
}) => {
  const [tab, setTab] = useState<'preferences' | 'legal'>(initialTab);
  const [clearedMsg, setClearedMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    MovieService.clearWatchHistory();
    setClearedMsg('Watch history cleared successfully.');
    onDataCleared();
    setTimeout(() => setClearedMsg(null), 3000);
  };

  const handleClearMyList = () => {
    localStorage.removeItem('cinevault_my_list');
    setClearedMsg('My List cleared successfully.');
    onDataCleared();
    setTimeout(() => setClearedMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md select-none animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 my-auto text-white">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('preferences')}
              className={`text-sm font-bold pb-1 transition-colors ${
                tab === 'preferences'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Preferences &amp; Storage
            </button>
            <span className="text-slate-700 mx-2">|</span>
            <button
              type="button"
              onClick={() => setTab('legal')}
              className={`text-sm font-bold pb-1 transition-colors ${
                tab === 'legal'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Legal &amp; Copyright Policy
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {clearedMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{clearedMsg}</span>
            </div>
          )}

          {tab === 'preferences' ? (
            <div className="space-y-6 text-xs text-slate-300">
              
              {/* Local Storage management */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>Local Browser Data Storage</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  CineVault preserves your watch progress and saved movie list in your local browser's storage without requiring an account, email address, or third-party cookies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">Watch History</p>
                      <p className="text-slate-400 text-xs mt-0.5">{watchHistoryCount} in-progress titles</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-300 transition-colors"
                      title="Clear Watch History"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">My List</p>
                      <p className="text-slate-400 text-xs mt-0.5">{myListCount} saved titles</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearMyList}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-300 transition-colors"
                      title="Clear My List"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Streaming Quality */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <p className="font-bold text-white text-sm">Playback &amp; Video Quality</p>
                <p className="text-slate-400 leading-relaxed">
                  Video streams are delivered through direct archival feeds from the Internet Archive. The player automatically selects the best available stream resolution (up to 1080p HD).
                </p>
              </div>
            </div>
          ) : (
            /* Legal Policy Tab */
            <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
              
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-300 text-sm">
                    Open Culture &amp; Public Domain Mission
                  </p>
                  <p className="text-slate-300 mt-1">
                    CineVault is strictly committed to respecting intellectual property rights. All titles cataloged on this platform are verified as Public Domain, Creative Commons, CC0, or distributed under open access licenses.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">Why Are These Movies Free &amp; Legal?</h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
                  <li><strong className="text-slate-200">Term Expiration:</strong> In the United States, works published before 1929 have reached the end of their copyright term and entered the public domain.</li>
                  <li><strong className="text-slate-200">Formalities Failure:</strong> Prior to 1989, works published without mandatory copyright notices, or works between 1923 and 1963 whose copyrights were not renewed with the US Copyright Office, entered the public domain (e.g. <em>Night of the Living Dead</em>, <em>Charade</em>, <em>Carnival of Souls</em>).</li>
                  <li><strong className="text-slate-200">Government &amp; CC0 Dedications:</strong> Works produced by governments or explicitly dedicated to the global public domain by their creators.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">Official Legal Disclaimer</h4>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                  "This website only lists movies that are believed to be legally available for free viewing or download from their respective sources. Copyright and licensing status may vary by title and jurisdiction. Users are responsible for complying with applicable laws and license terms."
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">Rights Inquiry or Takedown</h4>
                <p className="text-slate-400">
                  If you are a rights holder and believe any film listed in this archive has been misidentified as public domain or creative commons, please submit an inquiry with verifiable documentation and the entry will be reviewed or removed promptly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
