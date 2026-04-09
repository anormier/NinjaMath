import type {
  QuestionState,
} from '../types/index.ts';
import {
  TABLES_RANGE,
  MASTERY_PERCENT,
  FACTS_PER_TABLE,
} from '../types/index.ts';
import { isTableMastered } from './spacedRepetition.ts';

export function getFactMasteryPercent(fact: QuestionState): number {
  if (fact.bucket === 'mastered') {
    return MASTERY_PERCENT['mastered'];
  }

  // keypad but not mastered means still in learning or review
  if (fact.inputMode === 'keypad') {
    return MASTERY_PERCENT['keypad-learning'];
  }

  // For QCM modes, use the inputMode directly
  return MASTERY_PERCENT[fact.inputMode] ?? 0;
}

export function getTableMasteryPercent(facts: QuestionState[]): number {
  if (facts.length === 0) return 0;
  const total = facts.reduce((sum, fact) => sum + getFactMasteryPercent(fact), 0);
  return total / facts.length;
}

export function shouldUnlockNextTable(facts: QuestionState[]): boolean {
  if (facts.length < FACTS_PER_TABLE) return false;
  return facts.every((f) => f.bucket === 'mastered');
}

export function getUnlockedTables(
  allStats: Record<number, { facts: QuestionState[] }>
): number[] {
  const unlocked: number[] = [TABLES_RANGE.min]; // Table 2 always unlocked

  for (let table = TABLES_RANGE.min; table < TABLES_RANGE.max; table++) {
    const stats = allStats[table];
    if (stats && isTableMastered(stats.facts)) {
      const nextTable = table + 1;
      if (nextTable <= TABLES_RANGE.max && !unlocked.includes(nextTable)) {
        unlocked.push(nextTable);
      }
    }
  }

  return unlocked.sort((a, b) => a - b);
}

export function isTableReadyForChrono(facts: QuestionState[]): boolean {
  if (facts.length < FACTS_PER_TABLE) return false;
  return facts.every((f) => f.inputMode === 'keypad');
}
