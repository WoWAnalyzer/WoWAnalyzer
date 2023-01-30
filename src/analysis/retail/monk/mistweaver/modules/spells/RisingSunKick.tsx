import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class RisingSunKick extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  lastBOK: number = Number.MIN_SAFE_INTEGER;
  lastRSK: number = Number.MIN_SAFE_INTEGER;
  rskResets: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RISING_SUN_KICK_TALENT),
      this.risingSunKickCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK),
      this.blackoutKickCast,
    );
  }

  risingSunKickCast(event: CastEvent) {
    // we are fine. Regular cast
    if (!this.spellUsable.isOnCooldown(TALENTS_MONK.RISING_SUN_KICK_TALENT.id)) {
      this.lastRSK = event.timestamp;
      return;
    }

    if (this.lastBOK > this.lastRSK) {
      this.rskResets += 1;
    }

    this.lastRSK = event.timestamp;
  }

  blackoutKickCast(event: CastEvent) {
    this.lastBOK = event.timestamp;
  }

  subStatistic() {
    return (
      <>
        {this.rskResets} <small>resets</small>
      </>
    );
  }
}

export default RisingSunKick;
