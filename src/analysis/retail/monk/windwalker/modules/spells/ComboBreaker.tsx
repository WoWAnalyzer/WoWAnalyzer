import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const COMBO_BREAKER_DURATION = 15000;
const COMBO_BREAKER_PROC_CHANCE = 0.08;
const debug = false;

class ComboBreaker extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  CBProcsTotal = 0;
  lastCBProcTime: number | null = null;
  consumedCBProc = 0;
  overwrittenCBProc = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMBO_BREAKER_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.COMBO_BREAKER_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK), this.onCast);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.lastCBProcTime = event.timestamp;
    debug && console.log('CB Proc Applied');
    this.CBProcsTotal += 1;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.lastCBProcTime = event.timestamp;
    debug && console.log('CB Proc Overwritten');
    this.CBProcsTotal += 1;
    this.overwrittenCBProc += 1;
  }

  onCast(event: CastEvent) {
    if (this.lastCBProcTime === null) {
      return;
    }
    if (this.lastCBProcTime !== event.timestamp) {
      const cbTimeframe = this.lastCBProcTime + COMBO_BREAKER_DURATION;
      if (event.timestamp <= cbTimeframe) {
        this.consumedCBProc += 1;
        debug && console.log(`CB Proc Consumed / Timestamp: ${event.timestamp}`);
        this.lastCBProcTime = null;
      }
    }
  }

  get usedCBProcs() {
    return this.consumedCBProc / this.CBProcsTotal;
  }

  get suggestionThresholds() {
    return {
      actual: this.usedCBProcs,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs should be used before you tiger
          palm again so they are not overwritten. While some will be overwritten due to higher
          priority of getting Chi for spenders, wasting{' '}
          <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs is not optimal.
        </span>,
      )
        .icon(SPELLS.COMBO_BREAKER_BUFF.icon)
        .actual(
          t({
            id: 'monk.windwalker.suggestions.comboBreaker.procsUsed',
            message: `${formatPercentage(actual)}% used Combo Breaker procs`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% used Combo Breaker Procs is recommended`),
    );
  }

  statistic() {
    const averageCBProcs =
      this.abilityTracker.getAbility(SPELLS.TIGER_PALM.id).casts * COMBO_BREAKER_PROC_CHANCE;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        tooltip={
          <>
            You got a total of <strong>{this.CBProcsTotal} Combo Breaker procs</strong> and{' '}
            <strong>used {this.consumedCBProc}</strong> of them. The average expected number of
            procs from your Tiger Palms this fight is <strong>{averageCBProcs.toFixed(2)}</strong>,
            and you got <strong>{this.CBProcsTotal}</strong>.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.COMBO_BREAKER_BUFF.id}>
          {formatPercentage(this.usedCBProcs, 0)}% <small>Proc utilization</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ComboBreaker;
