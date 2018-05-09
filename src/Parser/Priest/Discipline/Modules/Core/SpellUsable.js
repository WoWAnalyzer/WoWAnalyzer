import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';

const PENANCE_MINIMUM_RECAST_TIME = 3500; // Minimum duration from one Penance to Another

class SpellUsable extends CoreSpellUsable {
  _previousPenanceTimestamp;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PENANCE.id && spellId !== SPELLS.PENANCE_HEAL.id) {
      super.on_byPlayer_cast(event);
      return;
    }

    if (this.isNewPenanceCast(event.timestamp)) {
      this._previousPenanceTimestamp = event.timestamp;
      this.beginCooldown(SPELLS.PENANCE.id, event.timestamp);
    }
  }

  isNewPenanceCast(timestamp) {
    return (
      !this._previousPenanceTimestamp ||
      timestamp - this._previousPenanceTimestamp > PENANCE_MINIMUM_RECAST_TIME
    );
  }
}

export default SpellUsable;
