import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export default function YearSelector({ value, onChange, className = '', label = 'Année' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const selectedYear = parseInt(value || currentYear.toString(), 10);
  const [displayedBaseYear, setDisplayedBaseYear] = useState(selectedYear);

  useEffect(() => {
    setDisplayedBaseYear(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDecrement = (e) => {
    e.stopPropagation();
    const newYear = Math.max(2020, selectedYear - 1);
    onChange(newYear.toString());
    setDisplayedBaseYear(newYear);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    const newYear = Math.min(2100, selectedYear + 1);
    onChange(newYear.toString());
    setDisplayedBaseYear(newYear);
  };

  // Generate a range of 12 years around base year
  const startYear = Math.max(2020, displayedBaseYear - 4);
  const yearList = Array.from({ length: 12 }, (_, i) => startYear + i);

  const handleSelect = (yr) => {
    onChange(yr.toString());
    setDisplayedBaseYear(yr);
    setIsOpen(false);
  };

  const handlePrevRange = (e) => {
    e.stopPropagation();
    setDisplayedBaseYear(prev => Math.max(2020, prev - 6));
  };

  const handleNextRange = (e) => {
    e.stopPropagation();
    setDisplayedBaseYear(prev => Math.min(2095, prev + 6));
  };

  const handleResetCurrent = (e) => {
    e.stopPropagation();
    setDisplayedBaseYear(currentYear);
    onChange(currentYear.toString());
    setIsOpen(false);
  };

  return (
    <div className={`relative z-30 inline-flex items-center gap-1 ${className}`} ref={containerRef}>
      {/* Modern Year Selector Control with Left (<) and Right (>) Buttons */}
      <div className="inline-flex items-center bg-slate-900 border border-slate-700/80 rounded-2xl p-1 shadow-xl backdrop-blur-md">
        
        {/* Left Button (<) Previous Year */}
        <button
          type="button"
          onClick={handleDecrement}
          className="px-2 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-sky-400 hover:text-white transition-all cursor-pointer border border-slate-800 active:scale-95 flex items-center justify-center gap-1 font-black text-xs"
          title="Année précédente (<)"
          aria-label="Année précédente"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Center Display / Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-black rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer select-none"
          aria-label="Sélectionner l'année"
        >
          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          {label && <span className="text-sky-300 font-extrabold hidden sm:inline">{label} :</span>}
          <span className="text-white font-black text-xs tracking-wider px-2.5 py-0.5 bg-sky-500 rounded-lg shadow-md border border-sky-300/40">
            {selectedYear}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-sky-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Right Button (>) Next Year */}
        <button
          type="button"
          onClick={handleIncrement}
          className="px-2 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-sky-400 hover:text-white transition-all cursor-pointer border border-slate-800 active:scale-95 flex items-center justify-center gap-1 font-black text-xs"
          title="Année suivante (>)"
          aria-label="Année suivante"
        >
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>

      </div>

      {/* Floating Popover Dropdown with High Z-Index */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 top-12 w-64 bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl p-3 z-50 text-white font-sans backdrop-blur-xl">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800 px-1">
            <span className="text-[11px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>Exercice</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevRange}
                className="p-1 hover:bg-slate-800 rounded-lg text-sky-400 transition-colors cursor-pointer"
                title="Période précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-white px-1">
                {startYear} - {startYear + 11}
              </span>
              <button
                type="button"
                onClick={handleNextRange}
                className="p-1 hover:bg-slate-800 rounded-lg text-sky-400 transition-colors cursor-pointer"
                title="Période suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Select Grid */}
          <div className="grid grid-cols-3 gap-1.5 p-0.5">
            {yearList.map((yr) => {
              const isSelected = selectedYear === yr;
              const isCurrent = currentYear === yr;

              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => handleSelect(yr)}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-300'
                      : isCurrent
                      ? 'bg-slate-800 text-sky-400 border border-sky-400/40 hover:bg-slate-700'
                      : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800'
                  }`}
                >
                  <span>{yr}</span>
                  {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Footer Reset Action */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] px-1">
            <span className="text-sky-400 font-bold">Sélection rapide</span>
            <button
              type="button"
              onClick={handleResetCurrent}
              className="text-white hover:text-sky-300 font-black flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-sky-400" />
              <span>Année {currentYear}</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

