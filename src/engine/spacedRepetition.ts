import type {
  QuestionState,
  InputMode,
  Bucket,
} from '../types/index.ts';
import {
  INPUT_MODE_THRESHOLDS,
  MAX_NEW_FACTS_PER_SESSION,
  FACTS_PER_TABLE,
} from '../types/index.ts';

export function createFact(a: number, b: number): QuestionState {
  return {
    a,
    b,
    answer: a * b,
    inputMode: 'qcm4',
    consecutiveCorrectInMode: 0,
    correctCount: 0,
    wrongCount: 0,
    lastSeen: 0,
    avgResponseTime: 0,
    easeFactor: 2.5,
    interval: 0,
    bucket: 'new',
  };
}

export function selectNextQuestion(
  facts: QuestionState[],
  sessionErrors: Array<{ a: number; b: number }>,
  newFactsIntroduced: number
): QuestionState | null {
  if (facts.length === 0) return null;

  // Priority 1: Session errors (re-ask facts the student got wrong this session)
  if (sessionErrors.length > 0) {
    for (const error of sessionErrors) {
      const fact = facts.find((f) => f.a === error.a && f.b === error.b);
      if (fact) return fact;
    }
  }

  // Priority 2: Learning facts (currently being studied)
  const learningFacts = facts.filter((f) => f.bucket === 'learning');
  if (learningFacts.length > 0) {
    // Pick the one with the oldest lastSeen (or lowest consecutiveCorrectInMode)
    const sorted = [...learningFacts].sort((a, b) => a.lastSeen - b.lastSeen);
    return sorted[0];
  }

  // Priority 3: New facts (max MAX_NEW_FACTS_PER_SESSION per session)
  if (newFactsIntroduced < MAX_NEW_FACTS_PER_SESSION) {
    const newFacts = facts.filter((f) => f.bucket === 'new');
    if (newFacts.length > 0) {
      return newFacts[0];
    }
  }

  // Priority 4: Review facts (due for review)
  const reviewFacts = facts.filter((f) => f.bucket === 'review');
  if (reviewFacts.length > 0) {
    const sorted = [...reviewFacts].sort((a, b) => a.lastSeen - b.lastSeen);
    return sorted[0];
  }

  // Fallback: pick any non-mastered fact, or if all mastered, pick the oldest mastered
  const nonMastered = facts.filter((f) => f.bucket !== 'mastered');
  if (nonMastered.length > 0) {
    const sorted = [...nonMastered].sort((a, b) => a.lastSeen - b.lastSeen);
    return sorted[0];
  }

  // All mastered: pick the oldest-seen mastered fact for reinforcement
  const sorted = [...facts].sort((a, b) => a.lastSeen - b.lastSeen);
  return sorted[0];
}

function getNextInputModeOnCorrect(
  inputMode: InputMode,
  consecutiveCorrectInMode: number
): { nextMode: InputMode; resetConsecutive: boolean } {
  switch (inputMode) {
    case 'qcm4':
      if (consecutiveCorrectInMode + 1 >= INPUT_MODE_THRESHOLDS.qcm4_to_qcm3) {
        return { nextMode: 'qcm3', resetConsecutive: true };
      }
      return { nextMode: 'qcm4', resetConsecutive: false };
    case 'qcm3':
      if (consecutiveCorrectInMode + 1 >= INPUT_MODE_THRESHOLDS.qcm3_to_qcm2) {
        return { nextMode: 'qcm2', resetConsecutive: true };
      }
      return { nextMode: 'qcm3', resetConsecutive: false };
    case 'qcm2':
      if (consecutiveCorrectInMode + 1 >= INPUT_MODE_THRESHOLDS.qcm2_to_keypad) {
        return { nextMode: 'keypad', resetConsecutive: true };
      }
      return { nextMode: 'qcm2', resetConsecutive: false };
    case 'keypad':
      return { nextMode: 'keypad', resetConsecutive: false };
  }
}

function getInputModeOnError(inputMode: InputMode): InputMode {
  switch (inputMode) {
    case 'keypad':
      return 'qcm3';
    case 'qcm2':
      return 'qcm4';
    case 'qcm3':
      return 'qcm4';
    case 'qcm4':
      return 'qcm4';
  }
}

