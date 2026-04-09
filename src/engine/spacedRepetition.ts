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
  newFactsIntroduced: number,
  lastAsked?: { a: number; b: number } | null
): QuestionState | null {
  if (facts.length === 0) return null;

  const notLastAsked = (f: QuestionState) =>
    !lastAsked || f.a !== lastAsked.a || f.b !== lastAsked.b;

  // Priority 1: Session errors — re-ask wrong answers (not the one just asked)
  if (sessionErrors.length > 0) {
    const errorFact = sessionErrors
      .map((e) => facts.find((f) => f.a === e.a && f.b === e.b))
      .filter((f): f is QuestionState => f !== undefined)
      .find(notLastAsked);
    if (errorFact) return errorFact;
    const anyError = sessionErrors
      .map((e) => facts.find((f) => f.a === e.a && f.b === e.b))
      .find((f): f is QuestionState => f !== undefined);
    if (anyError) return anyError;
  }

  // Priority 2: Always introduce a NEW (never-seen) fact first.
  // This ensures every fact is seen once before any repeats.
  const newFacts = facts.filter((f) => f.bucket === 'new');
  if (newFacts.length > 0) {
    return newFacts[0];
  }

  // Priority 3: All facts have been seen at least once.
  // Pick the LEAST recently seen fact (round-robin), skipping lastAsked.
  const candidates = facts.filter((f) => f.bucket !== 'mastered' && notLastAsked(f));
  if (candidates.length > 0) {
    return [...candidates].sort((a, b) => a.lastSeen - b.lastSeen)[0];
  }

  // Priority 4: Review / mastered — least recently seen
  const allNonLast = facts.filter(notLastAsked);
  if (allNonLast.length > 0) {
    return [...allNonLast].sort((a, b) => a.lastSeen - b.lastSeen)[0];
  }

  return facts[0];
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
