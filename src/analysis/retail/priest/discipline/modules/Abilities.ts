import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { DISCIPLINE_ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../constants';

class Abilities extends CoreAbilities {
  constructor(...args: ConstructorParameters<typeof CoreAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = DISCIPLINE_ABILITIES_AFFECTED_BY_HEALING_INCREASES;
  }

  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: [
          SPELLS.PENANCE_CAST.id,
          SPELLS.PENANCE.id,
          SPELLS.DARK_REPRIMAND_CAST.id,
          SPELLS.DARK_REPRIMAND_DAMAGE.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 9 / (1 + haste),
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
        spell: TALENTS.POWER_WORD_RADIANCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: this.selectedCombatant.hasTalent(TALENTS.BRIGHT_PUPIL_TALENT) ? 15 : 20,
        charges: 2,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS.POWER_WORD_RADIANCE_TALENT),
      },
      {
        spell: TALENTS.EVANGELISM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.EVANGELISM_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS.ULTIMATE_PENITENCE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 240,
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS.ULTIMATE_PENITENCE_TALENT),
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        isDefensive: true,
        cooldown: (haste) =>
          (7.5 - (combatant.hasTalent(TALENTS.WASTE_NO_TIME_TALENT) ? 1.5 : 0.0)) / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.VOID_SHIELD.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        isDefensive: true,
        cooldown: (haste) =>
          (7.5 - (combatant.hasTalent(TALENTS.WASTE_NO_TIME_TALENT) ? 1.5 : 0.0)) / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.PAIN_SUPPRESSION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(TALENTS.PAIN_SUPPRESSION_TALENT),
      },
      {
        spell: TALENTS.DESPERATE_PRAYER_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90 - (combatant.hasTalent(TALENTS.ANGELS_MERCY_TALENT) ? 20 : 0),
        gcd: null,
        enabled: combatant.hasTalent(TALENTS.DESPERATE_PRAYER_TALENT),
      },
      {
        spell: [TALENTS.POWER_WORD_BARRIER_TALENT.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.POWER_WORD_BARRIER_TALENT),
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SMITE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.HOLY_NOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasTalent(TALENTS.LIGHTBURST_TALENT) ? 30 : 0,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.HOLY_NOVA_TALENT),
      },

      {
        spell: TALENTS.ANGELIC_FEATHER_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        charges: 3,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.ANGELIC_FEATHER_TALENT),
      },
      {
        spell: TALENTS.FADE_TALENT.id,
        category: combatant.hasTalent(TALENTS.TRANSLUCENT_IMAGE_TALENT)
          ? SPELL_CATEGORY.DEFENSIVE
          : SPELL_CATEGORY.UTILITY,
        cooldown: 30 - combatant.getTalentRank(TALENTS.IMPROVED_FADE_TALENT) * 5,
        enabled: combatant.hasTalent(TALENTS.FADE_TALENT),
      },
      {
        spell: TALENTS.LEAP_OF_FAITH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.MOVE_WITH_GRACE_TALENT) ? 60 : 90,
        enabled: combatant.hasTalent(TALENTS.LEAP_OF_FAITH_TALENT),
      },
      {
        spell: TALENTS.MIND_CONTROL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.MIND_CONTROL_TALENT),
      },
      {
        spell: TALENTS.DOMINATE_MIND_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS.MIND_CONTROL_TALENT),
      },
      {
        spell: TALENTS.MASS_DISPEL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.MASS_DISPEL_TALENT),
      },
      {
        spell: TALENTS.DISPEL_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.DISPEL_MAGIC_TALENT),
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
        spell: TALENTS.SHACKLE_HORROR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SHACKLE_HORROR_TALENT),
      },
      {
        spell: TALENTS.PSYCHIC_SCREAM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 40 - (combatant.hasTalent(TALENTS.PSYCHIC_VOICE_TALENT) ? 10 : 0),
        enabled: combatant.hasTalent(TALENTS.PSYCHIC_SCREAM_TALENT),
      },
      {
        spell: SPELLS.LEVITATE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.MIND_BLAST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: (haste) => 24 / (1 + haste),
      },
      {
        spell: SPELLS.MIND_SOOTHE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 5,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.POWER_WORD_FORTITUDE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.POWER_INFUSION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        //With Twins of the Sun Priestess, PI is added through the TwinsOftheSunPriestess module
        enabled:
          combatant.hasTalent(TALENTS.POWER_INFUSION_TALENT) &&
          !combatant.hasTalent(TALENTS.TWINS_OF_THE_SUN_PRIESTESS_TALENT),
      },
      {
        spell: TALENTS.SHADOW_WORD_DEATH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SHADOW_WORD_DEATH_TALENT),
      },
    ];
  }
}

export default Abilities;
