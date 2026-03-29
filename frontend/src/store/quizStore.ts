import { create } from 'zustand';

import api from '../services/api';
import { QuizAnswers, ScoreResult, User } from '../types';

interface QuizStore {
  user: User | null;
  isAuthenticated: boolean;
  quizAnswers: QuizAnswers;
  currentStep: number;
  isLoading: boolean;
  scoreResult: ScoreResult | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setAnswer: (key: string, value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetQuiz: () => void;
  setLoading: (isLoading: boolean) => void;
  setScoreResult: (scoreResult: ScoreResult | null) => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  user: null,
  isAuthenticated: false,
  quizAnswers: {},
  currentStep: 0,
  isLoading: false,
  scoreResult: null,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user)
    }),
  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      scoreResult: null
    }),
  setAnswer: (key, value) =>
    set((state) => ({
      quizAnswers: {
        ...state.quizAnswers,
        [key]: value
      }
    })),
  nextStep: () =>
    set((state) => ({
      currentStep: state.currentStep + 1
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0)
    })),
  resetQuiz: () =>
    set({
      quizAnswers: {},
      currentStep: 0,
      scoreResult: null
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setScoreResult: (scoreResult) => set({ scoreResult })
}));

export const rehydrateAuth = async (): Promise<void> => {
  const { setUser, clearUser, setLoading } = useQuizStore.getState();

  setLoading(true);

  try {
    const response = await api.get<{ user: User }>('/auth/me', {
      headers: {
        'X-Skip-Auth-Redirect': 'true'
      }
    });

    setUser(response.data.user);
  } catch (error) {
    clearUser();
  } finally {
    setLoading(false);
  }
};
