import SPELLS from 'common/SPELLS/classic';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';

export default class Jab extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);

    const isDW = (this.selectedCombatant._getGearItemBySlotId(GEAR_SLOTS.OFFHAND)?.id ?? 0) > 0;
    console.log(this.selectedCombatant._gearItemsBySlotId, isDW);

    if (isDW) {
      this.deps.abilities.add({
        category: SPELL_CATEGORY.ROTATIONAL,
        spell: SPELLS.JAB_1H.id,
        name: SPELLS.JAB_1H.name,
        gcd: {
          static: 1000,
        },
      });
    } else {
      this.deps.abilities.add({
        category: SPELL_CATEGORY.ROTATIONAL,
        spell: SPELLS.JAB_2H.id,
        name: SPELLS.JAB_2H.name,
        gcd: {
          static: 1000,
        },
      });
    }
  }
}
