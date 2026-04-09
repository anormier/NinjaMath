// ==================== USER PROFILE STORE ====================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types';

const MAX_PROFILES = 4;

interface UserState {
  profiles: UserProfile[];
  activeProfileId: string | null;
}

interface UserActions {
  addProfile: (profile: UserProfile) => boolean;
  removeProfile: (profileId: string) => void;
  setActiveProfile: (profileId: string | null) => void;
  getActiveProfile: () => UserProfile | null;
}

export type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // ---------- state ----------
      profiles: [],
      activeProfileId: null,

      // ---------- actions ----------

      /** Add a profile (max 4). Returns true on success, false if limit reached. */
      addProfile: (profile: UserProfile): boolean => {
        const { profiles } = get();
        if (profiles.length >= MAX_PROFILES) return false;

        set({ profiles: [...profiles, profile] });
        return true;
      },

      /** Remove a profile by id. Clears activeProfileId if it matches. */
      removeProfile: (profileId: string): void => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== profileId),
          activeProfileId:
            state.activeProfileId === profileId ? null : state.activeProfileId,
        }));
      },

      /** Set the active profile (or null to deselect). */
      setActiveProfile: (profileId: string | null): void => {
        set({ activeProfileId: profileId });
      },

      /** Return the currently active UserProfile, or null. */
      getActiveProfile: (): UserProfile | null => {
        const { profiles, activeProfileId } = get();
        if (!activeProfileId) return null;
        return profiles.find((p) => p.id === activeProfileId) ?? null;
      },
    }),
    {
      name: 'mathblitz-users',
    },
  ),
);
