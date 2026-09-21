import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { defaultFilters, type ListingFilters } from '../lib/filters/listingFilters';
import type { AreaShape } from '../lib/types';
import { extensionStorage } from './kvStorage';

interface AppState {
  filters: ListingFilters;
  areas: AreaShape[]; // shapes currently on the map
  pickedIds: string[]; // pins clicked on the map
  setFilters: (patch: Partial<ListingFilters>) => void;
  resetFilters: () => void;
  setAreas: (areas: AreaShape[]) => void;
  setPicked: (ids: string[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      areas: [],
      pickedIds: [],
      setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: defaultFilters }),
      setAreas: (areas) => set({ areas }),
      setPicked: (pickedIds) => set({ pickedIds }),
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => extensionStorage),
      partialize: (s) => ({ filters: s.filters, areas: s.areas }), // picks are transient
    },
  ),
);
