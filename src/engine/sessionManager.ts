import type {
  GameMode,
  GameSession,
  QuestionState,
  QuestionDisplay,
  AnswerResult,
  SessionResult,
  InputMode,
} from '../types/index.ts';
import { CHRONO_QUESTIONS } from '../types/index.ts';
import { selectNextQuestion, updateFactAfterAnswer } from './spacedRepetition.ts';
import { generateQuestion } from './questionGenerator.ts';
import { calculateScore } from './scoringEngine.ts';

function generateId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createSession(
  mode: GameMode,
  table: number | null,
  profileId: string,
  isChrono: boolean
): GameSession {
  return {
    id: generateId(),
    mode,
    table,
    profileId,
    isChrono,
    startTime: Date.now(),
    answers: [],
    currentCombo: 0,
    maxCombo: 0,
    totalScore: 0,
    questionsAsked: 0,
    sessionErrors: [],
    newFactsIntroduced: 0,
    factsProgressed: [],
    lastStyle: null,
  };
}

export function getNextQuestion(
  session: GameSession,
  facts: QuestionState[]
): QuestionDisplay | null {
  if (isSessionComplete(session, session.isChrono)) {
    return null;
  }

  // Determine the last asked fact to avoid immediate repeats
  const lastAnswer = session.answers.length > 0
    ? session.answers[session.answers.length - 1]
    : null;
  const lastAsked = lastAnswer ? { a: lastAnswer.a, b: lastAnswer.b } : null;

  if (session.isChrono) {
    // Chrono mode: 10 questions, then re-ask errors
    if (session.questionsAsked < CHRONO_QUESTIONS) {
      const fact = selectNextQuestion(facts, [], session.newFactsIntroduced, lastAsked);
      if (!fact) return null;
      return generateQuestion(fact, session.lastStyle);
    }

    // After 10 questions, re-ask errors
    if (session.sessionErrors.length > 0) {
      const errorRef = session.sessionErrors[0];
      const fact = facts.find((f) => f.a === errorRef.a && f.b === errorRef.b);
      if (fact) {
        return generateQuestion(fact, session.lastStyle);
      }
    }

    return null;
  }

  // Normal mode: use spaced repetition selection
  const fact = selectNextQuestion(
    facts,
    session.sessionErrors,
    session.newFactsIntroduced,
    lastAsked
  );
  if (!fact) return null;

  return generateQuestion(fact, session.lastStyle);
}

export function processAnswer(
  session: GameSession,
  facts: QuestionState[],
  userAnswer: number,
  timeMs: number,
  currentQuestion: QuestionDisplay
): {
  session: GameSession;
  updatedFact: QuestionState;
  answerResult: AnswerResult;
} {
  const correct = userAnswer === currentQuestion.answer;
  const fact = facts.find(
    (f) => f.a === currentQuestion.a && f.b === currentQuestion.b
  );

  if (!fact) {
    throw new Error(
      `Fact not found for question: ${currentQuestion.a} x ${currentQuestion.b}`
    );
  }

  // Track input mode before update for progression tracking
  const previousInputMode: InputMode = fact.inputMode;
  const previousBucket = fact.bucket;

  // Calculate score
  const newCombo = correct ? session.currentCombo + 1 : 0;
  const scoreEvent = calculateScore(
    correct,
    currentQuestion.inputMode,
    timeMs,
    newCombo
  );

  // Update fact via spaced repetition
  const updatedFact = updateFactAfterAnswer(fact, correct, timeMs);

  // Build answer result
  const answerResult: AnswerResult = {
    a: currentQuestion.a,
    b: currentQuestion.b,
    answer: currentQuestion.answer,
    userAnswer,
    correct,
    timeMs,
    inputMode: currentQuestion.inputMode,
    style: currentQuestion.style,
    scoreEvent,
  };

  // Update session errors
  let newSessionErrors = [...session.sessionErrors];
  if (!correct) {
    // Add to errors if not already present
    const alreadyInErrors = newSessionErrors.some(
      (e) => e.a === currentQuestion.a && e.b === currentQuestion.b
    );
    if (!alreadyInErrors) {
      newSessionErrors.push({ a: currentQuestion.a, b: currentQuestion.b });
    }
  } else {
    // Remove from errors on correct answer
    newSessionErrors = newSessionErrors.filter(
      (e) => !(e.a === currentQuestion.a && e.b === currentQuestion.b)
    );
  }

  // Track new facts introduced
  let newFactsIntroduced = session.newFactsIntroduced;
  if (previousBucket === 'new') {
    newFactsIntroduced += 1;
  }

  // Track input mode progression
  const newFactsProgressed = [...session.factsProgressed];
  if (updatedFact.inputMode !== previousInputMode) {
    newFactsProgressed.push({
      a: currentQuestion.a,
      b: currentQuestion.b,
      from: previousInputMode,
      to: updatedFact.inputMode,
    });
  }

  // Update session
  const newMaxCombo = Math.max(session.maxCombo, newCombo);
  const newTotalScore = Math.max(0, session.totalScore + scoreEvent.totalPoints);

  const updatedSession: GameSession = {
    ...session,
    answers: [...session.answers, answerResult],
    currentCombo: newCombo,
    maxCombo: newMaxCombo,
    totalScore: newTotalScore,
    questionsAsked: session.questionsAsked + 1,
    sessionErrors: newSessionErrors,
    newFactsIntroduced: newFactsIntroduced,
    factsProgressed: newFactsProgressed,
    lastStyle: currentQuestion.style,
  };

  return {
    session: updatedSession,
    updatedFact,
    answerResult,
  };
}

export function endSession(session: GameSession): SessionResult {
  const totalTime = Date.now() - session.startTime;
  const correctCount = session.answers.filter((a) => a.correct).length;
  const wrongCount = session.answers.filter((a) => !a.correct).length;

  return {
    mode: session.mode,
    table: session.table,
    profileId: session.profileId,
    totalTime,
    totalScore: session.totalScore,
    answers: session.answers,
    correctCount,
    wrongCount,
    maxCombo: session.maxCombo,
    isChrono: session.isChrono,
    isNewRecord: false, // Determined by caller with access to profile stats
    beatDad: false, // Determined by caller with access to parent stats
    factsProgressed: session.factsProgressed,
  };
}

export function isSessionComplete(
  session: GameSession,
  isChrono: boolean
): boolean {
  if (isChrono) {
    // Chrono complete when 10 questions asked AND no remaining errors
    return (
      session.questionsAsked >= CHRONO_QUESTIONS &&
      session.sessionErrors.length === 0
    );
  }

  // Normal mode: no automatic completion, controlled by UI
  return false;
}
