import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Screen } from '../../types';
import { TABLES_RANGE } from '../../types';
import { screenTransition, staggerContainer, staggerItem } from '../../hooks/useAnimation';
import { useStatsStore } from '../../stores/statsStore';
import { useUserStore } from '../../stores/userStore';
import {
  getUnlockedTables,
  isTableReadyForChrono,
  getTableMasteryPercent,
} from '../../engine/difficultyManager';
import { Button } from '../ui/Button';
import { StarRating } from '../ui/StarRating';

interface TableSelectScreenProps {
  onNavigate: (screen: Screen) => void;
  onSelectTable: (table: number, isChrono: boolean) => void;
}

export const TableSelectScreen: React.FC<TableSelectScreenProps> = ({
  onNavigate,
  onSelectTable,
}) => {
  const activeProfile = useUserStore((s) => s.getActiveProfile());
  const profileId = activeProfile?.id ?? '';
  const getAllTableStats = useStatsStore((s) => s.getAllTableStats);
  const allStats = getAllTableStats(profileId);

  // Find opponent profile (parent if active is child, child if active is parent)
  const profiles = useUserStore((s) => s.profiles);
  const getBestChronoForTable = useStatsStore((s) => s.getBestChronoForTable);

  const opponent = useMemo(() => {
    if (!activeProfile) return null;
    const oppositeRole = activeProfile.role === 'child' ? 'parent' : 'child';
    return profiles.find((p) => p.role === oppositeRole) ?? null;
  }, [activeProfile, profiles]);

  const unlockedTables = useMemo(() => getUnlockedTables(allStats), [allStats]);

  const [chronoPromptTable, setChronoPromptTable] = useState<number | null>(null);

  const tables = useMemo(() => {
    const result: Array<{
      table: number;
      unlocked: boolean;
      mastery: number;
      chronoReady: boolean;
      isLeader: boolean;
    }> = [];

    for (let t = TABLES_RANGE.min; t <= TABLES_RANGE.max; t++) {
      const stats = allStats[t];
      const unlocked = unlockedTables.includes(t);
      const facts = stats?.facts ?? [];
      const mastery = facts.length > 0 ? getTableMasteryPercent(facts) : 0;
      const chronoReady = facts.length > 0 && isTableReadyForChrono(facts);

      // Determine leader
      let isLeader = false;
      if (opponent && stats?.bestChronoTime != null) {
        const opponentBest = getBestChronoForTable(opponent.id, t);
        if (opponentBest === null || stats.bestChronoTime < opponentBest) {
          isLeader = true;
        }
      }

      result.push({ table: t, unlocked, mastery, chronoReady, isLeader });
    }

    return result;
  }, [allStats, unlockedTables, opponent, getBestChronoForTable]);

  const handleTableClick = (table: number, chronoReady: boolean) => {
    if (chronoReady) {
      setChronoPromptTable(table);
    } else {
      onSelectTable(table, false);
    }
  };

  const getBadge = (mastery: number, chronoReady: boolean): { text: string; color: string } => {
    if (chronoReady) return { text: '⏱️ CHRONO PRET', color: '#FF6B00' };
    if (mastery >= 80) return { text: '🟢 Expert', color: '#39FF14' };
    return { text: '🔵 Apprentissage', color: '#00F5FF' };
  };

  return (
    <motion.div
      className="flex flex-col min-h-full px-4 py-6 gap-6"
      variants={screenTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('mode_select')}>
          ← Retour
        </Button>
        <h1
          className="font-bungee text-2xl sm:text-3xl neon-text-cyan"
          style={{ textShadow: '0 0 15px #00F5FF' }}
        >
          Choisis ta table !
        </h1>
      </div>

      {/* Table grid */}
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-4 gap-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {tables.map(({ table, unlocked, mastery, chronoReady, isLeader }) => {
          const badge = getBadge(mastery, chronoReady);
          const starRating = (mastery / 100) * 5;

          return (
            <motion.button
              key={table}
              variants={staggerItem}
              onClick={() => unlocked && handleTableClick(table, chronoReady)}
              disabled={!unlocked}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl
                backdrop-blur-md border-2 select-none transition-colors
                ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
              style={{
                borderColor: unlocked
                  ? chronoReady
                    ? '#FF6B00'
                    : '#00F5FF'
                  : 'rgba(255,255,255,0.1)',
                backgroundColor: unlocked
                  ? chronoReady
                    ? 'rgba(255, 107, 0, 0.08)'
                    : 'rgba(0, 245, 255, 0.08)'
                  : 'rgba(255,255,255,0.02)',
                boxShadow: unlocked
                  ? chronoReady
                    ? '0 0 15px rgba(255, 107, 0, 0.2)'
                    : '0 0 15px rgba(0, 245, 255, 0.15)'
                  : 'none',
              }}
              whileHover={unlocked ? { scale: 1.05 } : undefined}
              whileTap={unlocked ? { scale: 0.95 } : undefined}
            >
              {/* Lock icon for locked tables */}
              {!unlocked && (
                <span className="absolute top-2 right-2 text-lg">🔒</span>
              )}

              {/* Trophy for leader */}
              {isLeader && unlocked && (
                <span className="absolute top-1 right-1 text-lg">🏆</span>
              )}

              {/* Table number */}
              <span
                className="font-fredoka text-3xl font-bold"
                style={{
                  color: unlocked ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                  textShadow: unlocked ? '0 0 10px rgba(0, 245, 255, 0.5)' : 'none',
                }}
              >
                {table}
              </span>

              {/* Star rating */}
              {unlocked && <StarRating rating={starRating} size="sm" />}

              {/* Badge */}
              {unlocked && mastery > 0 && (
                <span
                  className="text-[10px] font-fredoka font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
                  style={{
                    borderColor: badge.color,
                    color: badge.color,
                    backgroundColor: `${badge.color}15`,
                  }}
                >
                  {badge.text}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Chrono prompt modal */}
      <AnimatePresence>
        {chronoPromptTable !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setChronoPromptTable(null)}
            />

            {/* Modal content */}
            <motion.div
              className="relative z-10 flex flex-col items-center gap-5 p-6 rounded-3xl
                backdrop-blur-md border border-white/20 bg-gray-900/90 max-w-sm w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <h2 className="font-bungee text-xl text-white text-center">
                Table de {chronoPromptTable}
              </h2>
              <p className="font-quicksand text-white/70 text-center text-sm">
                Cette table est prête pour le chrono ! Que veux-tu faire ?
              </p>
              <div className="flex flex-col gap-3 w-full">
                <Button
                  variant="orange"
                  size="lg"
                  onClick={() => {
                    onSelectTable(chronoPromptTable, true);
                    setChronoPromptTable(null);
                  }}
                  className="w-full"
                >
                  ⏱️ Mode Chrono
                </Button>
                <Button
                  variant="cyan"
                  size="lg"
                  onClick={() => {
                    onSelectTable(chronoPromptTable, false);
                    setChronoPromptTable(null);
                  }}
                  className="w-full"
                >
                  📝 Entraînement
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setChronoPromptTable(null)}
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
