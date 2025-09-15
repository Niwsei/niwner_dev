import { create } from 'zustand';

type Module = { id: string; title: string };

type State = {
  modules: Module[];
  setModules: (mods: Module[]) => void;
  addModule: (title?: string) => void;
  removeModule: (id: string) => void;
};

export const useBuilderStore = create<State>((set, get) => ({
  modules: [
    { id: 'm1', title: 'Introduction' },
    { id: 'm2', title: 'Basics' }
  ],
  setModules: (modules) => set({ modules }),
  addModule: (title = 'New Module') => set({ modules: [...get().modules, { id: `m${Date.now()}`, title }] }),
  removeModule: (id) => set({ modules: get().modules.filter(m => m.id !== id) })
}));
