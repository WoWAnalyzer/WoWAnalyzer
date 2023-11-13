import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS/classic/engineering';

class Bombs extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    const combatant = this.selectedCombatant;
    const belt = combatant._getGearItemBySlotId(5);
    const boots = combatant._getGearItemBySlotId(8);
    const gloves = combatant._getGearItemBySlotId(9);
    const back = combatant._getGearItemBySlotId(14);
    this.active =
      belt.permanentEnchant === 3601 ||
      boots.permanentEnchant === 3606 ||
      gloves.permanentEnchant === 3604 ||
      back.permanentEnchant === 3605;

    if (this.active) {
      (options.abilities as Abilities).add({
        spell: SPELLS.GLOBAL_THERMAL_SAPPER_CHARGE.id,
        category: SPELL_CATEGORY.ITEMS,
        gcd: null,
      });
      (options.abilities as Abilities).add({
        spell: SPELLS.SARONITE_BOMB.id,
        category: SPELL_CATEGORY.ITEMS,
        gcd: null,
      });
      (options.abilities as Abilities).add({
        spell: SPELLS.COBALT_FRAG_BOMB.id,
        category: SPELL_CATEGORY.ITEMS,
        gcd: null,
      });
      (options.abilities as Abilities).add({
        spell: SPELLS.SUPER_SAPPER_CHARGE.id,
        category: SPELL_CATEGORY.ITEMS,
        gcd: null,
      });
      (options.abilities as Abilities).add({
        spell: SPELLS.GOBLIN_SAPPER_CHARGE.id,
        category: SPELL_CATEGORY.ITEMS,
        gcd: null,
      });
    }
  }
}

export default Bombs;
