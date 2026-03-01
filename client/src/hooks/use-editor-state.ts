import { create } from "zustand";

interface EditorState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  zoom: number;
  selectedItemId: number | null;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  setSelectedItemId: (id: number | null) => void;
  togglePlay: () => void;
}

export const useEditorState = create<EditorState>((set) => ({
  currentTime: 0,
  duration: 30, // Default 30s timeline
  isPlaying: false,
  zoom: 1,
  selectedItemId: null,
  setCurrentTime: (t) => set({ currentTime: Math.max(0, t) }),
  setDuration: (d) => set({ duration: d }),
  setIsPlaying: (p) => set({ isPlaying: p }),
  setZoom: (z) => set({ zoom: Math.max(0.5, Math.min(z, 5)) }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  togglePlay: () => set((state) => ({ 
    isPlaying: !state.isPlaying,
    currentTime: state.currentTime >= state.duration && !state.isPlaying ? 0 : state.currentTime
  })),
}));
