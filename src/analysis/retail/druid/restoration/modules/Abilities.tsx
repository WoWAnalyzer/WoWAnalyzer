import CoreAbilities from 'analysis/retail/druid/shared/core/Abilities';
import SPELLS from 'common/SPELLS';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../constants';
import { TALENTS_DRUID } from 'common/TALENTS';
import { hastedCooldown, normalGcd } from 'common/abilitiesConstants';

// TODO TWW - CONTROL OF THE DREAM LMAO
class Abilities extends CoreAbilities {
  constructor(...args: ConstructorParameters<typeof CoreAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;
  }

  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational
      {
        spell: TALENTS_DRUID.CENARION_WARD_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.CENARION_WARD_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.3,
        },
        healSpellIds: [SPELLS.CENARION_WARD_HEAL.id],
      },
      {
        spell: SPELLS.WILD_GROWTH.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.WILD_GROWTH_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EFFLORESCENCE_CAST.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.EFFLORESCENCE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.EFFLORESCENCE_HEAL.id, SPELLS.SPRING_BLOSSOMS.id],
      },
      {
        spell: [SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.REJUVENATION_GERMINATION.id, SPELLS.CULTIVATION.id],
      },
      {
        spell: SPELLS.REGROWTH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SWIFTMEND.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        charges: combatant.hasTalent(TALENTS_DRUID.PROSPERITY_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        castEfficiency:
          combatant.hasTalent(TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT) ||
          combatant.hasTalent(TALENTS_DRUID.VERDANT_INFUSION_TALENT) ||
          combatant.hasTalent(TALENTS_DRUID.REFORESTATION_TALENT)
            ? {
                recommendedEfficiency: 0.8,
                averageIssueEfficiency: 0.6,
                majorIssueEfficiency: 0.3,
              }
            : undefined,
      },
      {
        spell: SPELLS.LIFEBLOOM_HOT_HEAL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: !combatant.hasTalent(TALENTS_DRUID.UNDERGROWTH_TALENT),
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.LIFEBLOOM_BLOOM_HEAL.id],
      },
      {
        spell: SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS_DRUID.UNDERGROWTH_TALENT),
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.LIFEBLOOM_BLOOM_HEAL.id],
      },
      {
        spell: SPELLS.ADAPTIVE_SWARM.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.ADAPTIVE_SWARM_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DRUID.NOURISH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.NOURISH_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DRUID.GROVE_GUARDIANS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.GROVE_GUARDIANS_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null, // odd that it's off GCD, but it is
        cooldown: 20 - combatant.getTalentRank(TALENTS_DRUID.EARLY_SPRING_TALENT) * 3,
        charges: 3,
        castEfficiency: {
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.3,
        },
      },
      // Cooldowns
      {
        spell: SPELLS.TRANQUILITY_CAST.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.TRANQUILITY_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_DRUID.INNER_PEACE_TALENT) ? 150 : 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          recommendedEfficiency: 0.7,
          averageIssueEfficiency: 0.5,
          majorIssueEfficiency: 0.2,
        },
        healSpellIds: [SPELLS.TRANQUILITY_HEAL.id],
      },
      {
        spell: SPELLS.NATURES_SWIFTNESS.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.NATURES_SWIFTNESS_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60 - combatant.getTalentRank(TALENTS_DRUID.PASSING_SEASONS_TALENT) * 12,
        gcd: null,
      },
      {
        spell: TALENTS_DRUID.OVERGROWTH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.OVERGROWTH_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DRUID.INVIGORATE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.INVIGORATE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.IRONBARK.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.IRONBARK_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90 - combatant.getTalentRank(TALENTS_DRUID.IMPROVED_IRONBARK_TALENT) * 20,
        gcd: null,
      },
      {
        spell: TALENTS_DRUID.FLOURISH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.FLOURISH_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.3,
        },
      },
      {
        spell: TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.3,
        },
      },
      {
        spell: SPELLS.CONVOKE_SPIRITS.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT) ? 60 : 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.3,
        },
      },
      // Utility
      {
        spell: SPELLS.NATURES_CURE.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
        // TODO CD only triggers when dispel happens
      },
      //Damage Dealing
      {
        spell: SPELLS.WRATH.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MOONFIRE_CAST.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SUNFIRE_CAST.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MANGLE_BEAR.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: hastedCooldown(6),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHRED.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          static: 1000,
        },
      },
      // 'Off-Spec' abilites
      {
        spell: SPELLS.THRASH_BEAR.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        enabled: combatant.hasTalent(TALENTS_DRUID.THRASH_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.THRASH_FERAL.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        enabled: combatant.hasTalent(TALENTS_DRUID.THRASH_TALENT),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SWIPE_CAT.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SWIPE_BEAR.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RIP.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        enabled: combatant.hasTalent(TALENTS_DRUID.RIP_TALENT),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.FEROCIOUS_BITE.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.RAKE.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        enabled: combatant.hasTalent(TALENTS_DRUID.RAKE_TALENT),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.STARSURGE_AFFINITY.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        enabled: combatant.hasTalent(TALENTS_DRUID.STARSURGE_SHARED_TALENT),
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STARFIRE_AFFINITY.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        enabled: combatant.hasTalent(TALENTS_DRUID.STARFIRE_SHARED_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.FRENZIED_REGENERATION_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: hastedCooldown(36),
        gcd: normalGcd,
        isDefensive: true,
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;
