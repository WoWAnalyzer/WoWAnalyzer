import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

export class ZenMeditation extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(talents.ZEN_MEDITATION_TALENT, buff(talents.ZEN_MEDITATION_TALENT), options);

    this.active = this.selectedCombatant.hasTalent(talents.ZEN_MEDITATION_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (this.defensiveActive(event) && !event.sourceIsFriendly) {
      this.recordMitigation({
        event,
        mitigatedAmount: absoluteMitigation(event, 0.6),
      });
    }
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <SpellLink spell={talents.ZEN_MEDITATION_TALENT} /> is one of the most powerful defensive
          cooldowns in the game, and sports one of the longest cooldowns to compensate. Since the
          cooldown is so long, it is difficult to use effectively without researching a fight's
          damage patterns in advance.
        </p>
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
