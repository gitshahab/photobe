import { create } from "zustand";

type GenerationStatus =
  | "idle"
  | "uploading"
  | "loading"
  | "generating"
  | "success"
  | "error";

interface CompositorState {
  //Inputs
  imageFile: File | null;
  previewUrl: string | null;
  prompt: string;

  //Generation State
  status: GenerationStatus;
  outputUrl: string | null; //return image from comfy
  errorMessage: string | null;

  //Acions
  setImage: (file: File | null, url: string | null) => void;
  setPrompt: (prompt: string) => void;
  setStatus: (status: GenerationStatus) => void;
  setOutput: (url: string) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useStore = create<CompositorState>()((set) => ({
  //initial state
  imageFile: null,
  previewUrl: null,
  prompt: "",
  status: "idle",
  outputUrl: null,
  errorMessage: null,

  //mutators
  setImage: (file, url) => set({ imageFile: file, previewUrl: url }),
  setPrompt: (prompt) => set({ prompt }),
  setStatus: (status) => set({ status }),
  setOutput: (url) =>
    set({ outputUrl: url, status: "success", errorMessage: null }),
  setError: (error) => set({ errorMessage: error, status: "error" }),
  reset: () =>
    set({
      imageFile: null,
      previewUrl: null,
      prompt: "",
      status: "idle",
      outputUrl: null,
      errorMessage: null,
    }),
}));
