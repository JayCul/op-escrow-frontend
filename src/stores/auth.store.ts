// stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  initializeAuth: () => void;
}

// Helper to sync with sessionStorage for backward compatibility
const syncWithsessionStorage = {
  get: (): User | null => {
    try {
      const stored = sessionStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
  set: (user: User | null) => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  },
  remove: () => {
    sessionStorage.removeItem("user");
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isAdmin: false,

      setUser: (user) => {
        // Sync with sessionStorage for backward compatibility
        syncWithsessionStorage.set(user);

        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          isAdmin:
            user?.walletAddress?.toLowerCase() ===
            "0x2d7812b2000f995c01417e576dc123587e4b39e4"
              ? true
              : false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      login: (user: User) => {
        syncWithsessionStorage.set(user);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isAdmin:
            user?.walletAddress?.toLowerCase() ===
            "0x2d7812b2000f995c01417e576dc123587e4b39e4"
              ? true
              : false,
        });
      },

      logout: () => {
        syncWithsessionStorage.remove();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isAdmin: false,
        });
      },

      // Initialize auth state (useful for app startup)
      initializeAuth: () => {
        const { user } = get();

        // If we don't have a user in state, check sessionStorage for backward compatibility
        if (!user) {
          const storedUser = syncWithsessionStorage.get();
          if (storedUser) {
            set({
              user: storedUser,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: "auth-storage", // name for the persisted storage
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Only rehydrate on mount, we'll handle initialization manually
      skipHydration: true,
    }
  )
);

// Initialize auth on store creation
useAuthStore.getState().initializeAuth();

// Export hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useIsAdmin = () => useAuthStore((state) => state.isAdmin);
