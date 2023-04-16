import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import Events, { DamageEvent } from 'parser/core/Events';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import { Trans } from '@lingui/macro';
import { ReactNode } from 'react';
import StatTracker from 'parser/shared/modules/StatTracker';
import { getArmorMitigationForEvent } from 'parser/retail/armorMitigation';
import {
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

export default class Metamorphosis extends MajorDefensiveBuff {
  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
    statTracker: StatTracker,
  };

  constructor(options: Options & { statTracker: StatTracker }) {
    super(SPELLS.METAMORPHOSIS_TANK, buff(SPELLS.METAMORPHOSIS_TANK), options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
    options.statTracker.add(SPELLS.METAMORPHOSIS_TANK.id, {
      armor: () => this.bonusArmorGain(options.statTracker),
    });
  }

  private bonusArmorGain(statTracker: StatTracker) {
    return statTracker.currentArmorRating * 2;
  }

  private recordDamage(event: DamageEvent) {
    if (
      !this.defensiveActive ||
      event.sourceIsFriendly ||
      event.ability.type !== MAGIC_SCHOOLS.ids.PHYSICAL
    ) {
      return;
    }
    this.recordMitigation({
      event,
      mitigatedAmount: getArmorMitigationForEvent(event, this.owner.fight)?.amount ?? 0,
    });
  }

  description(): ReactNode {
    return (
      <p>
        <Trans id="guide.demonhunter.vengeance.sections.defensives.metamorphosis.explanation.summary">
          <SpellLink id={SPELLS.METAMORPHOSIS_TANK} /> increases your current and max HP by 50% and
          your armor by 200%. This grants incredible survivablity and makes it your biggest
          cooldown.
        </Trans>
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}
