import {
  absoluteMitigation,
  debuff,
  MajorDefensiveDebuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { ReactNode } from 'react';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';

const MITIGATION = 0.35;

export default class Pulverize extends MajorDefensiveDebuff {
  constructor(options: Options) {
    super(TALENTS_DRUID.PULVERIZE_TALENT, debuff(TALENTS_DRUID.PULVERIZE_TALENT), options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.PULVERIZE_TALENT);

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
            <SpellLink spell={TALENTS_DRUID.PULVERIZE_TALENT} />
          </strong>{' '}
          debuffs a single target to do heavily reduced damage to you for several seconds. It can be
          particularly useful for covering scary tankbusters, especially magic damage / bleeds that
          can't be mitigated by <SpellLink spell={SPELLS.IRONFUR} />.
        </p>
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
