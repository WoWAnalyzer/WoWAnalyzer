import SPELLS from 'common/SPELLS';
import { CastEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

const PENANCE_MINIMUM_RECAST_TIME = 3500; // Minimum duration from one Penance to Another

class SpellUsable extends CoreSpellUsable {
  _previousPenanceTimestamp: number = 0;

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PENANCE.id && spellId !== SPELLS.PENANCE_HEAL.id) {
      super.onCast(event);
      return;
    }

    if (this.isNewPenanceCast(event.timestamp)) {
      this._previousPenanceTimestamp = event.timestamp;
      this.beginCooldown(event, SPELLS.PENANCE.id);
    }
  }

  isNewPenanceCast(timestamp: number) {
    return (
      !this._previousPenanceTimestamp ||
      timestamp - this._previousPenanceTimestamp > PENANCE_MINIMUM_RECAST_TIME
    );
  }
}

export default SpellUsable;
