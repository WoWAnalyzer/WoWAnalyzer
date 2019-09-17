import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';

// Provided by Blizzard, used to calculate the cooldown reduction of Strive for Perfection
const VISION_MAGIC_NUMBER = 2896;
// This will work for any cooldown and should probably be in a shared/common folder
// Requires cooldown in seconds and returns cooldown in seconds
const calculateCooldown = (ilvl, cooldown) => {
  let reductionPercentage = ((calculateAzeriteEffects(SPELLS.STRIVE_FOR_PERFECTION.id, ilvl)[0] + VISION_MAGIC_NUMBER) / -100);
  // Clamped to 10% - 25%
  reductionPercentage = Math.max(10, Math.min(25, reductionPercentage));
  return Math.round(cooldown * (1 - reductionPercentage / 100));
};

export {calculateCooldown};