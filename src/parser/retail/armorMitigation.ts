import { WCLFight } from 'parser/core/Fight';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { DamageEvent } from 'parser/core/Events';

export const maximumArmorMitigation = 0.85;

export enum ArmorCoefficientKey {
  BASE = 'base',
  MYTHIC_PLUS = 'm+',
  RAID_LFR = 'raid_lfr',
  RAID_NORMAL = 'raid_n',
  RAID_HEROIC = 'raid_h',
  RAID_MYTHIC = 'raid_m',
}

// These were pulled from Peak of Serenity theorycrafting channel and need to be updated every tier.
export const armorCoefficients = {
  [ArmorCoefficientKey.BASE]: 11766.0,
  [ArmorCoefficientKey.MYTHIC_PLUS]: 12824.94,
  [ArmorCoefficientKey.RAID_LFR]: 13083.792,
  [ArmorCoefficientKey.RAID_NORMAL]: 14025.072,
  [ArmorCoefficientKey.RAID_HEROIC]: 15084.012,
  [ArmorCoefficientKey.RAID_MYTHIC]: 16284.144,
};

/**
 * Gets the {@link ArmorCoefficientKey} for a given fight.
 */
export const getArmorCoefficientKey = (fight: WCLFight) => {
  switch (fight.difficulty) {
    case DIFFICULTIES.LFR_RAID:
      return ArmorCoefficientKey.RAID_LFR;
    case DIFFICULTIES.NORMAL_RAID:
      return ArmorCoefficientKey.RAID_NORMAL;
    case DIFFICULTIES.HEROIC_RAID:
      return ArmorCoefficientKey.RAID_HEROIC;
    case DIFFICULTIES.MYTHIC_RAID:
      return ArmorCoefficientKey.RAID_MYTHIC;
    case DIFFICULTIES.MYTHIC_PLUS_DUNGEON:
      return ArmorCoefficientKey.MYTHIC_PLUS;
    default:
      return ArmorCoefficientKey.BASE;
  }
};

/**
 * Gets the armor coefficient for a given fight.
 */
export const getArmorCoefficient = (fight: WCLFight) =>
  armorCoefficients[getArmorCoefficientKey(fight)];

const clamp = (actual: number, min: number, max: number) => Math.min(max, Math.max(min, actual));

const debug = true;

interface GetArmorMitigationParams {
  armor: number;
  fight: WCLFight;
  unmitigatedAmount?: number;
}
interface ArmorMitigationResult {
  amount: number;
  percentage: number;
}

/**
 * Gets armor mitigation values for a given amount of armor, fight, and unmitigated amount of damage.
 */
export const getArmorMitigation = ({
  armor,
  fight,
  unmitigatedAmount = 0,
}: GetArmorMitigationParams): ArmorMitigationResult => {
  const armorMitigatedPercentage = clamp(
    armor / (armor + getArmorCoefficient(fight)),
    0,
    maximumArmorMitigation,
  );
  const armorMitigatedAmount = armorMitigatedPercentage * unmitigatedAmount;
  debug &&
    console.log(
      `getArmorMitigation - percentage=${armorMitigatedPercentage} unmitigatedAmount=${unmitigatedAmount} amount=${armorMitigatedAmount}`,
    );
  return { amount: armorMitigatedAmount, percentage: armorMitigatedPercentage };
};

export const getArmorMitigationForEvent = (
  { armor, unmitigatedAmount }: DamageEvent,
  fight: WCLFight,
) => {
  if (!armor) {
    debug && console.log('getArmorMitigationPercentage - armor was undefined on damage event');
    return undefined;
  }
  return getArmorMitigation({ armor, fight, unmitigatedAmount });
};
