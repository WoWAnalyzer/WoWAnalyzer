import { formatDurationMinSec } from 'common/format';
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
const ICD = 3000;

/**
 * Anvil & Stave reduces Brew CDs by 0.5/1.0s every time you dodge / an enemy misses, with a 3s ICD.
 *
 * There is (thankfully) no RNG involved in this, so it is easy to support.
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

    if (!this.lastTriggerTimestamp || event.timestamp - this.lastTriggerTimestamp >= ICD) {
      this.triggerCount += 1;
      this.totalCdr += this.sharedBrews.reduceCooldown(CDR_RATE * this.rank);
      this.lastTriggerTimestamp = event.timestamp;
    }
  }

  statistic(): ReactNode {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringValue
          label={
            <>
              <SpellLink id={talents.ANVIL__STAVE_TALENT} /> Cooldown Reduction
            </>
          }
        >
          {formatDurationMinSec(this.totalCdr / 1000)}
        </BoringValue>
      </Statistic>
    );
  }
}
