import { formatDurationMinSec } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { ReactNode } from 'react';
import SharedBrews from '../core/SharedBrews';
import spells from '../../spell-list_Monk_Brewmaster.retail';
import { encodeEventSourceString } from 'parser/shared/modules/Enemies';

// 500ms per rank
const CDR_RATE = 500;
const RECENT_DURATION = 5000;
const MAX_ATTACKERS = 5;

/**
 * The rate of CDR applied based on the number of recent attackers. This is multiplied by the
 * CDR from the talent itself.
 */
const CDR_FACTOR: number[] = [];
for (let i = 0; i < MAX_ATTACKERS; i++) {
  // formula for `n` attackers is (\sum_{i = 0}^{n-1} 2^{-i}) / n
  // a very literal translation of the tooltip, surprisingly
  CDR_FACTOR[i] =
    Array.from({ length: i + 1 })
      .map((_, i) => Math.pow(2, -i))
      .reduce((a, b) => a + b, 0) /
    (i + 1);
}

const DEBUG = false;

/**
 * Anvil & Stave reduces Brew CDs by 0.5/1.0s every time you dodge / an enemy misses, with some extra steps.
 *
 * In Midnight, the tooltip states "reduced by 50% for every recent attacker, up to 5." Testing indicates that:
 *
 * - "recent attacker" means "attacker that triggered A&S within the past 5s"
 * - CDR is static for each attacker: if you are being hit by 2 enemies that have triggered A&S recently, both enemies give the same amount of CDR on each trigger.
 *
 * The upshot of this is that this scales *very well* with added targets. The theoretical model with no cap on attackers would reach 2x
 * the single-target rate with infinitely many targets and never go beyond it.
 *
 * With the way the cap is implemented, you reach the same value as theoretical at 5 targets (~1.9x). But then at 6 targets you're over 2x and at 8 targets you're over 3x.
 *
 * Message @emallson if you want the data from testing.
 */
export default class AnvilStave extends Analyzer {
  static dependencies = {
    sharedBrews: SharedBrews,
  };

  protected sharedBrews!: SharedBrews;

  private rank: number;
  private totalCdr = 0;
  private triggerCount = 0;

  private recentTriggers: DamageEvent[] = [];

  get cdr() {
    return this.totalCdr;
  }

  get count() {
    return this.triggerCount;
  }

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.getTalentRank(spells.ANVIL_AND_STAVE_TALENT);
    this.active = this.rank > 0;

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamage);
  }

  private recentAttackerCount(event: DamageEvent): number {
    this.recentTriggers.push(event);
    this.recentTriggers = this.recentTriggers.filter(
      (prev) => prev.timestamp >= event.timestamp - RECENT_DURATION,
    );

    return new Set(this.recentTriggers.map((event) => encodeEventSourceString(event))).size;
  }

  private onDamage(event: DamageEvent) {
    if (event.hitType !== HIT_TYPES.MISS && event.hitType !== HIT_TYPES.DODGE) {
      return;
    }

    const attackerCount = this.recentAttackerCount(event);
    const cdrAmount = this.rank * CDR_RATE * CDR_FACTOR[Math.min(MAX_ATTACKERS, attackerCount) - 1];

    this.triggerCount += 1;
    const actualCdr = this.sharedBrews.reduceCooldown(cdrAmount);
    this.totalCdr += actualCdr;
    DEBUG &&
      this.addDebugAnnotation(event, {
        color: 'lightgrey',
        summary: `A&S reduced cooldown (raw: ${cdrAmount.toFixed(1)}, actual: ${cdrAmount.toFixed(1)})`,
        details: (
          <dl>
            <dt>Recent Attacker Count</dt>
            <dd>{attackerCount}</dd>
            <dt>Max CDR (ms)</dt>
            <dd>{this.rank * CDR_RATE}</dd>
            <dt>Raw CDR (ms)</dt>
            <dd>{cdrAmount.toFixed(2)}</dd>
            <dt>Actual CDR (ms)</dt>
            <dd>{actualCdr.toFixed(2)}</dd>
          </dl>
        ),
      });
  }

  statistic(): ReactNode {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringValue
          label={
            <>
              <SpellLink spell={spells.ANVIL_AND_STAVE_TALENT} /> Cooldown Reduction
            </>
          }
        >
          {formatDurationMinSec(this.totalCdr / 1000)}
        </BoringValue>
      </Statistic>
    );
  }
}
