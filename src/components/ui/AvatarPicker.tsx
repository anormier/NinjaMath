import React from 'react';
import { motion } from 'framer-motion';
import { AVATARS } from '../../types';

export interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
      {AVATARS.map((avatar) => {
        const isSelected = selected === avatar;
        return (
          <motion.button
            key={avatar}
            onClick={() => onSelect(avatar)}
            className="flex items-center justify-center w-16 h-16 rounded-2xl text-3xl
              backdrop-blur-md border-2 cursor-pointer select-none"
            style={{
              borderColor: isSelected ? '#00F5FF' : 'rgba(255,255,255,0.15)',
              backgroundColor: isSelected
                ? 'rgba(0, 245, 255, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              boxShadow: isSelected
                ? '0 0 20px rgba(0, 245, 255, 0.5), inset 0 0 15px rgba(0, 245, 255, 0.2)'
                : 'none',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {avatar}
          </motion.button>
        );
      })}
    </div>
  );
};
