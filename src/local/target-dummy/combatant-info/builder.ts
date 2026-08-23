import { EventType, type CombatantInfoEvent, type Item } from 'parser/core/Events';

import type { LocalDiagnostic } from '../../LocalCombatLogParser';
import {
  type ParsedSimcAddonProfile,
  type SimcResult,
  type SimcEquipmentSlot,
} from '../simc/contracts';
import type { DecodedTalentLoadout } from './contracts';
import {
  type TargetDummyBuildBinding,
  type TargetDummyPlayerBinding,
  validateCombatantInfoProfile,
} from './validator';

const AUTHENTIC_RETAIL_GEAR_SLOT_COUNT = 18;
const UNKNOWN_ICON = 'inv_misc_questionmark';
const NORMALIZED_GEAR_SLOT: Readonly<Partial<Record<SimcEquipmentSlot, number>>> = {
  head: 0,
  neck: 1,
  shoulder: 2,
  shirt: 3,
  chest: 4,
  waist: 5,
  legs: 6,
  feet: 7,
  wrist: 8,
  hands: 9,
  finger1: 10,
  finger2: 11,
  trinket1: 12,
  trinket2: 13,
  back: 14,
  main_hand: 15,
  off_hand: 16,
  tabard: 17,
};

export interface BuiltCombatantInfo {
  readonly event: CombatantInfoEvent;
  readonly diagnostics: readonly LocalDiagnostic[];
}

export interface BuildCombatantInfoOptions {
  readonly profile: ParsedSimcAddonProfile;
  readonly talents: DecodedTalentLoadout;
  readonly player: TargetDummyPlayerBinding;
  readonly build: TargetDummyBuildBinding;
  readonly timestamp: number;
  readonly factionChoice?: 1 | 2;
}

function emptyGearSlot(): Item {
  return { id: 0, itemLevel: 0, quality: 1, icon: UNKNOWN_ICON };
}

export function buildCombatantInfoEvent(
  options: BuildCombatantInfoOptions,
): SimcResult<BuiltCombatantInfo> {
  const validated = validateCombatantInfoProfile(
    options.profile,
    options.talents,
    options.player,
    options.build,
    options.factionChoice,
  );
  if (!validated.ok) {
    return validated;
  }

  const gear = Array.from({ length: AUTHENTIC_RETAIL_GEAR_SLOT_COUNT }, emptyGearSlot);
  for (const item of options.profile.equipment) {
    const slot = NORMALIZED_GEAR_SLOT[item.slot];
    if (slot === undefined || item.itemLevel === undefined) {
      return {
        ok: false,
        error: {
          code: 'SIMC_PROFILE_MALFORMED',
          message: `Equipment slot ${item.slot} is not valid for a current Retail character.`,
          recoverable: true,
          suggestedAction: 'Run /simc again and paste the active Retail character export.',
        },
      };
    }
    gear[slot] = {
      id: item.itemId,
      itemLevel: item.itemLevel,
      quality: 0,
      icon: UNKNOWN_ICON,
      ...(item.enchantId === undefined ? {} : { permanentEnchant: item.enchantId }),
      ...(item.bonusIds.length === 0 ? {} : { bonusIDs: [...item.bonusIds] }),
      ...(item.gemIds.length === 0
        ? {}
        : {
            gems: item.gemIds.map((id) => ({ id, itemLevel: 0, icon: UNKNOWN_ICON })),
          }),
    };
  }

  const zeroStats = {
    strength: 0,
    agility: 0,
    stamina: 0,
    intellect: 0,
    dodge: 0,
    parry: 0,
    block: 0,
    armor: 0,
    critMelee: 0,
    critRanged: 0,
    critSpell: 0,
    speed: 0,
    leech: 0,
    hasteMelee: 0,
    hasteRanged: 0,
    hasteSpell: 0,
    avoidance: 0,
    mastery: 0,
    versatilityDamageDone: 0,
    versatilityHealingDone: 0,
    versatilityDamageReduction: 0,
  } as const;
  return {
    ok: true,
    value: {
      event: {
        type: EventType.CombatantInfo,
        timestamp: options.timestamp,
        sourceID: options.player.sourceId,
        specID: validated.value.specId,
        expansion: 'retail',
        pin: '',
        gear,
        auras: [],
        faction: validated.value.faction,
        ...zeroStats,
        talentTree: options.talents.talents.map((talent) => ({
          nodeID: talent.nodeId,
          id: talent.entryId,
          rank: talent.rank,
        })),
        talents: [],
        pvpTalents: [],
      },
      diagnostics: [
        {
          line: 0,
          severity: 'warning',
          message: 'Live combatant ratings are unavailable in /simc and were defaulted to zero.',
        },
        {
          line: 0,
          severity: 'warning',
          message: 'Pull-time combatant auras are unavailable in /simc and were left empty.',
        },
        {
          line: 0,
          severity: 'warning',
          message:
            'Item quality, icons, and gem item levels are unavailable in /simc and use display-only defaults.',
        },
      ],
    },
  };
}
