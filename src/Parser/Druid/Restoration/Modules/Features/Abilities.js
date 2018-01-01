import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() { // TODO: Migrate
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.TRANQUILITY_CAST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => combatant.hasTalent(SPELLS.INNER_PEACE_TALENT.id) ? 120 : 180,
        castEfficiency: {
          recommendedEfficiency: 0.75,
          averageIssueEfficiency: 0.55,
          majorIssueEfficiency: 0.30,
        },
      },
      {
        spell: SPELLS.INNERVATE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
      },
      {
        spell: SPELLS.ESSENCE_OF_GHANIR,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
      },
      {
        spell: SPELLS.IRONBARK,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (_, combatant) => {
          let cd = 90;
          if (combatant.hasTalent(SPELLS.STONEBARK_TALENT.id)) {
            cd -= 30;
          }
          if (combatant.hasHands(ITEMS.XONIS_CARESS.id)) {
            cd *= 0.80;
          }
          return cd;
        },
        castEfficiency: {
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.60,
        },
      },
      {
        spell: SPELLS.BARKSKIN,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.60,
        },
      },
      {
        spell: SPELLS.CENARION_WARD_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.CENARION_WARD_TALENT.id),
      },
      {
        spell: SPELLS.FLOURISH_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.FLOURISH_TALENT.id),
        castEfficiency: {
          recommendedEfficiency: 0.80,
        },
      },
      {
        spell: SPELLS.WILD_GROWTH,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.REJUVENATION,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.INCARNATION_TREE_OF_LIFE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id),
        cooldown: 180,
      },
      {
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isUndetectable: true,
      },
      {
        spell: SPELLS.HEALING_TOUCH,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.REGROWTH,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.SWIFTMEND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => combatant.hasTalent(SPELLS.PROSPERITY_TALENT.id) ? 27 : 30,
        importance: ISSUE_IMPORTANCE.MINOR,
      },
      {
        spell: SPELLS.RENEWAL_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
        cooldown: 90,
      },
    ];
  }
}

export default Abilities;
