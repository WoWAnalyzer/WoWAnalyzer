import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';

const PANDEMIC_WINDOW = 0.3;

/**
 * See Enhancement Shaman's Hailstorm talent for an example of its usage.
 */
abstract class EarlyBuffRefreshes extends Analyzer {
  public spell: any = 0;
  public buff: any = 0;
  protected duration: number = 0;

  public casts: number = 0;
  protected earlyRefreshes: number = 0;
  protected lastEndTimestamp: number = 0;
  protected wastedTime: number = 0;

  protected constructor(options: any) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER), this.onRefreshBuff);
  }

  onCast(event: CastEvent) {
    if (event.ability.guid !== this.spell.id) {
      return;
    }

    this.casts += 1;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (event.ability.guid !== this.buff.id) {
      return;
    }

    this.lastEndTimestamp = event.timestamp + this.duration;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    if (event.ability.guid !== this.buff.id) {
      return;
    }

    const timeRemaining = this.lastEndTimestamp - event.timestamp;

    if (timeRemaining > this.pandemicWindow) {
      this.wastedTime += timeRemaining - this.pandemicWindow;
      this.earlyRefreshes += 1;
    }

    const extendedDuration = timeRemaining > this.pandemicWindow ? this.pandemicWindow : timeRemaining;

    this.lastEndTimestamp = event.timestamp + this.duration + extendedDuration;
  }

  get earlyRefreshPercentage() {
    return this.earlyRefreshes / this.casts;
  }

  get pandemicWindow() {
    return this.duration * PANDEMIC_WINDOW;
  }

  get pandemicWindowInSeconds() {
    return (this.pandemicWindow / 1000).toFixed(1);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(this.buff.id) / this.owner.fightDuration;
  }
}

export default EarlyBuffRefreshes;
