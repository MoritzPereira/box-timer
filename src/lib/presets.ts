import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Preset = {
  id: string;
  name: string;
  rounds: number;
  roundSec: number;
  restSec: number;
  prepSec: number;
  warnSec: number;
  builtIn?: boolean;
};

export const TEMPLATES: Preset[] = [
  { id: 'tpl-amateur', name: 'Amateur', rounds: 3, roundSec: 180, restSec: 60, prepSec: 10, warnSec: 10, builtIn: true },
  { id: 'tpl-sparring', name: 'Sparring', rounds: 6, roundSec: 120, restSec: 60, prepSec: 10, warnSec: 10, builtIn: true },
  { id: 'tpl-profi', name: 'Profi', rounds: 12, roundSec: 180, restSec: 60, prepSec: 10, warnSec: 10, builtIn: true },
  { id: 'tpl-mma', name: 'MMA', rounds: 5, roundSec: 300, restSec: 60, prepSec: 10, warnSec: 10, builtIn: true },
];

export const NEW_PRESET: Omit<Preset, 'id'> = {
  name: '',
  rounds: 6,
  roundSec: 120,
  restSec: 60,
  prepSec: 10,
  warnSec: 10,
};

type PresetState = {
  custom: Preset[];
  save: (p: Omit<Preset, 'id' | 'builtIn'> & { id?: string }) => string;
  remove: (id: string) => void;
};

export const usePresets = create<PresetState>()(
  persist(
    (set, get) => ({
      custom: [],
      save: (p) => {
        // Vorlagen bleiben unverändert – Bearbeiten erzeugt ein eigenes Preset.
        const existing = p.id ? get().custom.find((c) => c.id === p.id) : undefined;
        const id = existing ? existing.id : `p-${Date.now().toString(36)}`;
        const preset: Preset = { ...p, id, builtIn: false, name: p.name.trim() || 'Mein Timer' };
        set((s) => ({
          custom: existing ? s.custom.map((c) => (c.id === id ? preset : c)) : [...s.custom, preset],
        }));
        return id;
      },
      remove: (id) => set((s) => ({ custom: s.custom.filter((c) => c.id !== id) })),
    }),
    {
      name: 'box-timer-presets',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // v2: Hinweis-Standard von 15 s auf 10 s gesenkt
      migrate: (state, version) => {
        const s = state as { custom: Preset[] };
        if (version < 2) s.custom = s.custom.map((c) => (c.warnSec === 15 ? { ...c, warnSec: 10 } : c));
        return s as PresetState;
      },
    },
  ),
);

export function findPreset(id: string | undefined, custom: Preset[]): Preset | undefined {
  if (!id) return undefined;
  return TEMPLATES.find((t) => t.id === id) ?? custom.find((c) => c.id === id);
}

export function describe(p: Preset): string {
  const fmt = (sec: number) =>
    sec % 60 === 0 ? `${sec / 60} min` : sec < 60 ? `${sec} s` : `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')} min`;
  return `${p.rounds} × ${fmt(p.roundSec)} · ${p.restSec > 0 ? `${fmt(p.restSec)} Pause` : 'ohne Pause'}`;
}
