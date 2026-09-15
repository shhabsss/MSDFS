import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Building2, 
  Navigation,
  FileText
} from 'lucide-react';
import { SavedLocation } from '../types';

interface SavedLocationsManagementProps {
  locations: SavedLocation[];
  onAddLocation: (location: Omit<SavedLocation, 'id' | 'createdAt'>) => void;
  onUpdateLocation: (id: string, updated: Partial<SavedLocation>) => void;
  onDeleteLocation: (id: string) => void;
  onSelectForBooking?: (location: SavedLocation) => void;
}

export const SavedLocationsManagement: React.FC<SavedLocationsManagementProps> = ({
  locations,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  onSelectForBooking
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New location form state
  const [name, setName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [areaName, setAreaName] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Editing state
  const [editName, setEditName] = useState('');
  const [editFullAddress, setEditFullAddress] = useState('');
  const [editAreaName, setEditAreaName] = useState('');
  const [editMapsUrl, setEditMapsUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const filteredLocations = locations.filter(loc => {
    const q = searchTerm.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.fullAddress.toLowerCase().includes(q) ||
      (loc.areaName && loc.areaName.toLowerCase().includes(q)) ||
      (loc.notes && loc.notes.toLowerCase().includes(q))
    );
  });

  const handleStartEdit = (loc: SavedLocation) => {
    setEditingId(loc.id);
    setEditName(loc.name);
    setEditFullAddress(loc.fullAddress);
    setEditAreaName(loc.areaName || '');
    setEditMapsUrl(loc.mapsUrl || '');
    setEditNotes(loc.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim() || !editFullAddress.trim()) return;
    onUpdateLocation(id, {
      name: editName.trim(),
      fullAddress: editFullAddress.trim(),
      areaName: editAreaName.trim() || undefined,
      mapsUrl: editMapsUrl.trim() || undefined,
      notes: editNotes.trim() || undefined
    });
    setEditingId(null);
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fullAddress.trim()) return;

    onAddLocation({
      name: name.trim(),
      fullAddress: fullAddress.trim(),
      areaName: areaName.trim() || undefined,
      mapsUrl: mapsUrl.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setName('');
    setFullAddress('');
    setAreaName('');
    setMapsUrl('');
    setNotes('');
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Service Locations Directory
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Manage saved service addresses for instant 1-click booking selection
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-add-location"
            onClick={() => setIsAddingNew(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-900/30 transition-all text-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Location</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-locations"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved locations by name, area (e.g. Moolakulam, White Town), or address..."
            className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Add New Location Modal / Form */}
      {isAddingNew && (
        <form
          onSubmit={handleCreateLocation}
          className="bg-slate-900/90 border border-blue-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Add Saved Service Location
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Location Name *
              </label>
              <input
                type="text"
                required
                id="input-loc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Moolakulam Main Residence"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Area / Locality Name
              </label>
              <input
                type="text"
                id="input-loc-area"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g. Moolakulam, White Town, Lawspet"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Address with Pincode *
            </label>
            <textarea
              required
              rows={2}
              id="input-loc-address"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="e.g. No. 24, Mariamman Koil Street, Moolakulam, Puducherry - 605010"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Google Maps Link (Optional)
              </label>
              <input
                type="url"
                id="input-loc-maps"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Landmarks / Gate Directions (Optional)
              </label>
              <input
                type="text"
                id="input-loc-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Near Mariamman Temple, Ground floor parking"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-new-location"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-md"
            >
              Save Location
            </button>
          </div>
        </form>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLocations.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-white">No service locations found</p>
            <p className="text-xs text-slate-500 mt-1">
              Add commonly serviced addresses so you can select them with 1 click in New Booking.
            </p>
          </div>
        ) : (
          filteredLocations.map((loc) => {
            const isEditing = editingId === loc.id;

            if (isEditing) {
              return (
                <div
                  key={loc.id}
                  className="bg-slate-900 border border-blue-500/50 rounded-2xl p-5 shadow-xl space-y-3"
                >
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Location Name"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                    <input
                      type="text"
                      value={editAreaName}
                      onChange={(e) => setEditAreaName(e.target.value)}
                      placeholder="Area / Locality"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <textarea
                      rows={2}
                      value={editFullAddress}
                      onChange={(e) => setEditFullAddress(e.target.value)}
                      placeholder="Full Address"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white resize-none"
                    />
                    <input
                      type="text"
                      value={editMapsUrl}
                      onChange={(e) => setEditMapsUrl(e.target.value)}
                      placeholder="Google Maps URL"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notes / Landmark"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(loc.id)}
                      className="px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={loc.id}
                id={`location-card-${loc.id}`}
                className="group bg-slate-900 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">
                          {loc.name}
                        </h4>
                        {loc.areaName && (
                          <span className="inline-block text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 mt-0.5">
                            {loc.areaName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(loc)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        title="Edit location"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLocation(loc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Delete location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {loc.fullAddress}
                  </p>

                  {loc.notes && (
                    <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                      <FileText className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span className="truncate">{loc.notes}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                  {loc.mapsUrl ? (
                    <a
                      href={loc.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium text-[11px]"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Google Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-slate-600 text-[11px]">No map link</span>
                  )}

                  {onSelectForBooking && (
                    <button
                      type="button"
                      onClick={() => onSelectForBooking(loc)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Select for Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
