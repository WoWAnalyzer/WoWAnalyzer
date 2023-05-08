import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options } from 'parser/core/Module';
import Events, { DamageEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { ReactNode } from 'react';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';

const MITIGATION = 0.5;

export default class SurvivalInstincts extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(SPELLS.SURVIVAL_INSTINCTS, buff(SPELLS.SURVIVAL_INSTINCTS), options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (this.defensiveActive(event) && !event.sourceIsFriendly) {
      this.recordMitigation({
        event,
        mitigatedAmount: absoluteMitigation(event, MITIGATION),
      });
    }
  }

  description(): React.ReactNode {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.SURVIVAL_INSTINCTS} />
          </strong>{' '}
          provides a brief but very powerful damage reduction.
        </p>
        <p>
          More than your other cooldowns, <SpellLink spell={SPELLS.SURVIVAL_INSTINCTS} /> can be
          held for times of extreme danger.
        </p>
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
