import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';

import ArcaneTempo from '../talents/ArcaneTempo';
import { getUptimesFromBuffHistory } from 'parser/ui/UptimeBar';
import UptimeStackBar, { getStackUptimesFromBuffHistory } from 'parser/ui/UptimeStackBar';
import { ARCANE_TEMPO_MAX_STACKS } from '../../shared';

const TEMPO_COLOR = '#cd1bdf';
const TEMPO_BG_COLOR = '#7e5da8';

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

    const explanation = (
      <>
        <div>
          <b>{arcaneTempo}</b> grants a high amount of haste if uptime is maintained at max stacks.
          It can take a while to get back up to max if you let it fall. Cast {arcaneBarrage} before
          it falls to maintain the buff.
        </div>
      </>
    );
    const buffHistory = this.selectedCombatant.getBuffHistory(SPELLS.ARCANE_TEMPO_BUFF.id);
    const overallUptimes = getUptimesFromBuffHistory(buffHistory, this.owner.currentTimestamp);
    const stackUptimes = getStackUptimesFromBuffHistory(buffHistory, this.owner.currentTimestamp);

    const data = (
      <div>
        <RoundedPanel>
          <strong>Arcane Tempo Uptime</strong>
          <div className="flex-main multi-uptime-bar">
            <div className="flex main-bar-big">
              <div className="flex-sub bar-label">
                <SpellIcon spell={TALENTS.ARCANE_TEMPO_TALENT} />{' '}
                <span style={{ color: TEMPO_BG_COLOR }}>
                  {formatPercentage(this.arcaneTempo.buffUptimePercent, 0)}% <small>active</small>
                </span>
                <br />
                <TooltipElement
                  content={`This is the average number of stacks you had over the course of the fight, counting periods where you didn't have the buff as zero stacks.`}
                >
                  <span style={{ color: TEMPO_COLOR }}>
                    {this.arcaneTempo.averageStacks.toFixed(1)} <small>avg stacks</small>
                  </span>
                </TooltipElement>
              </div>
              <div className="flex-main chart">
                <UptimeStackBar
                  stackUptimeHistory={stackUptimes}
                  start={this.owner.fight.start_time}
                  end={this.owner.fight.end_time}
                  maxStacks={ARCANE_TEMPO_MAX_STACKS}
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
