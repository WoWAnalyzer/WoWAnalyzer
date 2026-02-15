import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateMaxCasts } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';

import { DISPERSION_BASE_CD, DISPERSION_UPTIME_MS } from '../../constants';

class Disperion extends Analyzer {
  _previousDispersionCast: ApplyBuffEvent | null = null;
  dispersionUptime = 0;
  maxDispersionTime = 0;
  dispersedTime = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DISPERSION),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DISPERSION),
      this.onBuffRemoved,
    );
  }

  //TODO: Check if this still works since its been changed from Any
  _dispersions: Record<string, { start: number; end?: number }> = {};

  get dispersions() {
    return Object.keys(this._dispersions).map((key) => this._dispersions[key]);
  }

  get suggestionThresholds() {
    this.dispersionUptime = this.selectedCombatant.getBuffUptime(SPELLS.DISPERSION.id);
    this.maxDispersionTime =
      Math.floor(calculateMaxCasts(DISPERSION_BASE_CD, this.owner.fightDuration)) *
      DISPERSION_UPTIME_MS;
    this.dispersedTime = this.dispersionUptime / this.maxDispersionTime;
    return {
      actual: this.dispersedTime,
      isGreaterThan: {
        minor: 0.5,
        average: 0.65,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this._dispersions[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousDispersionCast = event;
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    if (this._previousDispersionCast != null) {
      this._dispersions[this._previousDispersionCast.timestamp] = {
        ...this._dispersions[this._previousDispersionCast.timestamp],
        end: event.timestamp,
      };

      this._previousDispersionCast = null;
    }
  }
}

export default Disperion;
