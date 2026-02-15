import {
  absoluteMitigation,
  MajorDefensiveBuff,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { BLUR_MITIGATION_PERCENT } from '../../constants';
import SPELLS from 'common/SPELLS';
import { ReactNode } from 'react';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellLink from 'interface/SpellLink';

class BlurAnalyzer extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(SPELLS.BLUR, buff(SPELLS.BLUR_BUFF), options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, BLUR_MITIGATION_PERCENT),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={SPELLS.BLUR} /> reduces the damage you take by{' '}
        {BLUR_MITIGATION_PERCENT * 100}%.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default BlurAnalyzer;
