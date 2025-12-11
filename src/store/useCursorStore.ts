// Buat file baru: src/store/useCursorStore.ts
import { create } from 'zustand';

type CursorVariant = 'default' | 'hover' | 'text' | 'hidden';

interface CursorState {
  variant: CursorVariant;
  setVariant: (variant: CursorVariant) => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  variant: 'default',
  setVariant: (variant) => set({ variant }),
}));