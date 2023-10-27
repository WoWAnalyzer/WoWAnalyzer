import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { ReactNode } from 'react';
import {
  buff,
  MajorDefensiveBuff,
  absoluteMitigation,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TALENTS from 'common/TALENTS/paladin';

const BASE_MITIGATION = 0.2;
const IMPROVED_ARDENT_DEFENDER_ADDITIONAL_MITIGATION = 0.1;

export default class ArdentDefender extends MajorDefensiveBuff {
  mitPct: number;

  constructor(options: Options) {
    super(TALENTS.ARDENT_DEFENDER_TALENT, buff(TALENTS.ARDENT_DEFENDER_TALENT), options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);

    this.mitPct =
      BASE_MITIGATION +
      this.selectedCombatant.getTalentRank(TALENTS.IMPROVED_ARDENT_DEFENDER_TALENT) *
        IMPROVED_ARDENT_DEFENDER_ADDITIONAL_MITIGATION;
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive || event.sourceIsFriendly) {
      return;
    }
    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, this.mitPct),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={TALENTS.ARDENT_DEFENDER_TALENT} /> reduces the damage you take by 20%. And
        will prevent your next death while the buff is active.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}
