import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  apiKey: string;
  geminiApiKey: string; // Add Gemini API Key as well since user provided it
  originalResume: string;
  jobDescription: string;
  selectedModel: string;
  generatedVersions: {
    id: string;
    tailoredResume: string;
    explanation: string;
    diff: string; // The diff content itself
    createdAt: number;
  }[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  setOriginalResume: (resume: string) => void;
  setJobDescription: (description: string) => void;
  setSelectedModel: (model: string) => void;
  addGeneratedVersion: (version: AppState['generatedVersions'][0]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearState: () => void;
}

const initialState = {
  apiKey: '',
  geminiApiKey: '', // Pre-fill with the provided key
  originalResume: '',
  jobDescription: '',
  selectedModel: 'gpt-4o-mini', // Default model
  generatedVersions: [],
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setApiKey: (key) => set({ apiKey: key }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setOriginalResume: (resume) => set({ originalResume: resume }),
      setJobDescription: (description) => set({ jobDescription: description }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      addGeneratedVersion: (version) =>
        set((state) => ({
          generatedVersions: [...state.generatedVersions, version],
        })),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error: error }),
      clearState: () => set({ ...initialState }),
    }),
    {
      name: 'ai-resume-tailor-storage', // name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);
