import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import Events, { DamageEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { TALENTS_DRUID } from 'common/TALENTS';
import { ReactNode } from 'react';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';

const BASE_MITIGATION = 0.2;
const REINFORCED_FUR_ADDITIONAL_MITIGATION = 0.1;

export default class Barkskin extends MajorDefensiveBuff {
  mitPct: number;

  constructor(options: Options) {
    super(SPELLS.BARKSKIN, buff(SPELLS.BARKSKIN), options);

    this.mitPct =
      BASE_MITIGATION +
      this.selectedCombatant.getTalentRank(TALENTS_DRUID.REINFORCED_FUR_TALENT) *
        REINFORCED_FUR_ADDITIONAL_MITIGATION;

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (this.defensiveActive(event) && !event.sourceIsFriendly) {
      this.recordMitigation({
        event,
        mitigatedAmount: absoluteMitigation(event, this.mitPct),
      });
    }
  }

  description(): React.ReactNode {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.BARKSKIN} />
          </strong>{' '}
          provides a modest damage reduction on a short cooldown. With{' '}
          <SpellLink spell={TALENTS_DRUID.VERDANT_HEART_TALENT} />, it also increases all incoming
          healing by 20%.
        </p>
        <p>
          With its brief cooldown and long duration, you can use it pretty freely. Cover time of
          moderate danger, like on pull or before a routine tankbuster.
        </p>
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
