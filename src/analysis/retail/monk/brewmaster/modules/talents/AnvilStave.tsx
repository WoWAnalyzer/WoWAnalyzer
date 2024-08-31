import { formatDuration, formatDurationMinSec, formatPercentage } from 'common/format';
import talents from 'common/TALENTS/monk';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';
import SharedBrews from '../core/SharedBrews';

// 500ms per rank
const CDR_RATE = 500;
const RECHARGE_DURATION = 3000;

/**
 * Anvil & Stave reduces Brew CDs by 0.5/1.0s every time you dodge / an enemy misses, with some extra steps.
 *
 * Prior to TWW, this operated on a 3s ICD. Now, we don't really know how it works but the lowest CDR model I've found that still works is treating it kind of like you have a "CDR pool" that regenerates over time, maxing out at 0.5/1.0s after 3s of no dodging.
 */
export default class AnvilStave extends Analyzer {
  static dependencies = {
    sharedBrews: SharedBrews,
  };

  protected sharedBrews!: SharedBrews;

  private rank: number;
  private totalCdr = 0;
  private lastTriggerTimestamp?: number;
  private triggerCount = 0;

  get cdr() {
    return this.totalCdr;
  }

  get count() {
    return this.triggerCount;
  }

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.getTalentRank(talents.ANVIL__STAVE_TALENT);
    this.active = this.rank > 0;

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamage);
  }

  private onDamage(event: DamageEvent) {
    if (event.hitType !== HIT_TYPES.MISS && event.hitType !== HIT_TYPES.DODGE) {
      return;
    }

    const chargeRatio = this.lastTriggerTimestamp
      ? Math.min(1.0, (event.timestamp - this.lastTriggerTimestamp) / RECHARGE_DURATION)
      : 1.0;

    const cdrAmount = chargeRatio * this.rank * CDR_RATE;
    this.triggerCount += 1;
    const actualCdr = this.sharedBrews.reduceCooldown(cdrAmount);
    this.totalCdr += actualCdr;
    this.addDebugAnnotation(event, {
      color: 'lightgrey',
      summary: `A&S reduced cooldown (raw: ${cdrAmount.toFixed(1)}, actual: ${cdrAmount.toFixed(1)})`,
      details: (
        <dl>
          <dt>Last Trigger:</dt>
          <dd>
            {this.lastTriggerTimestamp
              ? `${formatDuration(this.lastTriggerTimestamp - this.owner.fight.start_time)} (${formatDurationMinSec((event.timestamp - this.lastTriggerTimestamp) / 1000)} ago)`
              : 'never'}
          </dd>
          <dt>Charge %:</dt>
          <dd>{formatPercentage(chargeRatio)}%</dd>
          <dt>Max CDR (ms)</dt>
          <dd>{this.rank * CDR_RATE}</dd>
          <dt>Raw CDR (ms)</dt>
          <dd>{cdrAmount.toFixed(2)}</dd>
          <dt>Actual CDR (ms)</dt>
          <dd>{actualCdr.toFixed(2)}</dd>
        </dl>
      ),
    });
    this.lastTriggerTimestamp = event.timestamp;
  }

  statistic(): ReactNode {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringValue
          label={
            <>
              <SpellLink spell={talents.ANVIL__STAVE_TALENT} /> Cooldown Reduction
            </>
          }
        >
          {formatDurationMinSec(this.totalCdr / 1000)}
        </BoringValue>
      </Statistic>
    );
  }
}
