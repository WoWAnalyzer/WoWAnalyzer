import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Dark Transformation empowers the Risen Ghoul for 30 seconds once 5 Shadow
 * Infusion stacks are consumed. Maximize uptime by casting it on cooldown
 * whenever 5 stacks are available.
 */
class DarkTransformationUptime extends Analyzer {
  private _uptimeMs = 0;
  private _startTimestamp: number | null = null;
  castCount = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DARK_TRANSFORMATION),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DARK_TRANSFORMATION),
      this.onRemove,
    );
  }

  onApply(event: ApplyBuffEvent) {
    this._startTimestamp = event.timestamp;
    this.castCount += 1;
  }

  onRemove(event: RemoveBuffEvent) {
    if (this._startTimestamp !== null) {
      this._uptimeMs += event.timestamp - this._startTimestamp;
      this._startTimestamp = null;
    }
  }

  get uptimePercent() {
    // If still active at fight end, count up to the end.
    const total =
      this._uptimeMs +
      (this._startTimestamp !== null ? this.owner.currentTimestamp - this._startTimestamp : 0);
    return total / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.4,
        average: 0.3,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(3)} size="flexible">
        <BoringSpellValueText spell={SPELLS.DARK_TRANSFORMATION}>
          <div>
            <UptimeIcon /> {formatPercentage(this.uptimePercent)}% <small>uptime</small>
          </div>
          <div>
            {this.castCount} <small>cast{this.castCount !== 1 ? 's' : ''}</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DarkTransformationUptime;
