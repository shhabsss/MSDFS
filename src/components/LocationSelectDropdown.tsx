import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  ChevronDown, 
  Search, 
  Plus, 
  Check, 
  Bookmark, 
  Navigation,
  FileText,
  X
} from 'lucide-react';
import { SavedLocation } from '../types';
import { PUDUCHERRY_AREAS } from '../data/pincodes';

interface LocationSelectDropdownProps {
  value: string;
  onChange: (address: string, locationId?: string) => void;
  savedLocations: SavedLocation[];
  onQuickSaveLocation?: (location: Omit<SavedLocation, 'id' | 'createdAt'>) => void;
}

export const LocationSelectDropdown: React.FC<LocationSelectDropdownProps> = ({
  value,
  onChange,
  savedLocations,
  onQuickSaveLocation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [quickSaveName, setQuickSaveName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = searchQuery.toLowerCase().trim();

  // Filter saved locations
  const filteredSaved = savedLocations.filter(loc => {
    if (!query) return true;
    return (
      loc.name.toLowerCase().includes(query) ||
      loc.fullAddress.toLowerCase().includes(query) ||
      (loc.areaName && loc.areaName.toLowerCase().includes(query)) ||
      (loc.notes && loc.notes.toLowerCase().includes(query))
    );
  });

  // Filter Puducherry areas
  const filteredAreas = PUDUCHERRY_AREAS.filter(item => {
    if (!query) return true;
    return (
      item.area.toLowerCase().includes(query) ||
      item.pincode.includes(query)
    );
  }).slice(0, 8); // Top 8 area suggestions

  const handleSelectLocation = (loc: SavedLocation) => {
    onChange(loc.fullAddress, loc.id);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleSelectArea = (area: string, pincode: string) => {
    const formatted = `${area}, Puducherry - ${pincode}`;
    onChange(formatted);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleQuickSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !quickSaveName.trim() || !onQuickSaveLocation) return;

    onQuickSaveLocation({
      name: quickSaveName.trim(),
      fullAddress: value.trim(),
      areaName: quickSaveName.trim()
    });

    setIsQuickSaving(false);
    setQuickSaveName('');
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Service Location / Address in Puducherry *</span>
        </label>

        {onQuickSaveLocation && value.trim().length > 5 && (
          <button
            type="button"
            onClick={() => {
              setIsQuickSaving(true);
              setQuickSaveName(value.split(',')[0] || 'Saved Location');
            }}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 transition-colors"
          >
            <Bookmark className="w-3 h-3" />
            <span>+ Save this address</span>
          </button>
        )}
      </div>

      {/* Main Interactive Field with Dropdown Arrow */}
      <div className="relative">
        <div 
          onClick={() => setIsOpen(prev => !prev)}
          className="relative w-full cursor-pointer bg-slate-950 border border-slate-700/80 hover:border-slate-600 rounded-xl p-3 pr-10 text-sm text-white focus-within:border-blue-500 transition-all shadow-inner"
        >
          {value ? (
            <div className="text-white text-xs sm:text-sm font-medium leading-relaxed break-words">
              {value}
            </div>
          ) : (
            <span className="text-slate-500 text-xs sm:text-sm">
              Click to select from Saved Locations or search Puducherry areas...
            </span>
          )}

          {/* Small Dropdown Arrow on Right */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 hover:text-white pointer-events-none">
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input inside Dropdown */}
            <div className="p-2.5 border-b border-slate-800 bg-slate-950/80 sticky top-0 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search saved locations or Puducherry areas (e.g. Moolakulam, White Town)..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable list */}
            <div className="overflow-y-auto p-2 space-y-3 divide-y divide-slate-800/80">
              
              {/* Section 1: Saved Locations */}
              <div>
                <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Saved Locations ({filteredSaved.length})</span>
                  <span className="text-slate-500 text-[9px] font-normal">Click to select</span>
                </div>

                {filteredSaved.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-500 italic">
                    No matching saved locations found
                  </p>
                ) : (
                  <div className="space-y-1 mt-1">
                    {filteredSaved.map(loc => {
                      const isSelected = value === loc.fullAddress;
                      return (
                        <div
                          key={loc.id}
                          onClick={() => handleSelectLocation(loc)}
                          className={`cursor-pointer rounded-xl p-2.5 transition-all text-xs flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-blue-600/20 border border-blue-500/50 text-white'
                              : 'hover:bg-slate-800/90 text-slate-200 border border-transparent'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs truncate">
                                {loc.name}
                              </span>
                              {loc.areaName && (
                                <span className="text-[10px] font-semibold bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700">
                                  {loc.areaName}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {loc.fullAddress}
                            </p>
                            {loc.notes && (
                              <p className="text-[10px] text-amber-400/80 truncate mt-0.5">
                                📌 {loc.notes}
                              </p>
                            )}
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Quick Puducherry Pincode Areas */}
              <div className="pt-2">
                <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Puducherry Areas & Pincodes</span>
                  <span className="text-slate-500 text-[9px] font-normal">Auto-complete address</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                  {filteredAreas.map(item => (
                    <div
                      key={item.area}
                      onClick={() => handleSelectArea(item.area, item.pincode)}
                      className="cursor-pointer rounded-lg p-2 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-between gap-1"
                    >
                      <span className="font-medium truncate">{item.area}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40 shrink-0">
                        {item.pincode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Direct editing fallback / manual details */}
      <div className="pt-1">
        <textarea
          rows={2}
          id="textarea-address-custom"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or type/modify specific building, flat number, street and landmark here..."
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 resize-none"
        />
      </div>

      {/* Inline Quick Save Dialog */}
      {isQuickSaving && (
        <form 
          onSubmit={handleQuickSaveSubmit}
          className="bg-slate-900 border border-emerald-500/50 rounded-xl p-3 space-y-2 shadow-xl animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              Save this address for 1-click use in future bookings:
            </span>
            <button
              type="button"
              onClick={() => setIsQuickSaving(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              value={quickSaveName}
              onChange={(e) => setQuickSaveName(e.target.value)}
              placeholder="Name for location (e.g. Moolakulam Villa)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shrink-0 shadow-xs"
            >
              Save Location
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
