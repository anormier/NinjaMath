import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppShell } from './components/layout/AppShell';
import { NavBar } from './components/layout/NavBar';
import { HomeScreen } from './components/screens/HomeScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { ModeSelectScreen } from './components/screens/ModeSelectScreen';
import { TableSelectScreen } from './components/screens/TableSelectScreen';
import { GameScreen } from './components/screens/GameScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import type { Screen, GameMode } from './types';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [gameMode, setGameMode] = useState<GameMode>('max_power');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isChrono, setIsChrono] = useState(false);

  const navigate = useCallback((screen: Screen) => {
    // When ModeSelectScreen navigates to 'game', it means max_power
    if (screen === 'game' && currentScreen === 'mode_select') {
      setGameMode('max_power');
      setSelectedTable(null);
      setIsChrono(false);
    }
    setCurrentScreen(screen);
  }, [currentScreen]);

  const handleTableSelect = useCallback((table: number, chrono: boolean) => {
    setSelectedTable(table);
    setIsChrono(chrono);
    setGameMode('single_table');
    setCurrentScreen('game');
  }, []);

  const hideNavScreens: Screen[] = ['game'];
  const showNav = !hideNavScreens.includes(currentScreen);

  return (
    <AppShell>
      <div className={`flex-1 overflow-y-auto ${showNav ? 'pb-20' : ''}`}>
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <HomeScreen key="home" onNavigate={navigate} />
          )}
          {currentScreen === 'profile' && (
            <ProfileScreen key="profile" onNavigate={navigate} />
          )}
          {currentScreen === 'mode_select' && (
            <ModeSelectScreen
              key="mode_select"
              onNavigate={navigate}
            />
          )}
          {currentScreen === 'table_select' && (
            <TableSelectScreen
              key="table_select"
              onNavigate={navigate}
              onSelectTable={handleTableSelect}
            />
          )}
          {currentScreen === 'game' && (
            <GameScreen
              key="game"
              onNavigate={navigate}
              mode={gameMode}
              table={selectedTable}
              isChrono={isChrono}
            />
          )}
          {currentScreen === 'result' && (
            <ResultScreen key="result" onNavigate={navigate} />
          )}
          {currentScreen === 'leaderboard' && (
            <LeaderboardScreen key="leaderboard" onNavigate={navigate} />
          )}
        </AnimatePresence>
      </div>
      <NavBar currentScreen={currentScreen} onNavigate={navigate} visible={showNav} />
    </AppShell>
  );
}
