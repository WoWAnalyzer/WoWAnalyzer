import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, FightEndEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';

class SoothingMist extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  soomTicks = 0;
  gustsHealing = 0;
  startStamp = 0;
  endStamp = 0;
  soomInProgress = false;
  castsInSoom = 0;
  badSooms = 0;
  totalSoomCasts = 0;
  assumedGCD = 0;
  startGCD = 0;
  protected statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);
    this.assumedGCD = 1500 * 0.95;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SOOTHING_MIST_TALENT),
      this.castSoothingMist,
    );
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS_MONK.SHEILUNS_GIFT_TALENT,
          SPELLS.VIVIFY,
          TALENTS_MONK.ENVELOPING_MIST_TALENT,
        ]),
      this.castDuringSoothingMist,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.SOOTHING_MIST_TALENT),
      this.handleSoothingMist,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.SOOTHING_MIST_TALENT),
      this.removeBuffSoothingMist,
    );
    this.addEventListener(Events.fightend, this.end);
  }

  get soomTicksPerDuration() {
    const soomTicks = ((this.soomTicks * 2) / this.owner.fightDuration) * 1000 || 0;
    return soomTicks >= 1.5;
  }

  get soomThresholds() {
    return (this.totalSoomCasts - this.badSooms) / this.totalSoomCasts;
  }

  handleSoothingMist(event: HealEvent) {
    this.soomTicks += 1;
  }

  castDuringSoothingMist(event: CastEvent) {
    if (this.soomInProgress) {
      this.castsInSoom += 1;
    }
  }

  castSoothingMist(event: CastEvent) {
    if (this.soomInProgress) {
      this.endStamp = event.timestamp;
      this.checkChannelTiming();
      this.castsInSoom = 0;
    }

    this.startStamp = event.timestamp;
    this.soomInProgress = true;
    const gcd = 1000 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
    this.startGCD = Math.max(750, gcd) * 0.95;
  }

  removeBuffSoothingMist(event: RemoveBuffEvent) {
    if (!this.soomInProgress) {
      return;
    }

    this.endStamp = event.timestamp;
    this.soomInProgress = false;
    this.checkChannelTiming();
    this.castsInSoom = 0;
  }

  checkChannelTiming() {
    this.totalSoomCasts += 1;
    let duration = this.endStamp - this.startStamp;

    if (duration < this.startGCD) {
      return;
    }

    duration -= this.startGCD;

    this.castsInSoom -= duration / this.assumedGCD;
    if (
      this.castsInSoom < 0 &&
      !this.selectedCombatant.hasTalent(TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT)
    ) {
      this.badSooms += 1;
    }
  }

  end(event: FightEndEvent) {
    if (this.soomInProgress) {
      this.endStamp = this.owner.fightDuration;
      this.checkChannelTiming();
    }
  }
}

export default SoothingMist;
