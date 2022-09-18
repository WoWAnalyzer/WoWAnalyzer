import CoreAbilities from 'analysis/retail/druid/shared/core/Abilities';
import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../constants';
import { TALENTS_DRUID } from 'common/TALENTS';

class Abilities extends CoreAbilities {
  constructor(...args: ConstructorParameters<typeof CoreAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;
  }

  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.TRANQUILITY_CAST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_DRUID.INNER_PEACE_RESTORATION_TALENT.id) ? 120 : 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
          averageIssueEfficiency: 0.55,
          majorIssueEfficiency: 0.3,
        },
        healSpellIds: [SPELLS.TRANQUILITY_HEAL.id],
      },
      {
        spell: SPELLS.NATURES_SWIFTNESS.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60, //TODO include conduit reduction
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.INNERVATE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.IRONBARK.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.BARKSKIN.id,
        buffSpellId: SPELLS.BARKSKIN.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: TALENTS_DRUID.CENARION_WARD_RESTORATION_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DRUID.CENARION_WARD_RESTORATION_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        healSpellIds: [SPELLS.CENARION_WARD_HEAL.id],
      },
      {
        spell: TALENTS_DRUID.FLOURISH_RESTORATION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DRUID.FLOURISH_RESTORATION_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
          averageIssueEfficiency: 0.55,
          majorIssueEfficiency: 0.3,
        },
      },
      {
        spell: SPELLS.WILD_GROWTH.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EFFLORESCENCE_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.EFFLORESCENCE_HEAL.id, SPELLS.SPRING_BLOSSOMS.id],
      },
      {
        spell: SPELLS.REJUVENATION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.REJUVENATION_GERMINATION.id, SPELLS.CULTIVATION.id],
      },
      {
        spell: TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_RESTORATION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_RESTORATION_TALENT.id),
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.4,
        },
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
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.4,
          averageIssueEfficiency: 0.1,
          importance: ISSUE_IMPORTANCE.REGULAR,
        },
      },
      {
        spell: TALENTS_DRUID.RENEWAL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_DRUID.RENEWAL_TALENT.id),
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.LIFEBLOOM_HOT_HEAL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: !combatant.hasTalent(TALENTS_DRUID.UNDERGROWTH_RESTORATION_TALENT.id),
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.LIFEBLOOM_BLOOM_HEAL.id],
      },
      {
        spell: SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS_DRUID.UNDERGROWTH_RESTORATION_TALENT.id),
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.LIFEBLOOM_BLOOM_HEAL.id],
      },
      {
        spell: SPELLS.NATURES_CURE.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REBIRTH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOOTHE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GROWL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
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
        category: SPELL_CATEGORY.OTHERS,
        cooldown: (haste: number) => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHRED.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          static: 1000,
        },
      },
      //Forms
      {
        spell: SPELLS.STAG_FORM.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRAVEL_FORM.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BEAR_FORM.id,
        buffSpellId: SPELLS.BEAR_FORM.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CAT_FORM.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MOONKIN_FORM.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.MOONKIN_FORM_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      // 'Off-Spec' abilites
      {
        spell: SPELLS.THRASH_BEAR.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.THRASH_TALENT.id),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.THRASH_FERAL.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.THRASH_TALENT.id),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.FRENZIED_REGENERATION_TALENT.id),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.IRONFUR.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.IRONFUR_TALENT.id),
        cooldown: 0.5,
      },
      {
        spell: SPELLS.SWIPE_CAT.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.SWIPE_TALENT.id),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SWIPE_BEAR.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.SWIPE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RIP.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.RIP_TALENT.id),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.FEROCIOUS_BITE.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.RAKE.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.RAKE_TALENT.id),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.STARSURGE_AFFINITY.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.STARSURGE_TALENT.id),
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STARFIRE_AFFINITY.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.STARFIRE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },

      //Movement
      {
        spell: SPELLS.WILD_CHARGE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.WILD_CHARGE_BEAR.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.WILD_CHARGE_CAT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.WILD_CHARGE_MOONKIN.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.DASH.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: !combatant.hasTalent(TALENTS_DRUID.TIGER_DASH_TALENT.id),
        cooldown: 120,
        gcd: {
          static: combatant.hasBuff(SPELLS.CAT_FORM.id) ? 0 : 1500,
        },
      },
      {
        spell: TALENTS_DRUID.TIGER_DASH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.TIGER_DASH_TALENT.id),
        cooldown: 45,
        gcd: {
          static: combatant.hasBuff(SPELLS.CAT_FORM.id) ? 0 : 1500,
        },
      },

      //CC
      {
        spell: SPELLS.HIBERNATE.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.HIBERNATE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TYPHOON.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.TYPHOON_TALENT.id),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DRUID.MIGHTY_BASH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.MIGHTY_BASH_TALENT.id),
        cooldown: 50,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.URSOLS_VORTEX.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ENTANGLING_ROOTS.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DRUID.MASS_ENTANGLEMENT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DRUID.MASS_ENTANGLEMENT_TALENT.id),
      },
      {
        spell: TALENTS_DRUID.OVERGROWTH_RESTORATION_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DRUID.OVERGROWTH_RESTORATION_TALENT.id),
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;
