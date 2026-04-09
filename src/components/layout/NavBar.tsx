import { motion } from 'framer-motion';
import type { Screen } from '../../types';

interface NavBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  visible: boolean;
}

const navItems: Array<{ screen: Screen; icon: string; label: string }> = [
  { screen: 'home', icon: '🏠', label: 'Accueil' },
  { screen: 'leaderboard', icon: '🏆', label: 'Classement' },
  { screen: 'profile', icon: '👤', label: 'Profil' },
];

export function NavBar({ currentScreen, onNavigate, visible }: NavBarProps) {
  if (!visible) return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
    >
      <div className="glass-strong mx-2 mb-2 rounded-2xl flex justify-around items-center py-2">
        {navItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              currentScreen === item.screen
                ? 'bg-white/10 neon-text-cyan'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-quicksand">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
}
