import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';

import { getUptimesFromBuffHistory } from 'parser/ui/UptimeBar';
import UptimeStackBar, { getStackUptimesFromBuffHistory } from 'parser/ui/UptimeStackBar';
import { FEEL_THE_BURN_MAX_STACKS } from '../../shared';
import FeelTheBurn from '../talents/FeelTheBurn';

const BURN_COLOR = '#df631b';
const BURN_BG_COLOR = '#aa0c09';

class FeelTheBurnGuide extends Analyzer {
  static dependencies = {
    feelTheBurn: FeelTheBurn,
  };

  protected feelTheBurn!: FeelTheBurn;

  get arcaneTempoUptime() {
    const util = this.feelTheBurn.feelTheBurnUptimeThresholds.actual;
    const thresholds = this.feelTheBurn.feelTheBurnUptimeThresholds.isLessThan;
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
    const feelTheBurn = <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} />;
    const ignite = <SpellLink spell={SPELLS.IGNITE} />;
    const fireBlast = <SpellLink spell={SPELLS.FIRE_BLAST} />;
    const phoenixFlames = <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{feelTheBurn}</b> grants a high amount of mastery which in turn increases your ticking
          {ignite} damage. Keeping this buff at max stacks is not terribly difficult as it can be
          extended via {fireBlast} and {phoenixFlames}.
        </div>
      </>
    );
    const buffHistory = this.selectedCombatant.getBuffHistory(SPELLS.FEEL_THE_BURN_BUFF.id);
    const overallUptimes = getUptimesFromBuffHistory(buffHistory, this.owner.currentTimestamp);
    const stackUptimes = getStackUptimesFromBuffHistory(buffHistory, this.owner.currentTimestamp);

    const data = (
      <div>
        <RoundedPanel>
          <strong>Feel the Burn Uptime</strong>
          <div className="flex-main multi-uptime-bar">
            <div className="flex main-bar-big">
              <div className="flex-sub bar-label">
                <SpellIcon spell={TALENTS.FEEL_THE_BURN_TALENT} />{' '}
                <span style={{ color: BURN_BG_COLOR }}>
                  {formatPercentage(this.feelTheBurn.buffUptimePercent, 0)}% <small>active</small>
                </span>
                <br />
                <TooltipElement
                  content={`This is the average number of stacks you had over the course of the fight, counting periods where you didn't have the buff as zero stacks.`}
                >
                  <span style={{ color: BURN_COLOR }}>
                    {this.feelTheBurn.averageStacks.toFixed(1)} <small>avg stacks</small>
                  </span>
                </TooltipElement>
              </div>
              <div className="flex-main chart">
                <UptimeStackBar
                  stackUptimeHistory={stackUptimes}
                  start={this.owner.fight.start_time}
                  end={this.owner.fight.end_time}
                  maxStacks={FEEL_THE_BURN_MAX_STACKS}
                  barColor={BURN_COLOR}
                  backgroundHistory={overallUptimes}
                  backgroundBarColor={BURN_BG_COLOR}
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
      'Feel the Burn',
    );
  }
}

export default FeelTheBurnGuide;
