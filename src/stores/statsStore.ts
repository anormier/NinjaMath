// ==================== STATS & PROGRESSION STORE ====================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ProfileStats,
  QuestionState,
  SessionResult,
  TableStats,
} from '../types';
import { initializeTableFacts } from '../engine/spacedRepetition';

interface StatsState {
  profileStats: Record<string, ProfileStats>;
}

interface StatsActions {
  getOrCreateTableStats: (profileId: string, table: number) => TableStats;
  updateFact: (profileId: string, table: number, updatedFact: QuestionState) => void;
  recordSession: (profileId: string, result: SessionResult) => void;
  getTableStats: (profileId: string, table: number) => TableStats | null;
  getAllTableStats: (profileId: string) => Record<number, TableStats>;
  getBestChronoForTable: (profileId: string, table: number) => number | null;
}

export type StatsStore = StatsState & StatsActions;

/** Create a fresh ProfileStats shell for a given profileId. */
const createEmptyProfileStats = (profileId: string): ProfileStats => ({
  profileId,
  tables: {},
  totalScore: 0,
  totalSessions: 0,
  sessionHistory: [],
});

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      // ---------- state ----------
      profileStats: {},

      // ---------- actions ----------

      getOrCreateTableStats: (profileId: string, table: number): TableStats => {
        const state = get();
        let profile = state.profileStats[profileId];

        if (!profile) {
          profile = createEmptyProfileStats(profileId);
        }

        const existing = profile.tables[table];
        if (existing) return existing;

        // Initialise facts for this table via the spaced-repetition engine
        const facts = initializeTableFacts(table);
        const newTableStats: TableStats = {
          table,
          facts,
          bestChronoTime: null,
          bestChronoScore: null,
          sessionsPlayed: 0,
        };

        set((s) => ({
          profileStats: {
            ...s.profileStats,
            [profileId]: {
              ...(s.profileStats[profileId] ?? createEmptyProfileStats(profileId)),
              tables: {
                ...(s.profileStats[profileId]?.tables ?? {}),
                [table]: newTableStats,
              },
            },
          },
        }));

        return newTableStats;
      },

      updateFact: (
        profileId: string,
        table: number,
        updatedFact: QuestionState,
      ): void => {
        set((s) => {
          const profile = s.profileStats[profileId];
          if (!profile) return s;

          const tableStats = profile.tables[table];
          if (!tableStats) return s;

          const updatedFacts = tableStats.facts.map((f) =>
            f.a === updatedFact.a && f.b === updatedFact.b ? updatedFact : f,
          );

          return {
            profileStats: {
              ...s.profileStats,
              [profileId]: {
                ...profile,
                tables: {
                  ...profile.tables,
                  [table]: {
                    ...tableStats,
                    facts: updatedFacts,
                  },
                },
              },
            },
          };
        });
      },

      recordSession: (profileId: string, result: SessionResult): void => {
        set((s) => {
          const profile =
            s.profileStats[profileId] ?? createEmptyProfileStats(profileId);

          // Update chrono best if applicable
          let tables = { ...profile.tables };
          if (result.isChrono && result.table !== null) {
            const tableStats = tables[result.table];
            if (tableStats) {
              const isBetterTime =
                tableStats.bestChronoTime === null ||
                result.totalTime < tableStats.bestChronoTime;
              const isBetterScore =
                tableStats.bestChronoScore === null ||
                result.totalScore > tableStats.bestChronoScore;

              tables = {
                ...tables,
                [result.table]: {
                  ...tableStats,
                  sessionsPlayed: tableStats.sessionsPlayed + 1,
                  bestChronoTime: isBetterTime
                    ? result.totalTime
                    : tableStats.bestChronoTime,
                  bestChronoScore: isBetterScore
                    ? result.totalScore
                    : tableStats.bestChronoScore,
                },
              };
            }
          } else if (result.table !== null) {
            const tableStats = tables[result.table];
            if (tableStats) {
              tables = {
                ...tables,
                [result.table]: {
                  ...tableStats,
                  sessionsPlayed: tableStats.sessionsPlayed + 1,
                },
              };
            }
          }

          // Add to session history
          const entry = {
            date: Date.now(),
            mode: result.mode,
            table: result.table,
            score: result.totalScore,
            time: result.totalTime,
            correctCount: result.correctCount,
            totalCount: result.answers.length,
            isChrono: result.isChrono,
          };

          return {
            profileStats: {
              ...s.profileStats,
              [profileId]: {
                ...profile,
                tables,
                totalScore: profile.totalScore + result.totalScore,
                totalSessions: profile.totalSessions + 1,
                sessionHistory: [...profile.sessionHistory, entry],
              },
            },
          };
        });
      },

      getTableStats: (profileId: string, table: number): TableStats | null => {
        const profile = get().profileStats[profileId];
        if (!profile) return null;
        return profile.tables[table] ?? null;
      },

      getAllTableStats: (profileId: string): Record<number, TableStats> => {
        const profile = get().profileStats[profileId];
        if (!profile) return {};
        return profile.tables;
      },

      getBestChronoForTable: (
        profileId: string,
        table: number,
      ): number | null => {
        const profile = get().profileStats[profileId];
        if (!profile) return null;
        const tableStats = profile.tables[table];
        if (!tableStats) return null;
        return tableStats.bestChronoTime;
      },
    }),
    {
      name: 'mathblitz-stats',
    },
  ),
);
