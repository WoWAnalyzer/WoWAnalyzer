import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import Events, { DamageEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';

import { ReactNode } from 'react';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import {
  absoluteMitigation,
  debuff,
  MajorDefensiveDebuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

export default class FieryBrand extends MajorDefensiveDebuff {
  constructor(options: Options) {
    super(TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT, debuff(SPELLS.FIERY_BRAND_DOT), options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive(event) || event.sourceIsFriendly) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, 0.4),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <>
          <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> reduces the damage dealt to
          you by targets with its debuff by <strong>40%</strong>.
        </>
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
