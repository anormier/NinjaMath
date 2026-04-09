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
  getActiveProfile: () => UserProfile;
  isGuest: () => boolean;
}

export type UserStore = UserState & UserActions;

export const DEFAULT_PROFILE_ID = 'default-player';

export const DEFAULT_PROFILE: UserProfile = {
  id: DEFAULT_PROFILE_ID,
  name: 'Joueur',
  avatar: '🚀',
  role: 'child',
  createdAt: 0,
};

/** Ensure the default profile always exists in the list */
function ensureDefaultProfile(profiles: UserProfile[]): UserProfile[] {
  const hasDefault = profiles.some((p) => p.id === DEFAULT_PROFILE_ID);
  if (hasDefault) return profiles;
  return [DEFAULT_PROFILE, ...profiles];
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // ---------- state ----------
      profiles: [DEFAULT_PROFILE],
      activeProfileId: DEFAULT_PROFILE.id,

      // ---------- actions ----------

      /** Add a profile (max 4, excluding default). Returns true on success. */
      addProfile: (profile: UserProfile): boolean => {
        const { profiles } = get();
        const namedProfiles = profiles.filter((p) => p.id !== DEFAULT_PROFILE_ID);
        if (namedProfiles.length >= MAX_PROFILES) return false;

        set({ profiles: [...profiles, profile] });
        return true;
      },

      /** Remove a profile by id. Cannot remove default. Falls back to default. */
      removeProfile: (profileId: string): void => {
        if (profileId === DEFAULT_PROFILE_ID) return; // protect default
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== profileId),
          activeProfileId:
            state.activeProfileId === profileId ? DEFAULT_PROFILE_ID : state.activeProfileId,
        }));
      },

      /** Set the active profile. Null falls back to default. */
      setActiveProfile: (profileId: string | null): void => {
        set({ activeProfileId: profileId ?? DEFAULT_PROFILE_ID });
      },

      /** Always returns a profile (falls back to default guest). */
      getActiveProfile: (): UserProfile => {
        const { profiles, activeProfileId } = get();
        const safeProfiles = ensureDefaultProfile(profiles);
        if (!activeProfileId) return DEFAULT_PROFILE;
        return safeProfiles.find((p) => p.id === activeProfileId) ?? DEFAULT_PROFILE;
      },

      /** True if the active profile is the default guest profile. */
      isGuest: (): boolean => {
        const { activeProfileId } = get();
        return !activeProfileId || activeProfileId === DEFAULT_PROFILE_ID;
      },
    }),
    {
      name: 'mathblitz-users',
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<UserState>) };
        // Always ensure the default profile exists after hydration
        state.profiles = ensureDefaultProfile(state.profiles);
        // If no active profile, fall back to default
        if (!state.activeProfileId) {
          state.activeProfileId = DEFAULT_PROFILE_ID;
        }
        return state;
      },
    },
  ),
);
