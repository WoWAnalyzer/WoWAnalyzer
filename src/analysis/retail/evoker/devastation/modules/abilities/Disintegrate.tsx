import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

const { DISINTEGRATE } = SPELLS;

const { DRAGONRAGE_TALENT } = TALENTS_EVOKER;

const TICKS_PER_DISINTEGRATE = 4;

class Disintegrate extends Analyzer {
  totalCasts: number = 0;
  totalTicks: number = 0;
  dragonRageTicks: number = 0;
  dragonRageCasts: number = 0;
  inDragonRageWindow: boolean = false;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT),
      this.onToggleDragonRageWindow(true),
    );

    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT), () =>
      this.onToggleDragonRageWindow(false),
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DISINTEGRATE), () =>
      this.onDamage(),
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(DISINTEGRATE), this.onCast);
  }

  onToggleDragonRageWindow(value: boolean) {
    return () => (this.inDragonRageWindow = value);
  }

  onDamage() {
    this.totalTicks += 1;
    if (this.inDragonRageWindow) {
      this.dragonRageTicks += 1;
    }
  }

  onCast() {
    this.totalCasts += 1;
    if (this.inDragonRageWindow) {
      this.dragonRageCasts += 1;
    }
  }

  get tickData() {
    return {
      regularTicks: this.totalTicks - this.dragonRageTicks,
      totalPossibleRegularTicks: (this.totalCasts - this.dragonRageCasts) * TICKS_PER_DISINTEGRATE,
      dragonRageTicks: this.dragonRageTicks,
      totalPossibleDragonRageTicks: this.dragonRageCasts * TICKS_PER_DISINTEGRATE,
    };
  }
}

export default Disintegrate;
