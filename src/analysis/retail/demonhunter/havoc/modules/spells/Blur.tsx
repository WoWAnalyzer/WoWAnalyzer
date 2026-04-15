import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS/demonhunter';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
import SpellLink from 'interface/SpellLink';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';

const BASE_MITIGATION = 0.25; // https://www.wowhead.com/spell=198589/blur

export default class Blur extends MajorDefensiveBuff {
  mitigation = BASE_MITIGATION;

  constructor(options: Options) {
    super(SPELLS.BLUR, buff(SPELLS.BLUR_BUFF), options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  private onDamageTaken(event: DamageEvent) {
    if (!this.defensiveActive(event)) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, this.mitigation),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={SPELLS.BLUR} /> reduces the damage you take by{' '}
        {Math.round(this.mitigation * 100)}%.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}
