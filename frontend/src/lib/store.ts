import { create } from 'zustand';

interface User {
  id: string;
  walletAddress: string;
  role: string;
  reputationScore: number;
  completedTasks: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()((set) => {
  // Check localStorage on client side only
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('trustwork_token');
    const storedUser = localStorage.getItem('trustwork_user');
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return {
          user,
          token: storedToken,
          isAuthenticated: true,
          isHydrated: true,
          setAuth: (user, token) => {
            localStorage.setItem('trustwork_token', token);
            localStorage.setItem('trustwork_user', JSON.stringify(user));
            set({ user, token, isAuthenticated: true });
          },
          logout: () => {
            localStorage.removeItem('trustwork_token');
            localStorage.removeItem('trustwork_user');
            set({ user: null, token: null, isAuthenticated: false });
          },
          setHydrated: () => set({ isHydrated: true }),
        };
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isHydrated: typeof window === 'undefined',
    setAuth: (user, token) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('trustwork_token', token);
        localStorage.setItem('trustwork_user', JSON.stringify(user));
      }
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('trustwork_token');
        localStorage.removeItem('trustwork_user');
      }
      set({ user: null, token: null, isAuthenticated: false });
    },
    setHydrated: () => set({ isHydrated: true }),
  };
});
