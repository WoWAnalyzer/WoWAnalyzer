import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const GOE_DURATION = 15000;
const debug = false;

class GuardianOfElune extends Analyzer {
  GoEProcsTotal = 0;
  lastGoEProcTime = 0;
  consumedGoEProc = 0;
  overwrittenGoEProc = 0;
  nonGoEIronFur = 0;
  GoEIronFur = 0;
  nonGoEFRegen = 0;
  GoEFRegen = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARDIAN_OF_ELUNE_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_OF_ELUNE),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_OF_ELUNE),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IRONFUR),
      this.onCastIronfur,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FRENZIED_REGENERATION),
      this.onCastFrenziedRegen,
    );
  }

  onApplyBuff(event) {
    this.lastGoEProcTime = event.timestamp;
    debug && console.log('Guardian of Elune applied');
    this.GoEProcsTotal += 1;
  }

  onRefreshBuff(event) {
    // Captured Overwritten GoE Buffs for use in wasted buff calculations
    this.lastGoEProcTime = event.timestamp;
    debug && console.log('Guardian of Elune Overwritten');
    this.GoEProcsTotal += 1;
    this.overwrittenGoEProc += 1;
  }

  onCastIronfur(event) {
    if (this.lastGoEProcTime !== event.timestamp) {
      if (this.lastGoEProcTime === null) {
        this.nonGoEIronFur += 1;
        return;
      }
      const GoETimeframe = this.lastGoEProcTime + GOE_DURATION;
      if (event.timestamp > GoETimeframe) {
        this.nonGoEIronFur += 1;
      } else {
        this.consumedGoEProc += 1;
        this.GoEIronFur += 1;
        debug && console.log(`Guardian of Elune Proc Consumed / Timestamp: ${event.timestamp}`);
        this.lastGoEProcTime = null;
      }
    }
  }

  onCastFrenziedRegen(event) {
    if (this.lastGoEProcTime !== event.timestamp) {
      if (this.lastGoEProcTime === null) {
        this.nonGoEFRegen += 1;
        return;
      }
      const GoETimeframe = this.lastGoEProcTime + GOE_DURATION;
      if (event.timestamp > GoETimeframe) {
        this.nonGoEFRegen += 1;
      } else {
        this.consumedGoEProc += 1;
        this.GoEFRegen += 1;
        debug && console.log(`Guardian of Elune Proc Consumed / Timestamp: ${event.timestamp}`);
        this.lastGoEProcTime = null;
      }
    }
  }

  suggestions(when) {
    const unusedGoEProcs = 1 - this.consumedGoEProc / this.GoEProcsTotal;

    when(unusedGoEProcs)
      .isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You wasted {formatPercentage(unusedGoEProcs)}% of your{' '}
            <SpellLink id={SPELLS.GUARDIAN_OF_ELUNE.id} /> procs. Try to use the procs as soon as
            you get them so they are not overwritten.
          </span>,
        )
          .icon(SPELLS.GUARDIAN_OF_ELUNE.icon)
          .actual(
            t({
              id: 'druid.guardian.suggestions.guardianOfElune.unused',
              message: `${formatPercentage(unusedGoEProcs)}% unused`,
            }),
          )
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.15)
          .major(recommended + 0.3),
      );
  }

  statistic() {
    const unusedGoEProcs = 1 - this.consumedGoEProc / this.GoEProcsTotal;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            You got total <strong>{this.GGProcsTotal}</strong> galactic guardian procs and{' '}
            <strong>used {this.consumedGGProc}</strong> of them.
          </>
        }
      >
        <BoringSpellValue
          spellId={SPELLS.GUARDIAN_OF_ELUNE.id}
          value={`${formatPercentage(unusedGoEProcs)}%`}
          label="Unused Guardian of Elune"
        />
      </Statistic>
    );
  }
}

export default GuardianOfElune;
