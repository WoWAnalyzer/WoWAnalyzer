import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { DISCIPLINE_ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../constants';
import { TALENTS_PRIEST } from 'common/TALENTS';

class Abilities extends CoreAbilities {
  constructor(...args: ConstructorParameters<typeof CoreAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = DISCIPLINE_ABILITIES_AFFECTED_BY_HEALING_INCREASES;
  }

  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: [SPELLS.PENANCE_CAST.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 9 / (1 + haste),
        charges: combatant.hasTalent(TALENTS_PRIEST.GUIDING_LIGHT_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.PLEA.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.FLASH_HEAL.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: this.selectedCombatant.hasTalent(TALENTS_PRIEST.BRIGHT_PUPIL_TALENT) ? 15 : 18,
        charges: this.selectedCombatant.hasTalent(TALENTS_PRIEST.LIGHTS_PROMISE_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT),
      },
      {
        spell: TALENTS_PRIEST.EVANGELISM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.EVANGELISM_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS_PRIEST.ULTIMATE_PENITENCE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 240,
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.ULTIMATE_PENITENCE_TALENT),
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        isDefensive: true,
        cooldown: (haste) =>
          (7.5 - (combatant.hasTalent(TALENTS_PRIEST.WASTE_NO_TIME_TALENT) ? 1.5 : 0.0)) /
          (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.VOID_SHIELD.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        isDefensive: true,
        cooldown: (haste) =>
          (7.5 - (combatant.hasTalent(TALENTS_PRIEST.WASTE_NO_TIME_TALENT) ? 1.5 : 0.0)) /
          (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_PRIEST.PAIN_SUPPRESSION_TALENT.id,
        charges: combatant.hasTalent(TALENTS_PRIEST.PROTECTOR_OF_THE_FRAIL_TALENT) ? 2 : 1,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        enabled: combatant.hasTalent(TALENTS_PRIEST.PAIN_SUPPRESSION_TALENT),
      },
      {
        spell: TALENTS_PRIEST.DESPERATE_PRAYER_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90 - (combatant.hasTalent(TALENTS_PRIEST.ANGELS_MERCY_TALENT) ? 20 : 0),
        gcd: null,
        enabled: combatant.hasTalent(TALENTS_PRIEST.DESPERATE_PRAYER_TALENT),
      },
      {
        spell: [TALENTS_PRIEST.POWER_WORD_BARRIER_TALENT.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.POWER_WORD_BARRIER_TALENT),
      },
      {
        spell: SPELLS.SMITE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.VOID_BLAST_CAST_DISC.id,
        enabled: combatant.hasTalent(TALENTS_PRIEST.VOID_BLAST_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_PRIEST.MIND_BLAST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: (haste) => 28 / (1 + haste),
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT),
      },
      {
        spell: TALENTS_PRIEST.HOLY_NOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasTalent(TALENTS_PRIEST.LIGHTBURST_TALENT) ? 30 : 0,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.HOLY_NOVA_TALENT),
      },
      {
        spell: SPELLS.PURIFY.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_PRIEST.MASS_DISPEL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.MASS_DISPEL_TALENT),
      },
      {
        spell: TALENTS_PRIEST.DISPEL_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.DISPEL_MAGIC_TALENT),
      },
      {
        spell: TALENTS_PRIEST.ANGELIC_FEATHER_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        charges: 3,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.ANGELIC_FEATHER_TALENT),
      },
      {
        spell: TALENTS_PRIEST.FADE_TALENT.id,
        category: combatant.hasTalent(TALENTS_PRIEST.TRANSLUCENT_IMAGE_TALENT)
          ? SPELL_CATEGORY.DEFENSIVE
          : SPELL_CATEGORY.UTILITY,
        cooldown: 30 - combatant.getTalentRank(TALENTS_PRIEST.IMPROVED_FADE_TALENT) * 5,
        enabled: combatant.hasTalent(TALENTS_PRIEST.FADE_TALENT),
      },
      {
        spell: TALENTS_PRIEST.LEAP_OF_FAITH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS_PRIEST.MOVE_WITH_GRACE_TALENT) ? 60 : 90,
        enabled: combatant.hasTalent(TALENTS_PRIEST.LEAP_OF_FAITH_TALENT),
      },
      {
        spell: TALENTS_PRIEST.MIND_CONTROL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_PRIEST.MIND_CONTROL_TALENT),
      },
      {
        spell: TALENTS_PRIEST.DOMINATE_MIND_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS_PRIEST.MIND_CONTROL_TALENT),
      },
      {
        spell: TALENTS_PRIEST.SHACKLE_HORROR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.SHACKLE_HORROR_TALENT),
      },
      {
        spell: TALENTS_PRIEST.PSYCHIC_SCREAM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 40 - (combatant.hasTalent(TALENTS_PRIEST.PSYCHIC_VOICE_TALENT) ? 10 : 0),
        enabled: combatant.hasTalent(TALENTS_PRIEST.PSYCHIC_SCREAM_TALENT),
      },
      {
        spell: SPELLS.LEVITATE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_SOOTHE.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: 5,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.POWER_WORD_FORTITUDE.id,
        category: SPELL_CATEGORY.HIDDEN,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_PRIEST.POWER_INFUSION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        //With Twins of the Sun Priestess, PI is added through the TwinsOftheSunPriestess module
        enabled:
          combatant.hasTalent(TALENTS_PRIEST.POWER_INFUSION_TALENT) &&
          !combatant.hasTalent(TALENTS_PRIEST.TWINS_OF_THE_SUN_PRIESTESS_TALENT),
      },
    ];
  }
}

export default Abilities;
