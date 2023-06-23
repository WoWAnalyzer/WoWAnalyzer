// Based on Clearcasting Implementation done by @Blazyb
import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const GORE_DURATION = 10000;
const debug = false;

class Gore extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  totalProcs = 0;
  lastGoreProcTime = 0;
  consumedGoreProc = 0;
  overwrittenGoreProc = 0;
  nonGoreMangle = 0;

  constructor(options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GORE_BEAR),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GORE_BEAR),
      this.onRefreshBuff,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MANGLE_BEAR), this.onCast);
  }

  onApplyBuff(event) {
    if (this.spellUsable.isOnCooldown(SPELLS.MANGLE_BEAR.id)) {
      this.spellUsable.endCooldown(SPELLS.MANGLE_BEAR.id);
    }
    this.lastGoreProcTime = event.timestamp;
    debug && console.log('Gore applied');
    this.totalProcs += 1;
  }

  onRefreshBuff(event) {
    // Captured Overwritten Gore Buffs for use in wasted buff calculations
    if (this.spellUsable.isOnCooldown(SPELLS.MANGLE_BEAR.id)) {
      this.spellUsable.endCooldown(SPELLS.MANGLE_BEAR.id);
    }
    this.lastGoreProcTime = event.timestamp;
    debug && console.log('Gore Overwritten');
    this.totalProcs += 1;
    this.overwrittenGoreProc += 1;
  }

  onCast(event) {
    if (this.lastGoreProcTime !== event.timestamp) {
      if (this.lastGoreProcTime === 0) {
        this.nonGoreMangle += 1;
        return;
      }
      const goreTimeframe = this.lastGoreProcTime + GORE_DURATION;
      if (event.timestamp > goreTimeframe) {
        this.nonGoreMangle += 1;
      } else {
        this.consumedGoreProc += 1;
        debug && console.log(`Gore Proc Consumed / Timestamp: ${event.timestamp}`);
        this.lastGoreProcTime = 0;
      }
    }
  }

  suggestions(when) {
    const unusedGoreProcs = 1 - this.consumedGoreProc / this.totalProcs;

    when(unusedGoreProcs)
      .isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You wasted {formatPercentage(unusedGoreProcs)}% of your{' '}
            <SpellLink spell={SPELLS.GORE_BEAR} /> procs. Try to use the procs as soon as you get
            them so they are not overwritten.
          </span>,
        )
          .icon(SPELLS.GORE_BEAR.icon)
          .actual(
            t({
              id: 'druid.guardian.suggestions.gore.unused',
              message: `${formatPercentage(unusedGoreProcs)}% unused`,
            }),
          )
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.15)
          .major(recommended + 0.3),
      );
  }

  statistic() {
    const unusedGoreProcs = 1 - this.consumedGoreProc / this.totalProcs;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        tooltip={
          <>
            You got total <strong>{this.totalProcs}</strong> gore procs and{' '}
            <strong>used {this.consumedGoreProc}</strong> of them.
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.GORE_BEAR} /> Unused Gore Proc's{' '}
            </>
          }
        >
          {`${formatPercentage(unusedGoreProcs)}%`}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default Gore;
