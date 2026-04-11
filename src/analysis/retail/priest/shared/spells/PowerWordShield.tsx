import SPELLS from 'common/SPELLS';
import {
  MajorDefensiveBuff,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import SpellLink from 'interface/SpellLink';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

class PowerWordShield extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(SPELLS.POWER_WORD_SHIELD, buff(SPELLS.POWER_WORD_SHIELD), options);
    this.active = true;

    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onAbsorb,
    );
  }

  private onAbsorb(event: AbsorbedEvent) {
    if (!this.defensiveActive) {
      return;
    }
    // recordMitigation expects an event whose `ability` is the damage source.
    // Copy so we don't mutate the shared event for downstream analyzers.
    this.recordMitigation({
      event: { ...event, ability: event.extraAbility },
      mitigatedAmount: event.amount,
    });
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={SPELLS.POWER_WORD_SHIELD} /> absorbs incoming damage. Use it proactively
        before taking damage to get the most value out of the shield.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default PowerWordShield;
