import { formatMilliseconds } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';

class SpinningCraneKick extends Analyzer {
  goodSCKcount: number = 0;
  goodSCKTimeList: string[] = [];
  badSCKcount: number = 0;
  badSCKTimeList: string[] = [];
  canceledSCKcount: number = 0; //figure out if this is possible
  enemiesHitSCK: string[] = [];
  currentTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.castSpinningCraneKick,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.handleSpinningCraneKick,
    );
    this.addEventListener(Events.fightend, this.fightEnd);
  }

  castSpinningCraneKick(event: CastEvent) {
    if (this.enemiesHitSCK.length > 0) {
      //this nested is needed due to weird logs
      this.checkSCK();
    }
    this.currentTime = this.owner.currentTimestamp - this.owner.fight.start_time;
    this.enemiesHitSCK = [];
  }

  //tracking channel time isn't needed due to the fact it is the same as a gcd so they have to have another cast event
  handleSpinningCraneKick(event: DamageEvent) {
    const enemy = `${event.targetID} ${event.targetInstance || 0}`;
    if (!this.enemiesHitSCK.includes(enemy)) {
      this.enemiesHitSCK.push(enemy);
    }
  }

  fightEnd(event: FightEndEvent) {
    if (this.enemiesHitSCK) {
      this.checkSCK();
    }
  }

  checkSCK() {
    if (this.enemiesHitSCK.length > 2) {
      this.goodSCKcount += 1;
      this.goodSCKTimeList.push(formatMilliseconds(this.currentTime));
    } else {
      this.badSCKcount += 1;
      this.badSCKTimeList.push(formatMilliseconds(this.currentTime));
    }
  }
}

export default SpinningCraneKick;