function getNextBucket(
  currentBucket: Bucket,
  correct: boolean,
  inputMode: InputMode,
  consecutiveCorrectInMode: number,
  easeFactor: number,
  interval: number
): Bucket {
  if (!correct) {
    // Any error: back to learning (unless already new, which transitions to learning)
    if (currentBucket === 'new') return 'learning';
    return 'learning';
  }

  switch (currentBucket) {
    case 'new':
      // First answer moves to learning
      return 'learning';
    case 'learning':
      // learning -> review: keypad + 3 consecutive correct
      if (inputMode === 'keypad' && consecutiveCorrectInMode + 1 >= 3) {
        return 'review';
      }
      return 'learning';
    case 'review':
      // review -> mastered: easeFactor >= 2.5 + interval >= 5 + keypad
      if (easeFactor >= 2.5 && interval >= 5 && inputMode === 'keypad') {
        return 'mastered';
      }
      return 'review';
    case 'mastered':
      return 'mastered';
  }
}

export function updateFactAfterAnswer(
  fact: QuestionState,
  correct: boolean,
  timeMs: number
): QuestionState {
  const now = Date.now();

  // Update response time
  const totalResponses = fact.correctCount + fact.wrongCount;
  const newAvgTime =
    totalResponses === 0
      ? timeMs
      : (fact.avgResponseTime * totalResponses + timeMs) / (totalResponses + 1);

  if (correct) {
    // Input mode transitions on correct
    const { nextMode, resetConsecutive } = getNextInputModeOnCorrect(
      fact.inputMode,
      fact.consecutiveCorrectInMode
    );

    const newConsecutive = resetConsecutive ? 0 : fact.consecutiveCorrectInMode + 1;

    // Bucket transition
    const newBucket = getNextBucket(
      fact.bucket,
      true,
      fact.inputMode,
      fact.consecutiveCorrectInMode,
      fact.easeFactor,
      fact.interval
    );

    // SM-2 interval update
    let newInterval = fact.interval;
    let newEaseFactor = fact.easeFactor;
    if (newBucket === 'review' || newBucket === 'mastered') {
      if (fact.interval === 0) {
        newInterval = 1;
      } else if (fact.interval === 1) {
        newInterval = 3;
      } else {
        newInterval = Math.round(fact.interval * fact.easeFactor);
      }
      // Increase ease factor slightly on correct
      newEaseFactor = Math.min(3.0, fact.easeFactor + 0.1);
    }

    return {
      ...fact,
      inputMode: nextMode,
      consecutiveCorrectInMode: newConsecutive,
      correctCount: fact.correctCount + 1,
      wrongCount: fact.wrongCount,
      lastSeen: now,
      avgResponseTime: newAvgTime,
      easeFactor: newEaseFactor,
      interval: newInterval,
      bucket: newBucket,
    };
  } else {
    // Error case
    const newInputMode = getInputModeOnError(fact.inputMode);

    // Any error: back to learning, easeFactor -= 0.2 (min 1.3)
    const newEaseFactor = Math.max(1.3, fact.easeFactor - 0.2);
    const newBucket = fact.bucket === 'new' ? 'learning' : 'learning';

    return {
      ...fact,
      inputMode: newInputMode,
      consecutiveCorrectInMode: 0,
      correctCount: fact.correctCount,
      wrongCount: fact.wrongCount + 1,
      lastSeen: now,
      avgResponseTime: newAvgTime,
      easeFactor: newEaseFactor,
      interval: 0,
      bucket: newBucket,
    };
  }
}

export function isTableMastered(facts: QuestionState[]): boolean {
  if (facts.length < FACTS_PER_TABLE) return false;
  return facts.every((f) => f.bucket === 'mastered' && f.inputMode === 'keypad');
}

export function initializeTableFacts(table: number): QuestionState[] {
  const facts: QuestionState[] = [];
  for (let i = 1; i <= FACTS_PER_TABLE; i++) {
    facts.push(createFact(table, i));
  }
  return facts;
}
