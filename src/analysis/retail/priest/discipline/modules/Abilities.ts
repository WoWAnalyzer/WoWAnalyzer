import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { TALENTS_PRIEST } from 'common/TALENTS';
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
        cooldown: 9,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [TALENTS_PRIEST.RENEW_TALENT.id],
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
        spell: SPELLS.POWER_WORD_RADIANCE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: this.selectedCombatant.hasTalent(TALENTS_PRIEST.BRIGHT_PUPIL_TALENT) ? 15 : 20,
        charges: 2,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
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
        spell: TALENTS.ULTIMATE_PENITENCE_TALENT.id,
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
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [
          TALENTS_PRIEST.DIVINE_STAR_SHARED_TALENT.id,
          TALENTS_PRIEST.DIVINE_STAR_SHADOW_TALENT.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.DIVINE_STAR_SHARED_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: [SPELLS.HALO_TALENT.id, TALENTS_PRIEST.HALO_SHADOW_TALENT.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 40,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.HALO_SHARED_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },

      {
        spell: TALENTS_PRIEST.MINDBENDER_DISCIPLINE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.MINDBENDER_DISCIPLINE_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS_PRIEST.POWER_WORD_LIFE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_PRIEST.POWER_WORD_LIFE_TALENT),
      },
      {
        spell: SPELLS.SHADOWFIEND.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(TALENTS_PRIEST.MINDBENDER_DISCIPLINE_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.RAPTURE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PAIN_SUPPRESSION.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 3 * 60,
      },
      {
        spell: SPELLS.DESPERATE_PRAYER.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90 - (combatant.hasTalent(TALENTS_PRIEST.ANGELS_MERCY_TALENT) ? 20 : 0),
      },
      {
        spell: [SPELLS.POWER_WORD_BARRIER_CAST.id, TALENTS_PRIEST.LUMINOUS_BARRIER_TALENT.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 3 * 60,
        gcd: {
          base: 1500,
        },
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
        spell: TALENTS_PRIEST.HOLY_NOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
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
        spell: SPELLS.FADE.id,
        category: combatant.hasTalent(TALENTS_PRIEST.TRANSLUCENT_IMAGE_TALENT)
          ? SPELL_CATEGORY.DEFENSIVE
          : SPELL_CATEGORY.UTILITY,
        cooldown: 30 - combatant.getTalentRank(TALENTS_PRIEST.IMPROVED_FADE_TALENT) * 5,
      },
      {
        spell: SPELLS.LEAP_OF_FAITH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS_PRIEST.MOVE_WITH_GRACE_TALENT) ? 60 : 90,
        enabled: combatant.hasTalent(TALENTS_PRIEST.LEAP_OF_FAITH_TALENT),
      },
      {
        spell: SPELLS.MIND_CONTROL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS_PRIEST.DOMINATE_MIND_TALENT) ? 120 : 0,
        enabled: combatant.hasTalent(TALENTS_PRIEST.MIND_CONTROL_TALENT),
      },
      {
        spell: SPELLS.MASS_DISPEL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DISPEL_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
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
        spell: SPELLS.SHACKLE_UNDEAD.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60 - (combatant.hasTalent(TALENTS_PRIEST.PSYCHIC_VOICE_TALENT) ? 30 : 0),
      },
      {
        spell: SPELLS.LEVITATE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 24,
      },
      {
        spell: SPELLS.MIND_SOOTHE.id,
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
      },
      {
        spell: TALENTS.SHADOW_WORD_DEATH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
