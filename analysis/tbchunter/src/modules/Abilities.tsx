import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

const SPELLS = {
  AUTO_SHOT: 75,
  MULTI_SHOT: 27021,
  STEADY_SHOT: 34120,
  AIMED_SHOT: 27065,
  ARCANE_SHOT: 27019,
  KILL_COMMAND: 34026,
  SERPENT_STING: 27016,
  RAPID_FIRE: 3045,
  BESTIAL_WRATH: 19574,
  INTIMIDATION: 19577,
  ASPECT_OF_THE_HAWK: 27044,
  ASPECT_OF_THE_CHEETAH: 5118,
  MISDIRECTION: 34477,
  RAPTOR_STRIKE: 27014,
  // TODO FEIGN_DEATH
  // TODO Traps
  // TODO FLARE
  // TODO HUNTERS_MARK
  // TODO VOLLEY_LOL
  // TODO CALL_PET
  // TODO DISMISS_PET
  // TODO REVIVE_PET
  // TODO MEND_PET
  // Orc racial
  BLOOD_FURY: 20572,
};

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    return [
      {
        spell: SPELLS.AUTO_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: null,
      },
      {
        spell: SPELLS.STEADY_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          // TODO: Verify when we get Haste in P4/5
          static: 1500,
        },
      },
      {
        spell: SPELLS.ARCANE_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6, // TODO: Talents
        gcd: {
          // TODO: Verify when we get Haste in P4/5
          static: 1500,
        },
      },
      {
        spell: SPELLS.MULTI_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 10,
        gcd: {
          // TODO: Verify when we get Haste in P4/5
          static: 1500,
        },
      },
      {
        spell: SPELLS.KILL_COMMAND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 5,
        gcd: null,
        // TODO: instead of cast efficiency use usage / proc rate
      },
      {
        spell: SPELLS.AIMED_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6,
        gcd: {
          // TODO: Verify when we get Haste in P4/5
          static: 1500,
        },
      },
      {
        spell: SPELLS.RAPTOR_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6,
        gcd: {
          // TODO: Verify when we get Haste in P4/5
          static: 1500,
        },
      },
      {
        spell: SPELLS.SERPENT_STING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          // TODO: Verify when we get Haste in P4/5
          static: 1500,
        },
      },
      {
        spell: SPELLS.RAPID_FIRE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300, // TODO: CD reduction talent
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.BESTIAL_WRATH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_HAWK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          // TODO: Verify when we get Haste in P4/5
          static: 1500,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          // TODO: Verify when we get Haste in P4/5
          static: 1500,
        },
      },
      {
        spell: SPELLS.MISDIRECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        gcd: {
          // TODO: Verify when we get Haste in P4/5
          static: 1500,
        },
      },
    ];
  }
}

export default Abilities;
