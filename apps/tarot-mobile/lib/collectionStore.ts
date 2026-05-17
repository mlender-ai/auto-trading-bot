import { create } from "zustand";
import { apiFetch } from "./api";

export interface CollectionCard {
  id: string;
  name: string;
  nameKo: string;
  number: number;
  collected: boolean;
  firstDrawnAt: string | null;
  drawCount: number;
}

export interface CollectionStats {
  total: number;
  collectedCount: number;
  completionRate: number;
  isComplete: boolean;
  cards: CollectionCard[];
}

interface CollectionState {
  stats: CollectionStats | null;
  loading: boolean;
  fetchCollection: (signal?: AbortSignal) => Promise<void>;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  stats: null,
  loading: false,

  fetchCollection: async (signal) => {
    set({ loading: true });
    try {
      const data = await apiFetch<CollectionStats>("/api/tarot/collection", {
        signal,
      });
      set({ stats: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
