import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';

/**
 * A Demonic Core Demonbolt logs a `begincast` at the same timestamp as its `cast`.
 * A hard cast logs the `begincast` seconds earlier. Anything above this gap is a hard cast.
 */
const HARDCAST_MIN_DURATION_MS = 1000;

/** Counts Demonbolts that were hard cast instead of made instant by Demonic Core. */
class DemonboltHardcasts extends Analyzer {
  casts = 0;
  hardcasts = 0;
  private lastBeginCast: number | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT),
      this.onBeginCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT), this.onCast);
  }

  onBeginCast(event: BeginCastEvent) {
    this.lastBeginCast = event.timestamp;
  }

  onCast(event: CastEvent) {
    this.casts += 1;
    if (
      this.lastBeginCast !== null &&
      event.timestamp - this.lastBeginCast >= HARDCAST_MIN_DURATION_MS
    ) {
      this.hardcasts += 1;
    }
    this.lastBeginCast = null;
  }

  get hardcastsPerMinute() {
    return this.hardcasts / (this.owner.fightDuration / 60000);
  }
}

export default DemonboltHardcasts;
