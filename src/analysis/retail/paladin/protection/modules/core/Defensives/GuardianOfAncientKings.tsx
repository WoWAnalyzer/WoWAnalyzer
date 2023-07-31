import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { Trans } from '@lingui/macro';
import { ReactNode } from 'react';
import {
  buff,
  MajorDefensiveBuff,
  absoluteMitigation,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TALENTS from 'common/TALENTS/paladin';

export default class GuardianOfAncientKings extends MajorDefensiveBuff {
  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
  };

  constructor(options: Options) {
    super(
      TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT,
      buff(TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT),
      options,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive || event.sourceIsFriendly) {
      return;
    }
    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, 0.5),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <Trans id="guide.paladin.protection.sections.defensives.guardian_of_ancient_kings.explanation.summary">
          <SpellLink spell={TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT} /> reduces the damage you take
          by 50%. This grants incredible survivablity and makes it your biggest defensive cooldown.
        </Trans>
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}
