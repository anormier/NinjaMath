import React from 'react';
import { motion } from 'framer-motion';

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 32,
} as const;

export interface StarRatingProps {
  rating: number;
  size?: keyof typeof SIZE_MAP;
  animated?: boolean;
}

const Star: React.FC<{
  filled: boolean;
  half: boolean;
  pixelSize: number;
  index: number;
  animated: boolean;
}> = ({ filled, half, pixelSize, index, animated }) => {
  const fillColor = '#FFD700';
  const emptyColor = '#444466';

  return (
    <motion.svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      initial={animated ? { scale: 0, rotate: -180 } : undefined}
      animate={animated ? { scale: 1, rotate: 0 } : undefined}
      transition={
        animated
          ? {
              delay: index * 0.15,
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }
          : undefined
      }
    >
      <defs>
        <linearGradient id={`half-fill-${index}`}>
          <stop offset="50%" stopColor={fillColor} />
          <stop offset="50%" stopColor={emptyColor} />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={
          filled ? fillColor : half ? `url(#half-fill-${index})` : emptyColor
        }
        stroke={fillColor}
        strokeWidth="0.5"
      />
    </motion.svg>
  );
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  animated = false,
}) => {
  const pixelSize = SIZE_MAP[size];
  const clampedRating = Math.max(0, Math.min(5, rating));

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(clampedRating);
        const half = !filled && i < clampedRating;
        return (
          <Star
            key={i}
            filled={filled}
            half={half}
            pixelSize={pixelSize}
            index={i}
            animated={animated}
          />
        );
      })}
    </div>
  );
};
