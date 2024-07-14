import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options } from 'parser/core/Module';
import Events, { DamageEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { RAGE_OF_THE_SLEEPER_MIT } from 'analysis/retail/druid/guardian/constants';

export default class RageOfTheSleeper extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(
      TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT,
      buff(TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT),
      options,
    );
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    // TODO also count the flat mitigation / reflect
    if (this.defensiveActive(event) && !event.sourceIsFriendly) {
      this.recordMitigation({
        event,
        mitigatedAmount: absoluteMitigation(event, RAGE_OF_THE_SLEEPER_MIT),
      });
    }
  }

  description(): React.ReactNode {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT} />
          </strong>{' '}
          provides a moderate damage reduction in addition to Leech and an outgoing damage boost.
        </p>
        <p>
          It's best when you will be both taking and dealing a large volume of damage, like during a
          large pull in Dungeons or while picking up many adds in Raids.
        </p>
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
