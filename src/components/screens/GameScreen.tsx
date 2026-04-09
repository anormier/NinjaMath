import React, { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Screen, GameMode } from '../../types';
import { CHRONO_QUESTIONS } from '../../types';
import { screenTransition, popIn, shakeAnimation } from '../../hooks/useAnimation';
import { useGameStore } from '../../stores/gameStore';
import { useUserStore } from '../../stores/userStore';
import { useTimer } from '../../hooks/useTimer';
import { useKeyboard } from '../../hooks/useKeyboard';
import { Timer } from '../game/Timer';
import { ScoreDisplay } from '../game/ScoreDisplay';
import { ProgressBar } from '../game/ProgressBar';
import { Button } from '../ui/Button';

interface GameScreenProps {
  onNavigate: (screen: Screen) => void;
  mode: GameMode;
  table: number | null;
  isChrono: boolean;
}

const FEEDBACK_DURATION = 600;

export const GameScreen: React.FC<GameScreenProps> = ({
  onNavigate,
  mode,
  table,
  isChrono,
}) => {
  const activeProfile = useUserStore((s) => s.getActiveProfile());
  const {
    currentSession,
    currentQuestion,
    isShowingFeedback,
    lastAnswerResult,
    startGame,
    submitAnswer,
    nextQuestion,
    endGame,
  } = useGameStore();

  const timer = useTimer();
  const questionStartRef = useRef<number>(Date.now());
  const [keypadValue, setKeypadValue] = useState('');
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const hasStartedRef = useRef(false);

  // Start game on mount
  useEffect(() => {
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;
    startGame(mode, table, activeProfile.id, isChrono);
    timer.start();
    questionStartRef.current = Date.now();

    return () => {
      timer.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle feedback → next question flow
  useEffect(() => {
    if (!isShowingFeedback) return;

    const timeout = setTimeout(() => {
      // Check for fact progression message
      if (currentSession && currentSession.factsProgressed.length > 0) {
        const lastProgression =
          currentSession.factsProgressed[currentSession.factsProgressed.length - 1];
        if (lastProgression && lastAnswerResult) {
          const matchesLast =
            lastProgression.a === lastAnswerResult.a &&
            lastProgression.b === lastAnswerResult.b;
          if (matchesLast && lastProgression.to === 'keypad') {
            setTransitionMessage(
              `Bravo ! Plus besoin des choix pour ${lastProgression.a}\u00d7${lastProgression.b} !`
            );
            setTimeout(() => setTransitionMessage(null), 2000);
          }
        }
      }

      // Check if game is complete (chrono mode with no more questions)
      const nextQ = currentQuestion;
      nextQuestion();

      // After nextQuestion, check if null → session complete
      const store = useGameStore.getState();
      if (!store.currentQuestion) {
        timer.stop();
        endGame();
        onNavigate('result');
        return;
      }

      setKeypadValue('');
      questionStartRef.current = Date.now();
    }, FEEDBACK_DURATION);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowingFeedback, feedbackKey]);

  // Submit answer handler
  const handleSubmit = useCallback(
    (answer: number) => {
      if (isShowingFeedback || !currentQuestion) return;
      const timeMs = Date.now() - questionStartRef.current;
      submitAnswer(answer, timeMs);
      setFeedbackKey((k) => k + 1);
    },
    [isShowingFeedback, currentQuestion, submitAnswer]
  );

  // Keypad handlers
  const handleDigit = useCallback(
    (digit: number) => {
      if (isShowingFeedback) return;
      setKeypadValue((v) => {
        if (v.length >= 3) return v;
        return v + digit.toString();
      });
    },
    [isShowingFeedback]
  );

  const handleBackspace = useCallback(() => {
    if (isShowingFeedback) return;
    setKeypadValue((v) => v.slice(0, -1));
  }, [isShowingFeedback]);

  const handleEnter = useCallback(() => {
    if (isShowingFeedback || !keypadValue) return;
    handleSubmit(parseInt(keypadValue, 10));
  }, [isShowingFeedback, keypadValue, handleSubmit]);

  // Keyboard hook for desktop (only in keypad mode)
  useKeyboard({
    onDigit: handleDigit,
    onEnter: handleEnter,
    onBackspace: handleBackspace,
    enabled: currentQuestion?.inputMode === 'keypad' && !isShowingFeedback,
  });

  // End game manually (for practice mode)
  const handleEndGame = useCallback(() => {
    timer.stop();
    endGame();
    onNavigate('result');
  }, [timer, endGame, onNavigate]);

  if (!currentSession) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-full"
        variants={screenTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <p className="font-quicksand text-white/70">Chargement...</p>
      </motion.div>
    );
  }

  const totalQuestions = isChrono ? CHRONO_QUESTIONS : 20;
  const comboMultiplier =
    currentSession.currentCombo >= 20
      ? 5
      : currentSession.currentCombo >= 10
        ? 3
        : currentSession.currentCombo >= 5
          ? 2
          : currentSession.currentCombo >= 3
            ? 1.5
            : 1;

  return (
    <motion.div
      className="flex flex-col min-h-full"
      variants={screenTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Timer */}
        <Timer elapsedMs={timer.elapsedMs} isRunning={timer.isRunning} />

        {/* Score */}
        <ScoreDisplay
          score={currentSession.totalScore}
          lastGain={lastAnswerResult?.scoreEvent.totalPoints ?? null}
        />

        {/* Progress */}
        <div className="w-24 sm:w-32">
          <ProgressBar
            current={currentSession.questionsAsked}
            total={totalQuestions}
            correctCount={currentSession.answers.filter((a) => a.correct).length}
            wrongCount={currentSession.answers.filter((a) => !a.correct).length}
          />
        </div>
      </div>

      {/* Combo multiplier */}
      <AnimatePresence>
        {comboMultiplier > 1 && (
          <motion.div
            className="flex justify-end px-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <span
              className="font-bungee text-sm px-3 py-1 rounded-full border"
              style={{
                color: '#FF6B00',
                borderColor: '#FF6B00',
                backgroundColor: 'rgba(255, 107, 0, 0.15)',
                textShadow: '0 0 8px rgba(255, 107, 0, 0.6)',
              }}
            >
              x{comboMultiplier}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {/* Transition message */}
        <AnimatePresence>
          {transitionMessage && (
            <motion.div
              className="absolute z-30 px-6 py-3 rounded-2xl backdrop-blur-md
                border border-lime-400/50 bg-lime-500/10"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
            >
              <p
                className="font-quicksand text-lime-300 font-bold text-center"
                style={{ textShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
              >
                {transitionMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question card */}
        {currentQuestion && (
          <motion.div
            key={`q-${currentSession.questionsAsked}`}
            variants={popIn}
            initial="initial"
            animate="animate"
            className="w-full max-w-lg p-6 sm:p-8 rounded-3xl backdrop-blur-md
              border border-white/20 bg-white/5 text-center"
            style={{
              boxShadow: '0 0 30px rgba(0, 245, 255, 0.1)',
            }}
          >
            {currentQuestion.displaySubtext &&
              currentQuestion.style !== 'emoji' && (
                <p className="font-quicksand text-white/60 text-sm mb-3">
                  {currentQuestion.displaySubtext}
                </p>
              )}

            <p
              className={`font-fredoka text-white leading-relaxed ${
                currentQuestion.fontClass ?? 'text-3xl sm:text-4xl font-bold'
              }`}
              style={{
                transform: currentQuestion.cssTransform,
                textShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
              }}
            >
              {currentQuestion.colorMap
                ? currentQuestion.displayText.split('').map((char, i) => (
                    <span
                      key={i}
                      style={{
                        color:
                          currentQuestion.colorMap![
                            i % currentQuestion.colorMap!.length
                          ],
                      }}
                    >
                      {char}
                    </span>
                  ))
                : currentQuestion.displayText}
            </p>

            {currentQuestion.style === 'emoji' && currentQuestion.displaySubtext && (
              <p className="mt-4 text-2xl leading-loose whitespace-pre-line">
                {currentQuestion.displaySubtext}
              </p>
            )}
          </motion.div>
        )}

        {/* Feedback overlays */}
        <AnimatePresence>
          {isShowingFeedback && lastAnswerResult && (
            <motion.div
              className="absolute z-20"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {lastAnswerResult.correct ? (
                <motion.div
                  className="flex flex-col items-center gap-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-6xl">✅</span>
                  {lastAnswerResult.scoreEvent.totalPoints > 0 && (
                    <span
                      className="font-bungee text-2xl"
                      style={{
                        color: '#39FF14',
                        textShadow: '0 0 15px rgba(57, 255, 20, 0.8)',
                      }}
                    >
                      +{lastAnswerResult.scoreEvent.totalPoints}
                    </span>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="flex flex-col items-center gap-2"
                  variants={shakeAnimation}
                  animate="shake"
                >
                  <span className="text-6xl">❌</span>
                  <span
                    className="font-fredoka text-xl font-bold"
                    style={{
                      color: '#FF4444',
                      textShadow: '0 0 10px rgba(255, 68, 68, 0.6)',
                    }}
                  >
                    {currentQuestion
                      ? `${currentQuestion.a} × ${currentQuestion.b} = ${currentQuestion.answer}`
                      : ''}
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Streak indicator */}
      <div className="flex items-center justify-between px-4 pb-1">
        {currentSession.currentCombo >= 3 && (
          <motion.span
            className="font-fredoka text-sm font-bold"
            style={{
              color: '#FFD700',
              textShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            🔥 {currentSession.currentCombo} combo
          </motion.span>
        )}
        <div />
        {!isChrono && (
          <Button variant="ghost" size="sm" onClick={handleEndGame}>
            Terminer
          </Button>
        )}
      </div>

      {/* Answer area */}
      {currentQuestion && (
        <div className="px-4 pb-6 pt-2">
          {currentQuestion.inputMode === 'keypad' ? (
            /* Keypad input */
            <div className="flex flex-col items-center gap-3">
              {/* Display typed value */}
              <div
                className="w-full max-w-xs h-14 flex items-center justify-center rounded-xl
                  backdrop-blur-md border border-white/20 bg-white/5"
              >
                <span
                  className="font-fredoka text-3xl font-bold text-white tabular-nums"
                  style={{ textShadow: '0 0 10px rgba(0, 245, 255, 0.5)' }}
                >
                  {keypadValue || '?'}
                </span>
              </div>

              {/* Number grid */}
              <div className="grid grid-cols-3 gap-2 max-w-xs w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <motion.button
                    key={digit}
                    onClick={() => handleDigit(digit)}
                    disabled={isShowingFeedback}
                    className="h-14 rounded-xl backdrop-blur-md border border-white/20 bg-white/5
                      font-fredoka text-xl font-bold text-white cursor-pointer select-none
                      disabled:opacity-40 disabled:cursor-not-allowed"
                    whileHover={{ backgroundColor: 'rgba(0, 245, 255, 0.15)' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {digit}
                  </motion.button>
                ))}
                <motion.button
                  onClick={handleBackspace}
                  disabled={isShowingFeedback}
                  className="h-14 rounded-xl backdrop-blur-md border border-white/20 bg-white/5
                    font-fredoka text-xl text-white cursor-pointer select-none
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  whileHover={{ backgroundColor: 'rgba(255, 107, 0, 0.15)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  ⌫
                </motion.button>
                <motion.button
                  onClick={() => handleDigit(0)}
                  disabled={isShowingFeedback}
                  className="h-14 rounded-xl backdrop-blur-md border border-white/20 bg-white/5
                    font-fredoka text-xl font-bold text-white cursor-pointer select-none
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  whileHover={{ backgroundColor: 'rgba(0, 245, 255, 0.15)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  0
                </motion.button>
                <motion.button
                  onClick={handleEnter}
                  disabled={isShowingFeedback || !keypadValue}
                  className="h-14 rounded-xl border-2 font-fredoka text-xl font-bold
                    cursor-pointer select-none
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    borderColor: '#39FF14',
                    backgroundColor: 'rgba(57, 255, 20, 0.1)',
                    color: '#39FF14',
                    boxShadow: '0 0 10px rgba(57, 255, 20, 0.3)',
                  }}
                  whileHover={{
                    boxShadow: '0 0 20px rgba(57, 255, 20, 0.5)',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  OK
                </motion.button>
              </div>
            </div>
          ) : (
            /* QCM choices */
            <div
              className={`grid gap-3 max-w-lg mx-auto ${
                (currentQuestion.choices?.length ?? 0) <= 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2'
              }`}
            >
              {currentQuestion.choices?.map((choice, index) => (
                <motion.button
                  key={`${choice}-${index}`}
                  onClick={() => handleSubmit(choice)}
                  disabled={isShowingFeedback}
                  className="h-16 rounded-2xl backdrop-blur-md border-2 font-fredoka text-2xl
                    font-bold text-white cursor-pointer select-none
                    disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    borderColor: isShowingFeedback
                      ? choice === currentQuestion.answer
                        ? '#39FF14'
                        : lastAnswerResult?.userAnswer === choice
                          ? '#FF4444'
                          : 'rgba(255,255,255,0.15)'
                      : 'rgba(255,255,255,0.20)',
                    backgroundColor: isShowingFeedback
                      ? choice === currentQuestion.answer
                        ? 'rgba(57, 255, 20, 0.15)'
                        : lastAnswerResult?.userAnswer === choice
                          ? 'rgba(255, 68, 68, 0.15)'
                          : 'rgba(255,255,255,0.05)'
                      : 'rgba(255,255,255,0.05)',
                    boxShadow: isShowingFeedback
                      ? choice === currentQuestion.answer
                        ? '0 0 15px rgba(57, 255, 20, 0.4)'
                        : 'none'
                      : 'none',
                  }}
                  whileHover={
                    isShowingFeedback
                      ? undefined
                      : {
                          borderColor: '#00F5FF',
                          backgroundColor: 'rgba(0, 245, 255, 0.1)',
                        }
                  }
                  whileTap={isShowingFeedback ? undefined : { scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {choice}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
