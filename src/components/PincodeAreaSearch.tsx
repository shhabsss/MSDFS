import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin, Check, X, Sparkles, ChevronDown } from 'lucide-react';
import { PUDUCHERRY_AREAS, PINCODE_DESCRIPTIONS, AreaPincode } from '../data/pincodes';

interface PincodeAreaSearchProps {
  currentAddress: string;
  onSelectArea: (formattedAddress: string, pincode: string, areaName: string) => void;
}

export const PincodeAreaSearch: React.FC<PincodeAreaSearchProps> = ({
  currentAddress,
  onSelectArea
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered areas based on search query (by pincode or area name)
  const filteredAreas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return popular areas first when no query
      return PUDUCHERRY_AREAS.filter(a => a.isPopular).slice(0, 16);
    }
    return PUDUCHERRY_AREAS.filter(a => 
      a.pincode.includes(q) || 
      a.area.toLowerCase().includes(q) ||
      (PINCODE_DESCRIPTIONS[a.pincode] && PINCODE_DESCRIPTIONS[a.pincode].toLowerCase().includes(q))
    );
  }, [query]);

  // Highlight popular quick-chips
  const quickPicks = [
    { area: 'White Town', pincode: '605001' },
    { area: 'Muthialpet', pincode: '605003' },
    { area: 'Lawspet', pincode: '605008' },
    { area: 'Reddiarpalayam', pincode: '605010' },
    { area: 'Nellithope', pincode: '605005' },
    { area: 'Gorimedu (JIPMER)', pincode: '605006' },
    { area: 'Villianur', pincode: '605110' },
    { area: 'Ariyankuppam', pincode: '605007' },
    { area: 'Kalapet', pincode: '605014' },
    { area: 'Saram', pincode: '605013' }
  ];

  const handleApplyArea = (item: AreaPincode) => {
    // Smart address formatting
    let newAddress = '';
    const cleanCurrent = currentAddress.trim();
    
    // If user already typed door no / house / street
    if (cleanCurrent && !cleanCurrent.toLowerCase().includes(item.area.toLowerCase())) {
      // Remove any previously appended Puducherry pincode
      const stripped = cleanCurrent
        .replace(/,\s*Puducherry\s*-\s*\d{6}/gi, '')
        .replace(/\b\d{6}\b/g, '')
        .trim()
        .replace(/,\s*$/, '');
      
      newAddress = `${stripped}, ${item.area}, Puducherry - ${item.pincode}`;
    } else {
      newAddress = `${item.area}, Puducherry - ${item.pincode}`;
    }

    onSelectArea(newAddress, item.pincode, item.area);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      
      {/* Search Input Bar with Quick Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔍 Search PIN Code (e.g. 605001) or Area (White Town, Lawspet, etc.)..."
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-all"
          />
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Browse all Puducherry PIN codes"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">All Pincodes</span>
          <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Quick 1-Tap Popular Location Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Quick:
        </span>
        {quickPicks.map((qp) => (
          <button
            key={qp.area}
            type="button"
            onClick={() => handleApplyArea(qp)}
            className="whitespace-nowrap px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
          >
            {qp.area} <span className="text-emerald-700 font-mono text-[10px]">({qp.pincode})</span>
          </button>
        ))}
      </div>

      {/* Search Results Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-64 sm:max-h-72 flex flex-col animate-in fade-in zoom-in-98 duration-150">
          
          {/* Header */}
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>
              {query ? `Search results (${filteredAreas.length})` : `Popular Puducherry Locations (${filteredAreas.length})`}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">
              Click area to auto-insert in address
            </span>
          </div>

          {/* List */}
          <div className="overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-100">
            {filteredAreas.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                <p>No area found matching "<strong className="text-slate-800">{query}</strong>".</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  You can type any custom address or postal code directly in the address field below.
                </p>
              </div>
            ) : (
              filteredAreas.map((item) => (
                <button
                  key={`${item.area}-${item.pincode}`}
                  type="button"
                  onClick={() => handleApplyArea(item)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50/80 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-950 truncate">
                      {item.area}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100/70 group-hover:bg-emerald-200 px-2 py-0.5 rounded-md border border-emerald-300">
                      {item.pincode}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      + Insert
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer with postal directory note */}
          <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <span>Official India Post Puducherry Directory</span>
            <span className="font-semibold text-slate-600">All 605001 - 607402 Pincodes</span>
          </div>

        </div>
      )}

    </div>
  );
};
