import React, { useState, useEffect } from 'react';
import { 
  X, Download, ShieldCheck, Check, Copy, ExternalLink, HardDrive, 
  RefreshCw, AlertCircle, Film, ShieldAlert, Share2, HelpCircle, Zap
} from 'lucide-react';
import { Movie, PlayableFile } from '../types';
import { fetchMovieMetadata, getPlayableFiles } from '../utils/archiveMetadata';
import { AdBanner } from './AdBanner';

interface DownloadModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ movie, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [playableFiles, setPlayableFiles] = useState<PlayableFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(true);

  useEffect(() => {
    if (!movie) return;

    let isMounted = true;
    setIsLoading(true);

    fetchMovieMetadata(movie.identifier).then((meta) => {
      if (!isMounted) return;
      if (meta) {
        const files = getPlayableFiles(meta);
        setPlayableFiles(files);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [movie]);

  if (!movie) return null;

  const isLegallyDownloadable = movie.rightsVerified && movie.downloadAllowed && playableFiles.length > 0;
  const sourceArchiveUrl = `https://archive.org/details/${movie.identifier}`;

  const handleCopy = (url: string, index: number) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    });
  };

  const handleDirectDownload = (fileUrl: string, fileName: string) => {
    // 1. Create a dynamic link and click it
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 200);

    // 2. Also open directly in a new window/tab to ensure browser handles it
    window.open(fileUrl, '_blank');
  };

  const handleShareWhatsApp = (fileUrl?: string) => {
    const text = encodeURIComponent(
      `🎬 CineVault - Free & Legal Movie Stream & Download\n"${movie.title} (${movie.year})" [${movie.copyrightStatus}]\nWatch & Download here: ${fileUrl || sourceArchiveUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 my-auto text-white">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isLegallyDownloadable ? 'Verified Legal Downloads' : 'Archival Source Item'}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {movie.title} ({movie.year})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={() => handleShareWhatsApp()}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share movie on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Rights & Provenance Verification Badge */}
          {movie.rightsVerified && movie.downloadAllowed ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-emerald-300">
                  Verified Legal Distribution: {movie.copyrightStatus}
                </p>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  This cinema masterwork is documented under open distribution ({movie.license}). You are legally entitled to download, mirror, and archive these verified source files.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-300">
                  Direct Download Restricted / Pending Verification
                </p>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  To protect copyright compliance, direct download links are withheld unless explicit Public Domain or Creative Commons authorization is confirmed. You can examine the permanent record on the archive source page.
                </p>
              </div>
            </div>
          )}

          {/* Quick Helpful Download Instructions (Bangla & English) */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                ডাউনলোড কীভাবে করবেন? (How to Download):
              </span>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                {showGuide ? 'Hide' : 'Show'}
              </button>
            </div>
            {showGuide && (
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed pl-1 pt-1">
                <li>
                  <strong className="text-white">সরাসরি ডাউনলোড:</strong> নিচের <strong className="text-blue-300">DOWNLOAD MP4</strong> বাটনে ক্লিক করুন।
                </li>
                <li>
                  <strong className="text-white">মোবাইল বা পিসিতে সেভ করুন:</strong> নতুন ট্যাবে ভিডিও ওপেন হলে ভিডিওর ওপর <strong className="text-white">চেপে ধরে রাখুন (Long Press)</strong> অথবা মাউসের <strong className="text-white">Right Click</strong> করে <strong className="text-emerald-300">&quot;Save video as...&quot; / &quot;Download Video&quot;</strong> সিলেক্ট করুন।
                </li>
                <li>
                  <strong className="text-white">ডাউনলোডার অ্যাপ:</strong> <strong className="text-white">&quot;Copy URL&quot;</strong> বাটনে ক্লিক করে লিংকটি IDM, 1DM বা Chrome ডাউনলোডার এ পেস্ট করুন।
                </li>
              </ul>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-7 h-7 text-blue-500 animate-spin mb-2" />
              <p className="text-sm font-semibold text-slate-300">Fetching verified file manifest...</p>
            </div>
          )}

          {/* Real Playable / Downloadable Files from Metadata */}
          {!isLoading && isLegallyDownloadable && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verified Archival Files ({playableFiles.length})
              </h4>

              {playableFiles.map((file, idx) => (
                <div
                  key={file.name}
                  className={`p-4 rounded-xl border transition-all ${
                    idx === 0
                      ? 'bg-blue-950/30 border-blue-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-sm text-white">{file.formatLabel}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-blue-300 uppercase">
                        {file.format}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                      {file.sizeFormatted}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-400 mt-1.5 truncate">
                    {file.name}
                  </p>

                  <div className="mt-3 flex items-center flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                    {/* Primary Direct Download Button with dynamic download trigger */}
                    <button
                      type="button"
                      onClick={() => handleDirectDownload(file.url, file.name)}
                      className={`flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-lg transition-all cursor-pointer ${
                        idx === 0
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>DOWNLOAD {file.format.toUpperCase()}</span>
                    </button>

                    {/* Direct link in new tab */}
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-300 hover:text-white py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                      title="Open direct file in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                      <span>Open Video</span>
                    </a>

                    {/* Copy Link button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(file.url, idx)}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
                      title="Copy direct download link"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied Link!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    {/* WhatsApp share for this file */}
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(file.url)}
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 py-2 px-2.5 rounded-lg hover:bg-emerald-950/40 transition-colors border border-emerald-500/20 cursor-pointer ml-auto"
                      title="Share link on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* When no legal downloadable file exists: Hide DOWNLOAD completely, show OPEN SOURCE instead */}
          {!isLoading && !isLegallyDownloadable && (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Direct browser downloading is not enabled for this title. You may review the complete archive documentation on the official Internet Archive page.
              </p>
              <a
                href={sourceArchiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>OPEN SOURCE</span>
              </a>
            </div>
          )}

          {/* High-Speed Direct Mirror Sponsor Option */}
          <div className="p-3.5 bg-gradient-to-r from-amber-950/30 to-orange-950/30 border border-amber-500/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>হাই-স্পিড মিরর (High-Speed Direct Download Server)</span>
              </span>
              <span className="text-[10px] uppercase font-mono text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded">Fast Mirror</span>
            </div>
            <p className="text-[11px] text-slate-300">
              মূল সার্ভার স্লো থাকলে নিচের ডাইরেক্ট হাই-স্পিড মিরর থেকে দ্রুত ফুল স্পিডে ডাউনলোড বা স্ট্রিম করতে পারেন:
            </p>
            <a
              href="https://www.profitableratecpmnetwork.com/ft94kk9rkm?key=a4de72b8b7c9da73efa900fda0bad8a2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 hover:from-amber-500 to-orange-600 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/60 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>⚡ DOWNLOAD VIA FAST SERVER (SERVER 2)</span>
            </a>
          </div>

          {/* Modal Ad Placement */}
          <div className="flex justify-center pt-2">
            <AdBanner type="banner_160_300" />
          </div>

          {/* Source Link Reference */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Archive Identifier: <code className="text-slate-300 font-mono">{movie.identifier}</code></span>
            <a
              href={sourceArchiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>OPEN SOURCE</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
