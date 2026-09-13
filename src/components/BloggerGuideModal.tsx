import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Copy, Check, ExternalLink, Globe, 
  Share2, Layers, CheckCircle2, FileCode, Code, Eye
} from 'lucide-react';

interface BloggerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BloggerGuideModal: React.FC<BloggerGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<'xml' | 'html' | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'code-html' | 'code-xml' | 'guide'>('files');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [xmlCode, setXmlCode] = useState<string>('');
  const [isLoadingCode, setIsLoadingCode] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pre-load file contents when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingCode(true);

    Promise.all([
      fetch('/html.html').then(r => r.text()).catch(() => fetch('/cinevault_single_file.html').then(r => r.text()).catch(() => '')),
      fetch('/cinevault_blogger_theme.xml').then(r => r.text()).catch(() => '')
    ]).then(([html, xml]) => {
      if (isMounted) {
        setHtmlCode(html);
        setXmlCode(xml);
        setIsLoadingCode(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async (type: 'xml' | 'html') => {
    const filename = type === 'xml' ? 'cinevault_blogger_theme.xml' : 'html.html';
    const mimeType = type === 'xml' ? 'application/xml;charset=utf-8' : 'text/html;charset=utf-8';
    const content = type === 'xml' ? xmlCode : htmlCode;

    try {
      if (content) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);
      } else {
        const a = document.createElement('a');
        a.href = `/${filename}`;
        a.download = filename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
        }, 1500);
      }
    } catch {
      window.open(`/${filename}`, '_blank');
    }
  };

  const handleCopyCode = async (type: 'xml' | 'html') => {
    const content = type === 'xml' ? xmlCode : htmlCode;
    try {
      if (content) {
        await navigator.clipboard.writeText(content);
      } else {
        const filename = type === 'xml' ? 'cinevault_blogger_theme.xml' : 'html.html';
        const res = await fetch(`/${filename}`);
        const text = await res.text();
        await navigator.clipboard.writeText(text);
      }
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 3000);
    } catch {
      // Fallback selection
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 3000);
      }
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      "🎬 CineVault - Free & Legal Movies Website with Ads integrated! Check out: " + window.location.origin
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 my-auto text-white flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                সম্পূর্ণ ওয়েবসাইটের কোড ও ব্লগার ফাইল
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  All Ads Included
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                এক ফাইলের মধ্যে সমস্ত কোড ও বিজ্ঞাপন যুক্ত করে তৈরি করা হয়েছে
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-950 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'files'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>১. ফাইল ডাউনলোড (Download)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code-html')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'code-html'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>২. সম্পূর্ণ HTML কোড দেখুন ও কপি</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code-xml')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'code-xml'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>৩. ব্লগার থিম XML কোড</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>৪. আপলোড করার নিয়ম (Blogger Guide)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* TAB 1: FILE DOWNLOAD CARDS */}
          {activeTab === 'files' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  এখানে দুটি ফাইল রয়েছে। আপনার সুবিধামতো যেকোনো একটি ব্যবহার করতে পারেন। যদি ব্রাউজারে বা মোবাইলে সরাসরি ডাউনলোড না হয়, তবে <strong>&quot;নতুন ট্যাবে খুলুন&quot;</strong> বাটনে ক্লিক করে <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-white">Ctrl + S</kbd> প্রেস করতে পারেন, অথবা <strong>&quot;কোড দেখুন ও কপি&quot;</strong> ট্যাব থেকে সম্পূর্ণ কোড এক ক্লিকে কপি করে ব্লগারে পেস্ট করতে পারেন!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* File 1: Single HTML Page */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/40 space-y-3 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                        Blogger Page / Standalone
                      </span>
                      <span className="text-xs text-slate-400 font-mono">~48 KB</span>
                    </div>

                    <h4 className="font-bold text-base text-white mt-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      html.html (সব কোড ১টি ফাইলে)
                    </h4>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      সম্পূর্ণ ওয়েবসাইটের সিঙ্গেল এইচটিএমএল ফাইল। এর মধ্যে সিএসএস, প্লেয়ার, মুভি ডেটা ও আপনার সব অ্যাড কোড (Popunder, Social Bar, 728x90, 320x50, 468x60, Native) একসাথে জুড়ে দেওয়া আছে।
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload('html')}
                        className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>html.html ডাউনলোড</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyCode('html')}
                        className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2.5 px-3 rounded-xl border border-slate-700 transition-all cursor-pointer"
                      >
                        {copiedType === 'html' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        <span>{copiedType === 'html' ? 'কপি হয়েছে!' : 'সব কোড কপি'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="/html.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-blue-300 hover:text-white rounded-lg border border-slate-700/80 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>নতুন ট্যাবে html.html খুলুন (Save As)</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveTab('code-html')}
                        className="flex items-center justify-center gap-1 text-[11px] py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>কোড দেখুন</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* File 2: Blogger Theme XML */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40 space-y-3 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                        Blogger Theme XML
                      </span>
                      <span className="text-xs text-slate-400 font-mono">~39 KB</span>
                    </div>

                    <h4 className="font-bold text-base text-white mt-2 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-indigo-400" />
                      cinevault_blogger_theme.xml
                    </h4>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      ব্লগার থিম ফাইল। Blogger &gt; Theme &gt; Restore থেকে এক ক্লিকে আপলোড করলেই সম্পূর্ণ ব্লগ আপনার পূর্ণাঙ্গ মুভি ডাউনলোডার ও স্ট্রিমিং পোর্টালে পরিণত হবে।
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload('xml')}
                        className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-lg shadow-indigo-900/40 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>থিম XML ডাউনলোড</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyCode('xml')}
                        className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2.5 px-3 rounded-xl border border-slate-700 transition-all cursor-pointer"
                      >
                        {copiedType === 'xml' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        <span>{copiedType === 'xml' ? 'কপি হয়েছে!' : 'XML কোড কপি'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="/cinevault_blogger_theme.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white rounded-lg border border-slate-700/80 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>XML ফাইল সরাসরি খুলুন</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveTab('code-xml')}
                        className="flex items-center justify-center gap-1 text-[11px] py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>কোড দেখুন</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: LIVE HTML CODE VIEWER & COPY BOX */}
          {activeTab === 'code-html' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>সম্পূর্ণ Single-File HTML কোড (All Codes in 1 File)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    নিচের বক্সে ওয়েবসাইটের সম্পূর্ণ কোড রয়েছে। এক ক্লিকে কপি করে ব্লগারে পেস্ট করুন।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCode('html')}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    {copiedType === 'html' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === 'html' ? 'সম্পূর্ণ কোড কপি হয়েছে!' : 'সব কোড কপি করুন (Copy All)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload('html')}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ডাউনলোড</span>
                  </button>
                </div>
              </div>

              {isLoadingCode ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  কোড লোড হচ্ছে...
                </div>
              ) : (
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    readOnly
                    value={htmlCode}
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    className="w-full h-80 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-blue-500 leading-relaxed resize-y select-all"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] bg-slate-950/80 px-2 py-1 rounded text-slate-400 border border-slate-800">
                    {htmlCode.length} characters • ক্লিক করে সব সিলেক্ট করুন
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE XML CODE VIEWER & COPY BOX */}
          {activeTab === 'code-xml' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <span>ব্লগার থিম XML কোড (Blogger Theme Code)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Blogger &gt; Theme &gt; Edit HTML-এ সরাসরি পেস্ট করার জন্য প্রস্তুত।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCode('xml')}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    {copiedType === 'xml' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === 'xml' ? 'XML কোড কপি হয়েছে!' : 'সব XML কপি করুন (Copy All)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload('xml')}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ডাউনলোড</span>
                  </button>
                </div>
              </div>

              {isLoadingCode ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  কোড লোড হচ্ছে...
                </div>
              ) : (
                <div className="relative">
                  <textarea
                    readOnly
                    value={xmlCode}
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    className="w-full h-80 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y select-all"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] bg-slate-950/80 px-2 py-1 rounded text-slate-400 border border-slate-800">
                    {xmlCode.length} characters • ক্লিক করে সব সিলেক্ট করুন
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BLOGGER GUIDE & INSTRUCTIONS */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                ব্লগারে আপলোড করার ২টি সহজ পদ্ধতি (Blogger Setup Methods)
              </h4>

              {/* Method A: As a Dedicated Page (Recommended) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    পদ্ধতি ১: ব্লগারে নতুন পেজ (Page) হিসেবে তৈরি করুন (সবচেয়ে সহজ)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    সুপারিশকৃত
                  </span>
                </div>

                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
                  <li>
                    প্রথমে <strong className="text-white">Blogger.com</strong>-এ লগইন করে আপনার ব্লগে যান।
                  </li>
                  <li>
                    বাম পাশের মেনু থেকে <strong className="text-blue-300">Pages</strong> অপশনে ক্লিক করে <strong className="text-white">+ New Page</strong> বাটনে চাপ দিন।
                  </li>
                  <li>
                    টাইটেল দিন <strong className="text-white">&quot;CineVault - Free Movies&quot;</strong>।
                  </li>
                  <li>
                    উপরে বামে থাকা <strong className="text-amber-300">কলম/পেনসিল আইকনে</strong> ক্লিক করে <strong className="text-white">&quot;HTML View&quot;</strong> সিলেক্ট করুন।
                  </li>
                  <li>
                    উপরের <strong className="text-blue-400">&quot;HTML কোড দেখুন ও কপি&quot;</strong> ট্যাব থেকে কপি করা সব কোড হুবহু পেস্ট করে দিন।
                  </li>
                  <li>
                    ডানদিকের <strong className="text-emerald-400">&quot;Publish&quot;</strong> বাটনে ক্লিক করে দিন। ব্যাস, আপনার সাইট লাইভ!
                  </li>
                </ol>
              </div>

              {/* Method B: As Full Blog Theme */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-indigo-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    পদ্ধতি ২: ব্লগের মূল থিম (Theme) হিসেবে আপলোড করুন
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                    Full Blog
                  </span>
                </div>

                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
                  <li>
                    Blogger মেনু থেকে <strong className="text-blue-300">Theme</strong> অপশনে যান।
                  </li>
                  <li>
                    <strong className="text-white">&quot;Customize&quot;</strong> বাটনের পাশের ছোট ড্রপডাউন তীরে (▼) ক্লিক করুন।
                  </li>
                  <li>
                    <strong className="text-white">&quot;Restore&quot;</strong> এ ক্লিক করে আপনার ডাউনলোড করা <code className="text-indigo-300 font-mono">cinevault_blogger_theme.xml</code> ফাইলটি সরাসরি আপলোড করুন।
                  </li>
                  <li>
                    (অথবা <strong className="text-white">&quot;Edit HTML&quot;</strong> এ গিয়ে আগের কোড ডিলিট করে <strong className="text-indigo-300">&quot;XML কোড&quot;</strong> পেস্ট করে সেভ করুন)।
                  </li>
                </ol>
              </div>

              {/* WhatsApp Sharing Instructions */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    হোয়াটসঅ্যাপে (WhatsApp) প্রচার ও আয় করার উপায়:
                  </h5>
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>এখনই শেয়ার করুন</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  আপনার ব্লগারে পেজ পাবলিশ করার পর সেটির লিংক কপি করে WhatsApp গ্রুপ বা স্ট্যাটাসে দিন। দর্শকরা যখন মুভি দেখতে বা ডাউনলোড করতে ঢুকবে, তখন তাদের সামনে আপনার ব্যানার, নেটিভ অ্যাড ও পপআন্ডার বিজ্ঞাপন চালু হয়ে আপনার সিপিসি/সিপিএম নেটওয়ার্ক থেকে আর্নিং যোগ হবে।
                </p>
              </div>
            </div>
          )}

          {/* Ad Codes Included Checklist */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-slate-300 block mb-1">ফাইলের মধ্যে সক্রিয় বিজ্ঞাপনসমূহ:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">✓ 728x90 Leaderboard ব্যানার</span>
              <span className="flex items-center gap-1 text-emerald-400">✓ 320x50 মোবাইল ব্যানার</span>
              <span className="flex items-center gap-1 text-emerald-400">✓ 468x60 কনটেন্ট ব্যানার</span>
              <span className="flex items-center gap-1 text-emerald-400">✓ 160x300 ডাউনলোড বক্স ব্যানার</span>
              <span className="flex items-center gap-1 text-emerald-400">✓ নেটিভ রিকমেন্ডেশন অ্যাড কনটেইনার</span>
              <span className="flex items-center gap-1 text-emerald-400">✓ পপআন্ডার ও সোশ্যাল নেটওয়ার্ক স্ক্রিপ্ট</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/90">
          <a
            href="https://www.blogger.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Open Blogger.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>

      </div>
    </div>
  );
};

