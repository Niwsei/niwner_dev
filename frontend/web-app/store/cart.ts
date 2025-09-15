import { create } from 'zustand';

export type CartItem = { id: number; title: string; price?: number };

type State = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: number) => void;
  clear: () => void;
};

export const useCart = create<State>((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: s.items.find(i => i.id === item.id) ? s.items : [...s.items, item] })),
  remove: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
  clear: () => set({ items: [] }),
}));

