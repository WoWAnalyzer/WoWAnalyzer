import { DurationData, PandemicData } from './types';

/**
 * Calculate the expected buff duration incorporating pandemic data.
 *
 * If unspecified, the pandemic cap is 3x buff duration (aka tank AM buff pandemic cap).
 */
export const buffDuration = (
  now: number,
  duration: DurationData | undefined,
  pandemic: PandemicData,
): number => {
  if (!duration || !duration?.timeRemaining) {
    // no duration data is known, use pandemic data only
    return pandemic.duration;
  }

  const expectedExpiration = duration.referenceTime + duration.timeRemaining;
  const remainingTime = Math.max(0, expectedExpiration - now);

  return Math.min(
    remainingTime + pandemic.duration,
    pandemic.duration * (pandemic.pandemicCap ?? 3),
  );
};
