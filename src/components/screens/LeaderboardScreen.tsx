import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Screen } from '../../types';
import { TABLES_RANGE } from '../../types';
import { screenTransition, staggerContainer, staggerItem } from '../../hooks/useAnimation';
import { useUserStore } from '../../stores/userStore';
import { useStatsStore } from '../../stores/statsStore';
import { Button } from '../ui/Button';

interface LeaderboardScreenProps {
  onNavigate: (screen: Screen) => void;
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  if (minutes > 0) {
    return `${minutes}m ${seconds}.${String(centiseconds).padStart(2, '0')}s`;
  }
  return `${seconds}.${String(centiseconds).padStart(2, '0')}s`;
};

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onNavigate }) => {
  const profiles = useUserStore((s) => s.profiles);
  const profileStats = useStatsStore((s) => s.profileStats);
  const getBestChronoForTable = useStatsStore((s) => s.getBestChronoForTable);

  const [expandedTable, setExpandedTable] = useState<number | null>(null);

  const childProfile = useMemo(
    () => profiles.find((p) => p.role === 'child') ?? null,
    [profiles]
  );
  const parentProfile = useMemo(
    () => profiles.find((p) => p.role === 'parent') ?? null,
    [profiles]
  );

  // Calculate per-table leaderboard
  const tableLeaderboard = useMemo(() => {
    const tables: Array<{
      table: number;
      childBest: number | null;
      parentBest: number | null;
      leader: 'child' | 'parent' | 'tie' | null;
    }> = [];

    for (let t = TABLES_RANGE.min; t <= TABLES_RANGE.max; t++) {
      const childBest = childProfile
        ? getBestChronoForTable(childProfile.id, t)
        : null;
      const parentBest = parentProfile
        ? getBestChronoForTable(parentProfile.id, t)
        : null;

      let leader: 'child' | 'parent' | 'tie' | null = null;
      if (childBest !== null && parentBest !== null) {
        if (childBest < parentBest) leader = 'child';
        else if (parentBest < childBest) leader = 'parent';
        else leader = 'tie';
      } else if (childBest !== null) {
        leader = 'child';
      } else if (parentBest !== null) {
        leader = 'parent';
      }

      tables.push({ table: t, childBest, parentBest, leader });
    }

    return tables;
  }, [childProfile, parentProfile, getBestChronoForTable]);

  // Global scores
  const childWins = tableLeaderboard.filter((t) => t.leader === 'child').length;
  const parentWins = tableLeaderboard.filter((t) => t.leader === 'parent').length;
  const tablesWithScores = tableLeaderboard.filter(
    (t) => t.childBest !== null || t.parentBest !== null
  ).length;
  const remainingTables = TABLES_RANGE.max - TABLES_RANGE.min + 1 - tablesWithScores;

  // Session history for expanded table
  const getTableHistory = (table: number, profileId: string) => {
    const stats = profileStats[profileId];
    if (!stats) return [];
    return stats.sessionHistory
      .filter((h) => h.table === table && h.isChrono)
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
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
        <Button variant="ghost" size="sm" onClick={() => onNavigate('home')}>
          ← Retour
        </Button>
        <h1
          className="font-bungee text-3xl neon-text-cyan"
          style={{ textShadow: '0 0 15px #00F5FF' }}
        >
          Classement
        </h1>
      </div>

      {/* Global score */}
      {childProfile && parentProfile ? (
        <motion.div
          className="flex items-center justify-center gap-6 p-6 rounded-3xl
            backdrop-blur-md border border-white/20 bg-white/5"
          style={{ boxShadow: '0 0 30px rgba(0, 245, 255, 0.1)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Parent side */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl">{parentProfile.avatar}</span>
            <span className="font-quicksand text-white/70 text-sm">
              {parentProfile.name}
            </span>
            <span
              className="font-bungee text-3xl"
              style={{
                color: '#FF6B00',
                textShadow: '0 0 10px rgba(255, 107, 0, 0.5)',
              }}
            >
              {parentWins}
            </span>
          </div>

          {/* VS separator */}
          <div className="flex flex-col items-center">
            <span className="font-bungee text-xl text-white/40">VS</span>
          </div>

          {/* Child side */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl">{childProfile.avatar}</span>
            <span className="font-quicksand text-white/70 text-sm">
              {childProfile.name}
            </span>
            <span
              className="font-bungee text-3xl"
              style={{
                color: '#39FF14',
                textShadow: '0 0 10px rgba(57, 255, 20, 0.5)',
              }}
            >
              {childWins}
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="p-5 rounded-2xl backdrop-blur-md border border-white/15 bg-white/5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-quicksand text-white/60 mb-3">
            {!childProfile && !parentProfile
              ? 'Cree un profil enfant et un profil parent pour commencer le defi !'
              : !parentProfile
                ? 'Ajoute un profil parent pour debloquer le defi !'
                : 'Ajoute un profil enfant pour commencer !'}
          </p>
          <Button variant="cyan" size="md" onClick={() => onNavigate('profile')}>
            Gerer les profils
          </Button>
        </motion.div>
      )}

      {/* Motivation message */}
      {remainingTables > 0 && tablesWithScores > 0 && (
        <motion.p
          className="font-quicksand text-center text-white/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Plus que{' '}
          <span className="font-bold" style={{ color: '#FF00E5' }}>
            {remainingTables} table{remainingTables > 1 ? 's' : ''}
          </span>{' '}
          a jouer en chrono !
        </motion.p>
      )}

      {/* Column headers */}
      {childProfile && parentProfile && (
        <div className="flex items-center gap-3 px-4 text-xs font-quicksand text-white/40">
          <span className="w-10 text-center">Table</span>
          <span className="flex-1 text-center">{parentProfile.name}</span>
          <span className="w-8" />
          <span className="flex-1 text-center">{childProfile.name}</span>
          <span className="w-3" />
        </div>
      )}

      {/* Per-table breakdown */}
      <motion.div
        className="flex flex-col gap-2 flex-1 overflow-y-auto pb-20"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {tableLeaderboard.map(({ table, childBest, parentBest, leader }) => {
          const hasData = childBest !== null || parentBest !== null;
          const isExpanded = expandedTable === table;

          return (
            <motion.div key={table} variants={staggerItem}>
              <motion.button
                onClick={() =>
                  hasData && setExpandedTable(isExpanded ? null : table)
                }
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  backdrop-blur-md border select-none transition-colors
                  ${hasData ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                style={{
                  borderColor: hasData
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  backgroundColor: isExpanded
                    ? 'rgba(0, 245, 255, 0.08)'
                    : 'rgba(255,255,255,0.03)',
                }}
                whileHover={
                  hasData
                    ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                    : undefined
                }
                whileTap={hasData ? { scale: 0.98 } : undefined}
              >
                {/* Table number */}
                <span
                  className="font-fredoka text-xl font-bold w-10 text-center"
                  style={{
                    color: hasData ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                    textShadow: hasData
                      ? '0 0 8px rgba(0, 245, 255, 0.4)'
                      : 'none',
                  }}
                >
                  {table}
                </span>

                {/* Parent's time */}
                <div className="flex-1 text-center">
                  <span
                    className="font-fredoka text-sm"
                    style={{
                      color:
                        leader === 'parent'
                          ? '#FF6B00'
                          : 'rgba(255,255,255,0.4)',
                      textShadow:
                        leader === 'parent'
                          ? '0 0 6px rgba(255, 107, 0, 0.4)'
                          : 'none',
                    }}
                  >
                    {parentBest !== null ? formatTime(parentBest) : '--:--'}
                  </span>
                </div>

                {/* Trophy */}
                <span className="text-xl w-8 text-center">
                  {leader === 'child'
                    ? '🏆'
                    : leader === 'parent'
                      ? '🏆'
                      : leader === 'tie'
                        ? '🤝'
                        : hasData
                          ? '⚔️'
                          : ''}
                </span>

                {/* Child's time */}
                <div className="flex-1 text-center">
                  <span
                    className="font-fredoka text-sm"
                    style={{
                      color:
                        leader === 'child'
                          ? '#39FF14'
                          : 'rgba(255,255,255,0.4)',
                      textShadow:
                        leader === 'child'
                          ? '0 0 6px rgba(57, 255, 20, 0.4)'
                          : 'none',
                    }}
                  >
                    {childBest !== null ? formatTime(childBest) : '--:--'}
                  </span>
                </div>

                {/* Leader color indicator */}
                {leader && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        leader === 'child'
                          ? '#39FF14'
                          : leader === 'parent'
                            ? '#FF6B00'
                            : '#FFD700',
                      boxShadow: `0 0 6px ${
                        leader === 'child'
                          ? '#39FF14'
                          : leader === 'parent'
                            ? '#FF6B00'
                            : '#FFD700'
                      }`,
                    }}
                  />
                )}
              </motion.button>

              {/* Expanded history */}
              <AnimatePresence>
                {isExpanded && hasData && (
                  <motion.div
                    className="mt-1 ml-4 flex flex-col gap-1 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Child history */}
                    {childProfile && (
                      <div className="flex flex-col gap-1">
                        <span className="font-quicksand text-xs text-white/40 mt-2">
                          {childProfile.name}
                        </span>
                        {getTableHistory(table, childProfile.id).length > 0 ? (
                          getTableHistory(table, childProfile.id).map(
                            (entry, i) => (
                              <div
                                key={`child-${i}`}
                                className="flex items-center gap-3 px-3 py-1 rounded-lg bg-white/5 text-xs"
                              >
                                <span className="font-quicksand text-white/50">
                                  {new Date(entry.date).toLocaleDateString(
                                    'fr-FR'
                                  )}
                                </span>
                                <span className="font-fredoka text-white/70">
                                  {formatTime(entry.time)}
                                </span>
                                <span className="font-fredoka text-white/70">
                                  {entry.correctCount}/{entry.totalCount}
                                </span>
                                <span
                                  className="font-fredoka font-bold"
                                  style={{ color: '#39FF14' }}
                                >
                                  {entry.score}pts
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <span className="font-quicksand text-white/30 text-xs px-3">
                            Pas encore de session chrono
                          </span>
                        )}
                      </div>
                    )}

                    {/* Parent history */}
                    {parentProfile && (
                      <div className="flex flex-col gap-1">
                        <span className="font-quicksand text-xs text-white/40 mt-2">
                          {parentProfile.name}
                        </span>
                        {getTableHistory(table, parentProfile.id).length > 0 ? (
                          getTableHistory(table, parentProfile.id).map(
                            (entry, i) => (
                              <div
                                key={`parent-${i}`}
                                className="flex items-center gap-3 px-3 py-1 rounded-lg bg-white/5 text-xs"
                              >
                                <span className="font-quicksand text-white/50">
                                  {new Date(entry.date).toLocaleDateString(
                                    'fr-FR'
                                  )}
                                </span>
                                <span className="font-fredoka text-white/70">
                                  {formatTime(entry.time)}
                                </span>
                                <span className="font-fredoka text-white/70">
                                  {entry.correctCount}/{entry.totalCount}
                                </span>
                                <span
                                  className="font-fredoka font-bold"
                                  style={{ color: '#FF6B00' }}
                                >
                                  {entry.score}pts
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <span className="font-quicksand text-white/30 text-xs px-3">
                            Pas encore de session chrono
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
