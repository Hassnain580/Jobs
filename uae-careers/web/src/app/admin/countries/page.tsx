'use client';

import { useState } from 'react';

interface City {
  id: number;
  name: string;
  isActive: boolean;
}

interface Country {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  cities: City[];
  expanded: boolean;
}

const INITIAL_COUNTRIES: Country[] = [
  {
    id: 1, name: 'United Arab Emirates', code: 'AE', isActive: true, expanded: false,
    cities: [
      { id: 101, name: 'Dubai', isActive: true },
      { id: 102, name: 'Abu Dhabi', isActive: true },
      { id: 103, name: 'Sharjah', isActive: true },
      { id: 104, name: 'Ajman', isActive: true },
      { id: 105, name: 'Ras Al Khaimah', isActive: true },
    ],
  },
  {
    id: 2, name: 'Saudi Arabia', code: 'SA', isActive: true, expanded: false,
    cities: [
      { id: 201, name: 'Riyadh', isActive: true },
      { id: 202, name: 'Jeddah', isActive: true },
      { id: 203, name: 'Dammam', isActive: true },
    ],
  },
  {
    id: 3, name: 'Qatar', code: 'QA', isActive: true, expanded: false,
    cities: [
      { id: 301, name: 'Doha', isActive: true },
      { id: 302, name: 'Al Wakrah', isActive: false },
    ],
  },
  {
    id: 4, name: 'Kuwait', code: 'KW', isActive: true, expanded: false,
    cities: [
      { id: 401, name: 'Kuwait City', isActive: true },
    ],
  },
  {
    id: 5, name: 'Bahrain', code: 'BH', isActive: true, expanded: false,
    cities: [
      { id: 501, name: 'Manama', isActive: true },
    ],
  },
  {
    id: 6, name: 'Oman', code: 'OM', isActive: true, expanded: false,
    cities: [
      { id: 601, name: 'Muscat', isActive: true },
      { id: 602, name: 'Salalah', isActive: true },
    ],
  },
];

