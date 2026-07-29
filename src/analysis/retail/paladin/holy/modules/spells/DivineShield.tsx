import type { ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import {
  MajorDefensiveBuff,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options } from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Divine Shield is an immunity, so there is no damage to mitigate and nothing to record --
 * the framework tracks the window itself. Same shape as Mage's Ice Block.
 */
class DivineShield extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(SPELLS.DIVINE_SHIELD, buff(SPELLS.DIVINE_SHIELD), options);
    this.active = true;
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={SPELLS.DIVINE_SHIELD} /> makes you immune to damage. Nothing gets through
        it, so there is no mitigation to measure -- what matters is that the window covered
        something worth covering.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default DivineShield;
