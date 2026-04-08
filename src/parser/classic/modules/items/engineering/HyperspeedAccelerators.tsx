import Abilities from 'parser/core/modules/Abilities';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS/classic/engineering';

export default class HyperspeedAccelerators extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  constructor(options: Options) {
    super(options);

    const gloves = this.selectedCombatant.getGear('HANDS');
    this.active = gloves?.onUseEnchant === SPELLS.HYPERSPEED_ACCELERATION.enchantId;

    if (this.active) {
      this.deps.abilities.add({
        spell: SPELLS.HYPERSPEED_ACCELERATION.id,
        category: SPELL_CATEGORY.ITEMS,
        cooldown: 60,
        gcd: null,
      });
    }
  }
}
