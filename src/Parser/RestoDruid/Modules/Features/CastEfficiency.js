import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.TRANQUILITY_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => combatant.hasTalent(SPELLS.INNER_PEACE_TALENT.id) ? 120 : 180,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.TRANQUILITY_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
      recommendedCastEfficiency: 0.75,
      avgIssueCastEfficiency: 0.55,
      majorIssueCastEfficiency: 0.30,
    },
    {
      spell: SPELLS.INNERVATE,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
    },
    {
      spell: SPELLS.ESSENCE_OF_GHANIR,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
    },
    {
      spell: SPELLS.IRONBARK,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (_, combatant) => {
        let cd = 90;
        if(combatant.hasTalent(SPELLS.STONEBARK_TALENT.id)) {
          cd -= 30;
        }
        if(combatant.hasHands(ITEMS.XONIS_CARESS.id)) {
          cd *= 0.80;
        }
        return cd;
      },
      importance: ISSUE_IMPORTANCE.MINOR,
      recommendedCastEfficiency: 0.60,
    },
    {
      spell: SPELLS.BARKSKIN,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      importance: ISSUE_IMPORTANCE.MINOR,
      recommendedCastEfficiency: 0.60,
    },
    {
      spell: SPELLS.CENARION_WARD_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.CENARION_WARD_TALENT.id),
    },
    {
      spell: SPELLS.FLOURISH_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.FLOURISH_TALENT.id),
      recommendedCastEfficiency: 0.80,
    },
    {
      spell: SPELLS.WILD_GROWTH,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.REJUVENATION,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.INCARNATION_TREE_OF_LIFE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      isActive: combatant => combatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id),
      getCooldown: haste => 180,
    },
    {
      spell: SPELLS.ARCANE_TORRENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.HEALING_TOUCH,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.REGROWTH,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.SWIFTMEND,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => combatant.hasTalent(SPELLS.PROSPERITY_TALENT.id) ? 27 : 30,
      importance: ISSUE_IMPORTANCE.MINOR,
    },
    {
      spell: SPELLS.RENEWAL,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      isActive: combatant => combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
      getCooldown: haste => 90,
    },
  ];
}

export default CastEfficiency;
