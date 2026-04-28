import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import {
  MajorDefensiveBuff,
  absoluteMitigation,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import SpellLink from 'interface/SpellLink';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

const DISPERSION_DAMAGE_REDUCTION = 0.75;

class Dispersion extends MajorDefensiveBuff {
  hasIntangibility: boolean;
  hasHeightenedAlteration: boolean;

  constructor(options: Options) {
    super(SPELLS.DISPERSION, buff(SPELLS.DISPERSION), options);
    this.active = true;
    this.hasIntangibility = this.selectedCombatant.hasTalent(TALENTS.INTANGIBILITY_TALENT);
    this.hasHeightenedAlteration = this.selectedCombatant.hasTalent(
      TALENTS.HEIGHTENED_ALTERATION_TALENT,
    );

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  private onDamageTaken(event: DamageEvent) {
    if (!this.defensiveActive || event.sourceIsFriendly) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, DISPERSION_DAMAGE_REDUCTION),
    });
  }

  description(): ReactNode {
    const duration = this.hasHeightenedAlteration ? 8 : 6;
    return (
      <>
        <p>
          <SpellLink spell={SPELLS.DISPERSION} /> reduces the damage you take by{' '}
          {formatPercentage(DISPERSION_DAMAGE_REDUCTION, 0)}% for {duration} seconds.
        </p>
        {this.hasHeightenedAlteration && (
          <p>
            <SpellLink spell={TALENTS.HEIGHTENED_ALTERATION_TALENT} /> extends its duration by 2
            seconds.
          </p>
        )}
        {this.hasIntangibility && (
          <p>
            <SpellLink spell={TALENTS.INTANGIBILITY_TALENT} /> also heals you for 25% of your
            maximum health over its duration and reduces its cooldown by 30 seconds.
          </p>
        )}
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default Dispersion;
