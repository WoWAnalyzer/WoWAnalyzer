import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import BuffUptimeBar from 'interface/guide/components/BuffUptimeBar';

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

    const explanation = (
      <>
        <div>
          <b>{feelTheBurn}</b> grants a high amount of mastery which in turn increases your ticking
          {ignite} damage. Keeping this buff at max stacks is not terribly difficult as it can be
          extended via {fireBlast}.
        </div>
      </>
    );
    const buffHistory = this.selectedCombatant.getBuffHistory(SPELLS.FEEL_THE_BURN_BUFF.id);

    const data = (
      <BuffUptimeBar
        spell={TALENTS.FEEL_THE_BURN_TALENT}
        buffHistory={buffHistory}
        startTime={this.owner.fight.start_time}
        endTime={this.owner.fight.end_time}
        maxStacks={FEEL_THE_BURN_MAX_STACKS}
        barColor={BURN_COLOR}
        backgroundBarColor={BURN_BG_COLOR}
      />
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
