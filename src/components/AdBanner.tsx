import React from 'react';

type AdType = 'leaderboard' | 'mobile_banner' | 'banner_468' | 'skyscraper' | 'banner_160_300' | 'native';

interface AdBannerProps {
  type: AdType;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ type, className = '' }) => {
  // Direct HighRevenueFormat Ad Keys provided by user
  // 728x90: 045d19d6e2d9e04777df2a216063ab7d
  // 320x50: 0faf1d6c5740ea1332526cb63a2524ab
  // 468x60: bcdb2bfa3fbe2cddb3146bcc1d21c19a
  // 160x600: 9ea08307b6f482ddd11dd126d7f7fc1a
  // 160x300: a299b54e28f29ee57535cbd4d6b113e6

  if (type === 'leaderboard') {
    return (
      <div className={`w-full flex flex-col items-center justify-center my-3 overflow-hidden ${className}`}>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-mono">Advertisement</span>
        {/* Desktop 728x90 */}
        <div className="hidden md:flex justify-center items-center w-[728px] h-[90px] bg-slate-900/60 rounded border border-slate-800/80 overflow-hidden">
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent;display:flex;justify-content:center;align-items:center;}</style></head><body>
              <script>
                atOptions = {
                  'key' : '045d19d6e2d9e04777df2a216063ab7d',
                  'format' : 'iframe',
                  'height' : 90,
                  'width' : 728,
                  'params' : {}
                };
              <\/script>
              <script src="https://www.highrevenueformat.com/045d19d6e2d9e04777df2a216063ab7d/invoke.js"><\/script>
            </body></html>`}
            width="728"
            height="90"
            className="overflow-hidden border-0"
            title="Advertisement 728x90"
          />
        </div>
        {/* Mobile 320x50 */}
        <div className="flex md:hidden justify-center items-center w-[320px] h-[50px] bg-slate-900/60 rounded border border-slate-800/80 overflow-hidden">
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent;display:flex;justify-content:center;align-items:center;}</style></head><body>
              <script>
                atOptions = {
                  'key' : '0faf1d6c5740ea1332526cb63a2524ab',
                  'format' : 'iframe',
                  'height' : 50,
                  'width' : 320,
                  'params' : {}
                };
              <\/script>
              <script src="https://www.highrevenueformat.com/0faf1d6c5740ea1332526cb63a2524ab/invoke.js"><\/script>
            </body></html>`}
            width="320"
            height="50"
            className="overflow-hidden border-0"
            title="Advertisement 320x50"
          />
        </div>
      </div>
    );
  }

  if (type === 'mobile_banner') {
    return (
      <div className={`w-full flex flex-col items-center justify-center my-3 overflow-hidden ${className}`}>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-mono">Sponsored</span>
        <div className="flex justify-center items-center w-[320px] h-[50px] bg-slate-900/60 rounded border border-slate-800/80 overflow-hidden">
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent;display:flex;justify-content:center;align-items:center;}</style></head><body>
              <script>
                atOptions = {
                  'key' : '0faf1d6c5740ea1332526cb63a2524ab',
                  'format' : 'iframe',
                  'height' : 50,
                  'width' : 320,
                  'params' : {}
                };
              <\/script>
              <script src="https://www.highrevenueformat.com/0faf1d6c5740ea1332526cb63a2524ab/invoke.js"><\/script>
            </body></html>`}
            width="320"
            height="50"
            className="overflow-hidden border-0"
            title="Advertisement 320x50"
          />
        </div>
      </div>
    );
  }

  if (type === 'banner_468') {
    return (
      <div className={`w-full flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-mono">Advertisement</span>
        <div className="hidden sm:flex justify-center items-center w-[468px] h-[60px] bg-slate-900/60 rounded border border-slate-800/80 overflow-hidden">
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent;display:flex;justify-content:center;align-items:center;}</style></head><body>
              <script>
                atOptions = {
                  'key' : 'bcdb2bfa3fbe2cddb3146bcc1d21c19a',
                  'format' : 'iframe',
                  'height' : 60,
                  'width' : 468,
                  'params' : {}
                };
              <\/script>
              <script src="https://www.highrevenueformat.com/bcdb2bfa3fbe2cddb3146bcc1d21c19a/invoke.js"><\/script>
            </body></html>`}
            width="468"
            height="60"
            className="overflow-hidden border-0"
            title="Advertisement 468x60"
          />
        </div>
        {/* Mobile fallback 320x50 */}
        <div className="flex sm:hidden justify-center items-center w-[320px] h-[50px] bg-slate-900/60 rounded border border-slate-800/80 overflow-hidden">
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent;display:flex;justify-content:center;align-items:center;}</style></head><body>
              <script>
                atOptions = {
                  'key' : '0faf1d6c5740ea1332526cb63a2524ab',
                  'format' : 'iframe',
                  'height' : 50,
                  'width' : 320,
                  'params' : {}
                };
              <\/script>
              <script src="https://www.highrevenueformat.com/0faf1d6c5740ea1332526cb63a2524ab/invoke.js"><\/script>
            </body></html>`}
            width="320"
            height="50"
            className="overflow-hidden border-0"
            title="Advertisement 320x50"
          />
        </div>
      </div>
    );
  }

  if (type === 'skyscraper') {
    return (
      <div className={`flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-mono">Sponsored</span>
        <div className="w-[160px] h-[600px] bg-slate-900/60 rounded border border-slate-800/80 overflow-hidden">
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent;display:flex;justify-content:center;align-items:center;}</style></head><body>
              <script>
                atOptions = {
                  'key' : '9ea08307b6f482ddd11dd126d7f7fc1a',
                  'format' : 'iframe',
                  'height' : 600,
                  'width' : 160,
                  'params' : {}
                };
              <\/script>
              <script src="https://www.highrevenueformat.com/9ea08307b6f482ddd11dd126d7f7fc1a/invoke.js"><\/script>
            </body></html>`}
            width="160"
            height="600"
            className="overflow-hidden border-0"
            title="Advertisement 160x600"
          />
        </div>
      </div>
    );
  }

  if (type === 'banner_160_300') {
    return (
      <div className={`flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-mono">Sponsored</span>
        <div className="w-[160px] h-[300px] bg-slate-900/60 rounded border border-slate-800/80 overflow-hidden">
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent;display:flex;justify-content:center;align-items:center;}</style></head><body>
              <script>
                atOptions = {
                  'key' : 'a299b54e28f29ee57535cbd4d6b113e6',
                  'format' : 'iframe',
                  'height' : 300,
                  'width' : 160,
                  'params' : {}
                };
              <\/script>
              <script src="https://www.highrevenueformat.com/a299b54e28f29ee57535cbd4d6b113e6/invoke.js"><\/script>
            </body></html>`}
            width="160"
            height="300"
            className="overflow-hidden border-0"
            title="Advertisement 160x300"
          />
        </div>
      </div>
    );
  }

  if (type === 'native') {
    return (
      <div className={`w-full max-w-5xl mx-auto my-6 px-4 ${className}`}>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recommended For You</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Sponsored</span>
          </div>
          <div className="min-h-[120px] w-full flex items-center justify-center">
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;background:transparent;}</style></head><body>
                <script async="async" data-cfasync="false" src="https://pl31310465.profitableratecpmnetwork.com/c239e247cc4bef465bb9b4c45086c883/invoke.js"><\/script>
                <div id="container-c239e247cc4bef465bb9b4c45086c883"></div>
              </body></html>`}
              className="w-full min-h-[140px] border-0"
              title="Native Sponsored Recommendation"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