type ModalType = 'addCountry' | 'addCity' | 'editCountry' | 'editCity' | null;

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<Country[]>(INITIAL_COUNTRIES);
  const [modal, setModal] = useState<ModalType>(null);
  const [targetCountryId, setTargetCountryId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<{ countryId?: number; cityId?: number } | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');

  const toggleExpand = (id: number) =>
    setCountries((prev) => prev.map((c) => (c.id === id ? { ...c, expanded: !c.expanded } : c)));

  const toggleCountryActive = (id: number) =>
    setCountries((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));

  const toggleCityActive = (countryId: number, cityId: number) =>
    setCountries((prev) =>
      prev.map((c) =>
        c.id === countryId
          ? { ...c, cities: c.cities.map((city) => (city.id === cityId ? { ...city, isActive: !city.isActive } : city)) }
          : c
      )
    );

  const openAddCountry = () => { setFormName(''); setFormCode(''); setModal('addCountry'); };
  const openAddCity = (countryId: number) => { setFormName(''); setTargetCountryId(countryId); setModal('addCity'); };
  const openEditCountry = (c: Country) => { setFormName(c.name); setFormCode(c.code); setEditTarget({ countryId: c.id }); setModal('editCountry'); };
  const openEditCity = (countryId: number, city: City) => { setFormName(city.name); setEditTarget({ countryId, cityId: city.id }); setModal('editCity'); };

  const saveAddCountry = () => {
    if (!formName.trim()) return;
    setCountries((prev) => [...prev, { id: Date.now(), name: formName, code: formCode.toUpperCase().slice(0, 2), isActive: true, expanded: false, cities: [] }]);
    setModal(null);
  };

  const saveAddCity = () => {
    if (!formName.trim() || !targetCountryId) return;
    setCountries((prev) =>
      prev.map((c) =>
        c.id === targetCountryId
          ? { ...c, cities: [...c.cities, { id: Date.now(), name: formName, isActive: true }] }
          : c
      )
    );
    setModal(null);
  };

  const saveEditCountry = () => {
    if (!formName.trim() || !editTarget?.countryId) return;
    setCountries((prev) =>
      prev.map((c) => (c.id === editTarget.countryId ? { ...c, name: formName, code: formCode.toUpperCase().slice(0, 2) } : c))
    );
    setModal(null);
  };

  const saveEditCity = () => {
    if (!formName.trim() || !editTarget?.countryId || !editTarget.cityId) return;
    setCountries((prev) =>
      prev.map((c) =>
        c.id === editTarget.countryId
          ? { ...c, cities: c.cities.map((city) => (city.id === editTarget.cityId ? { ...city, name: formName } : city)) }
          : c
      )
    );
    setModal(null);
  };

  const deleteCountry = (id: number) => {
    if (confirm('Delete this country and all its cities?')) setCountries((prev) => prev.filter((c) => c.id !== id));
  };

  const deleteCity = (countryId: number, cityId: number) => {
    if (confirm('Delete this city?'))
      setCountries((prev) =>
        prev.map((c) => (c.id === countryId ? { ...c, cities: c.cities.filter((city) => city.id !== cityId) } : c))
      );
  };

  const modalConfig = {
    addCountry: { title: 'Add Country', onSave: saveAddCountry, showCode: true },
    editCountry: { title: 'Edit Country', onSave: saveEditCountry, showCode: true },
    addCity: { title: 'Add City', onSave: saveAddCity, showCode: false },
    editCity: { title: 'Edit City', onSave: saveEditCity, showCode: false },
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Countries & Cities</h3>
          <button onClick={openAddCountry} className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d2444] transition-colors">
            + Add Country
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {countries.map((country) => (
            <div key={country.id}>
              {/* Country row */}
              <div className={`flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors ${!country.isActive ? 'opacity-60' : ''}`}>
                <button
                  onClick={() => toggleExpand(country.id)}
                  className="text-gray-400 hover:text-[#1A3C6E] transition-colors w-5 text-center font-mono text-sm"
                >
                  {country.expanded ? '▾' : '▸'}
                </button>
                <span className="inline-flex items-center justify-center w-7 h-5 rounded text-xs font-bold bg-[#1A3C6E]/10 text-[#1A3C6E]">
                  {country.code}
                </span>
                <span className="flex-1 font-semibold text-gray-800">{country.name}</span>
                <span className="text-xs text-gray-400">{country.cities.length} cities</span>

                {/* Active toggle */}
                <button
                  onClick={() => toggleCountryActive(country.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${country.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${country.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>

                <button onClick={() => openEditCountry(country)} className="rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">Edit</button>
                <button onClick={() => openAddCity(country.id)} className="rounded px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">+ City</button>
                <button onClick={() => deleteCountry(country.id)} className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Del</button>
              </div>

              {/* Cities */}
              {country.expanded && (
                <div className="bg-gray-50/60 border-t border-gray-100">
                  {country.cities.length === 0 ? (
                    <p className="px-12 py-3 text-sm text-gray-400 italic">No cities yet. Click + City to add one.</p>
                  ) : (
                    country.cities.map((city) => (
                      <div
                        key={city.id}
                        className={`flex items-center gap-3 px-12 py-2.5 border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors ${!city.isActive ? 'opacity-50' : ''}`}
                      >
                        <span className="text-gray-300 text-sm">—</span>
                        <span className="flex-1 text-gray-700 text-sm">{city.name}</span>
                        <button
                          onClick={() => toggleCityActive(country.id, city.id)}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${city.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${city.isActive ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                        </button>
                        <button onClick={() => openEditCity(country.id, city)} className="rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">Edit</button>
                        <button onClick={() => deleteCity(country.id, city.id)} className="rounded px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Del</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{modalConfig[modal].title}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                />
              </div>
              {modalConfig[modal].showCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country Code (2 letters)</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="AE"
                    maxLength={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={modalConfig[modal].onSave} className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d2444]">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
