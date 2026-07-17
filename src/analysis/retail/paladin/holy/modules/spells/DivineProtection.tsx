import type { ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import {
  MajorDefensiveBuff,
  absoluteMitigation,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/** Divine Protection's damage reduction. Not modelled anywhere else in the class. */
const DIVINE_PROTECTION_DAMAGE_REDUCTION = 0.2;

class DivineProtection extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(SPELLS.DIVINE_PROTECTION, buff(SPELLS.DIVINE_PROTECTION), options);
    this.active = true;

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  private onDamageTaken(event: DamageEvent) {
    if (!this.defensiveActive || event.sourceIsFriendly) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, DIVINE_PROTECTION_DAMAGE_REDUCTION),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={SPELLS.DIVINE_PROTECTION} /> reduces the damage you take by{' '}
        {DIVINE_PROTECTION_DAMAGE_REDUCTION * 100}%. It is a short cooldown, so it is worth using
        for any damage you can see coming rather than saving for something worse.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default DivineProtection;
