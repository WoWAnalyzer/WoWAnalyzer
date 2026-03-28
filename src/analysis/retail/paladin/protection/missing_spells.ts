import { GenSpell } from 'parser/core/modules/genAbilities';
import spells from './spell-list_Paladin_Protection.retail';
import TALENTS from 'common/TALENTS/paladin';

export const HAMMER_OF_WRATH: GenSpell = {
  id: 1241413,
  type: 'baseline',
  overrides: 20271,
  name: 'Hammer of Wrath',
  icon: 'inv12_ability_paladin_hammerofwrath.jpg',
  iconID: 7439209,
  passive: false,
  //requiresTalentEntry: TALENTS.HAMMER_OF_WRATH_TALENT.entryIds,
  gcd: { duration: 1500, hasted: true },
  charges: {
    max: 1,
    modifiers: [{ max: 1, requiredSpells: [TALENTS.CRUSADERS_JUDGMENT_TALENT.id] }],
  },
  cooldown: { duration: 4949.999999999999, hasted: true },
};

export const SACRED_WEAPON: GenSpell = {
  id: 432472,
  type: 'talent',
  name: 'Sacred Weapon',
  icon: 'inv_ability_lightsmithpaladin_sacredweapon.jpg',
  iconID: 0,
  passive: false,
  requiresTalentEntry: TALENTS.HOLY_ARMAMENTS_TALENT.entryIds,
  gcd: { duration: 1500, hasted: true },
  charges: { max: 2 },
  cooldown: {
    duration: 60000,
    hasted: false,
    modifiers: [
      { duration: -15000, requiredSpells: [TALENTS.QUICKENED_INVOCATION_TALENT.id] },
      { duration: -12000, requiredSpells: [TALENTS.FOREWARNING_TALENT.id] },
    ],
  },
};

export const FINAL_STAND: GenSpell = {
  id: 204079,
  type: 'temporary',
  name: 'Final Stand',
  icon: 'spell_holy_crusade.jpg',
  iconID: 135889,
  passive: false,
  grantedBy: spells.FINAL_STAND_TALENT.id,
};
