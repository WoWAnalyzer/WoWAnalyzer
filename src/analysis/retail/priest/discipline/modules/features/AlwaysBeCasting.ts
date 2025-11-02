import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { CastEvent } from 'parser/core/Events';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import { TALENTS_PRIEST } from 'common/TALENTS';

const debug = false;

/** The amount of time during which it's impossible a second Penance could have started */
const PENANCE_CHANNEL_TIME_BUFFER = 2500;

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  // counting damaging abilities here because of atonement mechanics
  HEALING_ABILITIES_ON_GCD = [
    SPELLS.POWER_WORD_SHIELD.id,
    SPELLS.POWER_WORD_RADIANCE.id,
    SPELLS.SHADOW_MEND.id,
    SPELLS.HALO_TALENT.id,
    TALENTS_PRIEST.DIVINE_STAR_SHARED_TALENT.id,
    SPELLS.MASS_DISPEL.id,
    TALENTS.DISPEL_MAGIC_TALENT.id,
    SPELLS.POWER_WORD_BARRIER_CAST.id,
    SPELLS.PURIFY.id,
    TALENTS_PRIEST.EVANGELISM_TALENT.id,
  ];

  lastPenanceStartTimestamp = 0;
  _lastCastFinishedTimestamp = 0;

  // TODO: Fix me
  recordCastTime(
    castStartTimestamp: number,
    globalCooldown: number,
    begincast: number,
    cast: CastEvent,
    spellId: number,
  ) {
    if (spellId === SPELLS.PENANCE.id || spellId === SPELLS.PENANCE_HEAL.id) {
      if (
        !this.lastPenanceStartTimestamp ||
        castStartTimestamp - this.lastPenanceStartTimestamp > PENANCE_CHANNEL_TIME_BUFFER
      ) {
        debug && console.log('%cABC: New penance channel started', 'color: orange');
        this.lastPenanceStartTimestamp = castStartTimestamp;
      } else {
        // This is a follow up from an existing Penance channel, it doesn't start its own GCD but the last cast is always after the initial GCD. This makes it so the last cast is still considered a valid cast.
        debug && console.log('%cABC: Follow up penance cast, ignoring time wasted', 'color: gray');
        this._lastCastFinishedTimestamp = Math.max(this._lastCastFinishedTimestamp, cast.timestamp);
        return; // by returning here we don't get an invalid time wasted added
      }
    }
  }
}

export default AlwaysBeCasting;
