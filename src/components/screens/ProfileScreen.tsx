import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Screen, ProfileRole, UserProfile } from '../../types';
import { screenTransition, staggerContainer, staggerItem } from '../../hooks/useAnimation';
import { useUserStore } from '../../stores/userStore';
import { Button } from '../ui/Button';
import { AvatarPicker } from '../ui/AvatarPicker';

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const profiles = useUserStore((s) => s.profiles);
  const activeProfileId = useUserStore((s) => s.activeProfileId);
  const addProfile = useUserStore((s) => s.addProfile);
  const setActiveProfile = useUserStore((s) => s.setActiveProfile);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🚀');
  const [newRole, setNewRole] = useState<ProfileRole>('child');

  const handleCreate = () => {
    if (!newName.trim()) return;

    const profile: UserProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: newName.trim(),
      avatar: newAvatar,
      role: newRole,
      createdAt: Date.now(),
    };

    const success = addProfile(profile);
    if (success) {
      setActiveProfile(profile.id);
      setIsCreating(false);
      setNewName('');
      setNewAvatar('🚀');
      setNewRole('child');
    }
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
          Profils
        </h1>
      </div>

      {/* Profile list */}
      <motion.div
        className="flex flex-col gap-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfileId;
          return (
            <motion.button
              key={profile.id}
              variants={staggerItem}
              onClick={() => setActiveProfile(profile.id)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl backdrop-blur-md
                border-2 cursor-pointer select-none transition-colors
                ${isActive ? 'bg-cyan-500/10' : 'bg-white/5 hover:bg-white/10'}`}
              style={{
                borderColor: isActive ? '#00F5FF' : 'rgba(255,255,255,0.15)',
                boxShadow: isActive
                  ? '0 0 20px rgba(0, 245, 255, 0.3), inset 0 0 15px rgba(0, 245, 255, 0.1)'
                  : 'none',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-4xl">{profile.avatar}</span>
              <div className="flex flex-col items-start gap-1">
                <span className="font-quicksand text-white font-semibold text-lg">
                  {profile.name}
                </span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold font-fredoka border backdrop-blur-sm"
                  style={{
                    borderColor: profile.role === 'child' ? '#39FF14' : '#FF6B00',
                    color: profile.role === 'child' ? '#39FF14' : '#FF6B00',
                    backgroundColor:
                      profile.role === 'child'
                        ? 'rgba(57, 255, 20, 0.1)'
                        : 'rgba(255, 107, 0, 0.1)',
                  }}
                >
                  {profile.role === 'child' ? '👶 Enfant' : '👨 Parent'}
                </span>
              </div>
              {isActive && (
                <motion.span
                  className="ml-auto text-cyan-400 font-fredoka text-sm font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  ✓ Actif
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Add profile button */}
      {!isCreating && profiles.length < 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="magenta"
            size="lg"
            onClick={() => setIsCreating(true)}
            className="w-full"
          >
            + Nouveau profil
          </Button>
        </motion.div>
      )}

      {profiles.length >= 4 && !isCreating && (
        <p className="font-quicksand text-white/50 text-center text-sm">
          Maximum 4 profils atteint
        </p>
      )}

      {/* Creation form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            className="flex flex-col gap-5 p-5 rounded-2xl backdrop-blur-md border border-white/20 bg-white/5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-bungee text-xl text-white">Nouveau profil</h2>

            {/* Name input */}
            <div className="flex flex-col gap-2">
              <label className="font-quicksand text-white/70 text-sm">Nom</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={20}
                placeholder="Ton nom..."
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20
                  text-white font-quicksand placeholder-white/30
                  focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50
                  backdrop-blur-md"
              />
            </div>

            {/* Avatar picker */}
            <div className="flex flex-col gap-2">
              <label className="font-quicksand text-white/70 text-sm">Avatar</label>
              <AvatarPicker selected={newAvatar} onSelect={setNewAvatar} />
            </div>

            {/* Role toggle */}
            <div className="flex flex-col gap-2">
              <label className="font-quicksand text-white/70 text-sm">Role</label>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setNewRole('child')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                    border-2 font-quicksand font-semibold cursor-pointer select-none`}
                  style={{
                    borderColor: newRole === 'child' ? '#39FF14' : 'rgba(255,255,255,0.15)',
                    backgroundColor:
                      newRole === 'child' ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: newRole === 'child' ? '#39FF14' : 'rgba(255,255,255,0.6)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  👶 Enfant
                </motion.button>
                <motion.button
                  onClick={() => setNewRole('parent')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                    border-2 font-quicksand font-semibold cursor-pointer select-none`}
                  style={{
                    borderColor: newRole === 'parent' ? '#FF6B00' : 'rgba(255,255,255,0.15)',
                    backgroundColor:
                      newRole === 'parent'
                        ? 'rgba(255, 107, 0, 0.1)'
                        : 'rgba(255,255,255,0.05)',
                    color: newRole === 'parent' ? '#FF6B00' : 'rgba(255,255,255,0.6)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  👨 Parent
                </motion.button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setIsCreating(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="cyan"
                size="md"
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1"
              >
                Créer
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
