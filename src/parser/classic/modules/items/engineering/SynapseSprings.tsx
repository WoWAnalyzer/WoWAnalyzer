import SPELLS from 'common/SPELLS/classic';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';

const SYNAPSE_SPRINGS_ENCHANT_ID = 4179;

export default class SynapseSprings extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);

    const gloves = this.selectedCombatant._getGearItemBySlotId(GEAR_SLOTS.HANDS);
    this.active = gloves.onUseEnchant === SYNAPSE_SPRINGS_ENCHANT_ID;

    if (this.active) {
      this.deps.abilities.add({
        spell: SPELLS.SYNAPSE_SPRINGS.id,
        category: SPELL_CATEGORY.ITEMS,
        cooldown: 60,
        gcd: null,
      });
    }
  }
}
