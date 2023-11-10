import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { ReactNode } from 'react';
import TALENTS from 'common/TALENTS/paladin';
import {
  absoluteMitigation,
  debuff,
  MajorDefensiveDebuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

export default class EyeOfTyr extends MajorDefensiveDebuff {
  constructor(options: Options) {
    super(TALENTS.EYE_OF_TYR_TALENT, debuff(TALENTS.EYE_OF_TYR_TALENT), options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.EYE_OF_TYR_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive(event) || event.sourceIsFriendly) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, 0.2),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={TALENTS.EYE_OF_TYR_TALENT} /> reduces the damage dealt to you by targets
        with its debuff by <strong>25%</strong>.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
