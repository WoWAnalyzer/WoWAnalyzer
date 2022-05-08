import SPELLS from 'common/SPELLS';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SepulcherTierSet from '../shadowlands/SepulcherTierSet';

export default class GlobalCooldown extends CoreGlobalCooldown {
  priority = Number.NEGATIVE_INFINITY;

  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    sepulcher4pc: SepulcherTierSet,
  };

  sepulcher4pc!: SepulcherTierSet;

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (
      spellId !== SPELLS.JUDGMENT_CAST_PROTECTION.id ||
      !this.selectedCombatant.has4Piece() ||
      !this.sepulcher4pc.isPotential4pcProc(event)
    ) {
      return super.onCast(event);
    } else {
      this.sepulcher4pc.triggerInferredProc(event);
    }

    // do nothing
  }
}
