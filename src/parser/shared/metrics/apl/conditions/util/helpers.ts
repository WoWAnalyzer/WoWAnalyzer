import { PandemicData } from './types';

export const buffDuration = (timeRemaining: number | undefined, pandemic: PandemicData): number =>
  Math.min(
    (timeRemaining || 0) + pandemic.duration,
    pandemic.duration * (pandemic.pandemicCap || 3),
  );
