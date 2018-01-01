import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    {
      spell: SPELLS.TRANQUILITY_CAST,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => combatant.hasTalent(SPELLS.INNER_PEACE_TALENT.id) ? 120 : 180,
      recommendedEfficiency: 0.75,
      averageIssueEfficiency: 0.55,
      majorIssueEfficiency: 0.30,
    },
    {
      spell: SPELLS.INNERVATE,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
    },
    {
      spell: SPELLS.ESSENCE_OF_GHANIR,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
    },
    {
      spell: SPELLS.IRONBARK,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
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
      recommendedEfficiency: 0.60,
    },
    {
      spell: SPELLS.BARKSKIN,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      importance: ISSUE_IMPORTANCE.MINOR,
      recommendedEfficiency: 0.60,
    },
    {
      spell: SPELLS.CENARION_WARD_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.CENARION_WARD_TALENT.id),
    },
    {
      spell: SPELLS.FLOURISH_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.FLOURISH_TALENT.id),
      recommendedEfficiency: 0.80,
    },
    {
      spell: SPELLS.WILD_GROWTH,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.REJUVENATION,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.INCARNATION_TREE_OF_LIFE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      isActive: combatant => combatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id),
      getCooldown: haste => 180,
    },
    {
      spell: SPELLS.ARCANE_TORRENT_MANA,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isUndetectable: true,
    },
    {
      spell: SPELLS.HEALING_TOUCH,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.REGROWTH,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.SWIFTMEND,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => combatant.hasTalent(SPELLS.PROSPERITY_TALENT.id) ? 27 : 30,
      importance: ISSUE_IMPORTANCE.MINOR,
    },
    {
      spell: SPELLS.RENEWAL_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      isActive: combatant => combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
      getCooldown: haste => 90,
    },
  ];
}

export default Abilities;
