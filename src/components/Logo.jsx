import React from 'react';

export default function Logo({ size = 'md', className = '', showText = true, layout = 'horizontal' }) {
  const sizeMap = {
    sm: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-11 h-11', icon: 'w-6 h-6', text: 'text-base', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', icon: 'w-8 h-8', text: 'text-xl', sub: 'text-xs' },
    xl: { box: 'w-20 h-20', icon: 'w-11 h-11', text: 'text-2xl', sub: 'text-xs' },
    '2xl': { box: 'w-24 h-24', icon: 'w-14 h-14', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex ${layout === 'vertical' ? 'flex-col items-center text-center' : 'items-center text-left'} gap-2 ${className}`}>
      {showText && (
        <div className={`flex flex-col ${layout === 'vertical' ? 'items-center text-center' : 'text-left'}`}>
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-wider text-white ${currentSize.text} drop-shadow-md leading-none`}>
              SONABEL
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          </div>
          <span className={`${currentSize.sub} font-bold tracking-widest text-sky-400 uppercase mt-1 leading-tight`}>
            Énergie du Burkina
          </span>
          <div className="burkina-flag-bar mt-1" />
        </div>
      )}
    </div>
  );
}


