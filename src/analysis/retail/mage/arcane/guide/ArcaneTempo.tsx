import { formatPercentage, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';

import ArcaneTempo from '../talents/ArcaneTempo';
import { getUptimesFromBuffHistory } from 'parser/ui/UptimeBar';
import UptimeStackBar, { getStackUptimesFromBuffHistory } from 'parser/ui/UptimeStackBar';

const TEMPO_MAX_STACKS = 5;
const TEMPO_COLOR = '#cd1bdf';
const TEMPO_BG_COLOR = '#8a2be2';

class ArcaneTempoGuide extends Analyzer {
  static dependencies = {
    arcaneTempo: ArcaneTempo,
  };

  protected arcaneTempo!: ArcaneTempo;

  get arcaneTempoUptime() {
    const util = this.arcaneTempo.arcaneTempoUptimeThresholds.actual;
    const thresholds = this.arcaneTempo.arcaneTempoUptimeThresholds.isLessThan;
    let performance = QualitativePerformance.Fail;
    if (util >= thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (util >= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (util >= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get guideSubsection(): JSX.Element {
    const arcaneTempo = <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;

    const explanation = (
      <>
        <div>
          <b>{arcaneTempo}</b> is a stacking Haste buff that gets applied whenever you spend your{' '}
          {arcaneCharge}s. This buff lasts for 12s, so you can, and should, keep this buff up for
          the entire fight by casting {arcaneBarrage} to spend your {arcaneCharge}s before the buff
          expires. This can sometimes be unavoidable due to forced downtime, but should be minimized
          as much as possible.
        </div>
      </>
    );
    const buffHistory = this.selectedCombatant.getBuffHistory(SPELLS.ARCANE_TEMPO_BUFF.id);
    const overallUptimes = getUptimesFromBuffHistory(buffHistory, this.owner.currentTimestamp);
    const stackUptimes = getStackUptimesFromBuffHistory(buffHistory, this.owner.currentTimestamp);
    const data = (
      <div>
        <RoundedPanel>
          <strong>Arcane Tempo Buff Uptime</strong>
          <div className="flex-main multi-uptime-bar">
            <div className="flex main-bar-big">
              <div className="flex-sub bar-label">
                <SpellIcon spell={TALENTS.ARCANE_TEMPO_TALENT} />{' '}
                <span style={{ color: TEMPO_BG_COLOR }}>
                  {formatPercentage(this.arcaneTempo.buffUptimePercent, 0)}% <small>active</small>
                </span>
                <br />
                <span style={{ fontSize: '16px', color: TEMPO_COLOR }}>
                  {formatDuration(this.arcaneTempo.buffUptimeMS)} /{' '}
                  {formatDuration(this.owner.fightDuration)}
                </span>
              </div>
              <div className="flex-main chart">
                <UptimeStackBar
                  stackUptimeHistory={stackUptimes}
                  start={this.owner.fight.start_time}
                  end={this.owner.fight.end_time}
                  maxStacks={TEMPO_MAX_STACKS}
                  barColor={TEMPO_COLOR}
                  backgroundHistory={overallUptimes}
                  backgroundBarColor={TEMPO_BG_COLOR}
                  timeTooltip
                />
              </div>
            </div>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Arcane Tempo',
    );
  }
}

export default ArcaneTempoGuide;
