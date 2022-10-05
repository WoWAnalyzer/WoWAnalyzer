import TALENTS from 'common/TALENTS/evoker';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: TALENTS.PYRE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.PYRE_TALENT.id),
      },
      {
        spell: TALENTS.FIRESTORM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.FIRESTORM_TALENT.id),
      },
      {
        spell: TALENTS.ETERNITY_SURGE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.ETERNITY_SURGE_TALENT.id),
      },
      {
        spell: TALENTS.DRAGONRAGE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.DRAGONRAGE_TALENT.id),
      },
      {
        spell: TALENTS.SHATTERING_STAR_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SHATTERING_STAR_TALENT.id),
      },
    ];
  }
}

export default Abilities;
