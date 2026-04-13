import Abilities from 'parser/core/modules/Abilities';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS/classic/engineering';

export default class FlexweaveUnderlay extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);

    const cloak = this.selectedCombatant.getGear('BACK');
    this.active = cloak?.onUseEnchant === SPELLS.FLEXWEAVE_UNDERLAY.enchantId;

    if (this.active) {
      this.deps.abilities.add({
        spell: SPELLS.FLEXWEAVE_UNDERLAY.id,
        category: SPELL_CATEGORY.ITEMS,
        cooldown: 60,
        gcd: null,
      });
    }
  }
}
