import SPELLS from 'common/SPELLS';
import Combatant from 'parser/core/Combatant';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { TALENTS_DRUID } from 'common/TALENTS/druid';
import { hastedCooldown } from 'common/hastedCooldown';

export const druidGcd = (c: Combatant) => (c.hasBuff(SPELLS.CAT_FORM.id) ? 1000 : 1500);

/**
 * NON-ROTATIONAL abilities from base spell list and from class talent tree are here.
 *
 * Rotational abilities (even shared ones) are reserved to the spec specific Abilities list,
 * so that custom handling of category and order can be provided. The list of general abilities
 * that are omitted from this list:
 * Shred, Ferocious Bite, Rake, Thrash, Swipe, Mangle, Rejuvenation, Regrowth, Swiftmend,
 * Wild Growth, Wrath, Starfire, Starsurge, Moonfire, Sunfire
 */
class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // All-spec CC
      {
        spell: TALENTS_DRUID.MIGHTY_BASH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.MIGHTY_BASH_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.INCAPACITATING_ROAR.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.INCAPACITATING_ROAR_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CYCLONE.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.CYCLONE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HIBERNATE.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.HIBERNATE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TYPHOON.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.TYPHOON_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DRUID.MASS_ENTANGLEMENT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.MASS_ENTANGLEMENT_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
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
        spell: SPELLS.URSOLS_VORTEX.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.URSOLS_VORTEX_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOOTHE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10, // TODO only on successful dispel?
        gcd: {
          base: 1500,
        },
      },
      // All-spec Utility
      {
        spell: SPELLS.BARKSKIN.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60 - combatant.getTalentRank(TALENTS_DRUID.SURVIVAL_OF_THE_FITTEST_TALENT) * 9,
        gcd: null,
        isDefensive: true,
      },
      {
        spell: [
          TALENTS_DRUID.WILD_CHARGE_TALENT.id,
          SPELLS.WILD_CHARGE_MOONKIN.id,
          SPELLS.WILD_CHARGE_CAT.id,
          SPELLS.WILD_CHARGE_BEAR.id,
          SPELLS.WILD_CHARGE_TRAVEL.id,
        ],
        enabled: combatant.hasTalent(TALENTS_DRUID.WILD_CHARGE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: [
          SPELLS.STAMPEDING_ROAR_HUMANOID.id,
          SPELLS.STAMPEDING_ROAR_CAT.id,
          SPELLS.STAMPEDING_ROAR_BEAR.id,
        ],
        enabled: combatant.hasTalent(TALENTS_DRUID.STAMPEDING_ROAR_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120 - combatant.getTalentRank(TALENTS_DRUID.IMPROVED_STAMPEDING_ROAR_TALENT) * 60,
        gcd: {
          base: druidGcd,
        },
      },
      {
        spell: TALENTS_DRUID.RENEWAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.RENEWAL_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        gcd: null,
        isDefensive: true,
      },
      {
        spell: [
          // TODO with affinities gone, we need to check these IDs
          SPELLS.HEART_OF_THE_WILD_BALANCE_AFFINITY.id,
          SPELLS.HEART_OF_THE_WILD_FERAL_AFFINITY.id,
          SPELLS.HEART_OF_THE_WILD_GUARDIAN_AFFINITY.id,
          SPELLS.HEART_OF_THE_WILD_RESTO_AFFINITY.id,
        ],
        enabled: combatant.hasTalent(TALENTS_DRUID.HEART_OF_THE_WILD_TALENT.id),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 300,
        gcd: {
          base: druidGcd,
        },
      },
      {
        spell: TALENTS_DRUID.NATURES_VIGIL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.NATURES_VIGIL_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: null, // TODO double check this
      },
      {
        spell: SPELLS.INNERVATE.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.INNERVATE_TALENT.id),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: null,
        castEfficiency: {
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.3,
        },
      },
      {
        spell: SPELLS.REMOVE_CORRUPTION.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.REMOVE_CORRUPTION_TALENT),
        // TODO impl CD starting on successful dispel only
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
      // Cat/Bear stuff
      {
        spell: SPELLS.FRENZIED_REGENERATION.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.FRENZIED_REGENERATION_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: hastedCooldown(36),
        gcd: {
          base: 1500,
        },
        charges: 1 + combatant.getTalentRank(TALENTS_DRUID.INNATE_RESOLVE_TALENT),
        isDefensive: true,
      },
      {
        spell: SPELLS.IRONFUR.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.IRONFUR_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        isDefensive: true,
      },
      {
        spell: SPELLS.GROWL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: SPELLS.MAIM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: [SPELLS.SKULL_BASH.id, SPELLS.SKULL_BASH_FERAL.id],
        enabled: combatant.hasTalent(TALENTS_DRUID.SKULL_BASH_TALENT),
        category: SPELL_CATEGORY.UTILITY,
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
        category: SPELL_CATEGORY.OTHERS,
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
        enabled: combatant.hasTalent(TALENTS_DRUID.MOONKIN_FORM_BALANCE_TALENT.id),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
