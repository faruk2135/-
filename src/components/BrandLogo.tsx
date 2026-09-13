import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none cursor-pointer group ${className}`}>
      {/* 3D-Style Film Reel & Glowing Play Icon */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        {/* Outer ambient glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-md group-hover:bg-blue-400/40 transition-all duration-300"></div>

        {/* 3D-layered metallic reel ring */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-700 via-blue-950 to-slate-900 p-[2px] shadow-lg shadow-blue-950/50 border border-blue-400/30">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-900/80 flex items-center justify-center relative overflow-hidden">
            {/* Film reel sprockets */}
            <div className="absolute inset-1 border-2 border-dashed border-blue-400/30 rounded-full opacity-60 animate-[spin_24s_linear_infinite] group-hover:border-blue-400/70"></div>
            
            {/* Center play triangle */}
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-blue-400 ml-0.5 filter drop-shadow-[0_0_6px_rgba(59,130,246,0.8)] group-hover:scale-110 transition-transform"></div>
          </div>
        </div>
      </div>

      {/* Brand typography */}
      <div className="flex flex-col leading-none">
        <div className={`font-extrabold tracking-tight ${textSizes[size]} text-white flex items-center`}>
          <span>CINE</span>
          <span className="text-blue-500 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            VAULT
          </span>
        </div>
        <span className="text-[10px] tracking-wider uppercase font-semibold text-blue-400/80 mt-0.5">
          Legal Open Cinema
        </span>
      </div>
    </div>
  );
};
