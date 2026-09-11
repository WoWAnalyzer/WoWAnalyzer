import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';
import { JADE_SANCTUARY_DR, JADE_SANCTUARY_HEAL } from '../../../constants';

class JadeSanctuary extends MajorDefensiveBuff {
  healCount = 0;
  effectiveHealing = 0;
  overhealing = 0;

  constructor(options: Options) {
    super(talents.CELESTIAL_CONDUIT_MISTWEAVER_TALENT, buff(SPELLS.JADE_SANCTUARY_BUFF), options);

    this.active = this.selectedCombatant.hasTalent(talents.JADE_SANCTUARY_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
    this.addEventListener(
      Events.heal.to(SELECTED_PLAYER).spell(SPELLS.JADE_SANCTUARY_HEAL),
      this.recordHeal,
    );
  }

  private recordHeal(event: HealEvent) {
    this.healCount += 1;
    this.effectiveHealing += event.amount + (event.absorbed ?? 0);
    this.overhealing += event.overheal ?? 0;
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive(event)) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, JADE_SANCTUARY_DR),
    });
  }

  description(): ReactNode {
    const totalHealing = this.effectiveHealing + this.overhealing;
    const overhealPercent = totalHealing > 0 ? this.overhealing / totalHealing : 0;
    return (
      <>
        <p>
          <SpellLink spell={talents.JADE_SANCTUARY_TALENT} /> heals you for{' '}
          {formatPercentage(JADE_SANCTUARY_HEAL, 0)}% of your maximum health when you activate{' '}
          <SpellLink spell={talents.CELESTIAL_CONDUIT_MISTWEAVER_TALENT} /> and reduces damage taken
          by {formatPercentage(JADE_SANCTUARY_DR, 0)}% for its duration, lingering for 8 seconds
          after it ends.
        </p>
        {this.healCount > 0 && (
          <p>
            The heal restored {formatNumber(this.effectiveHealing)} health over {this.healCount}{' '}
            activations ({formatPercentage(overhealPercent, 0)}% overhealing). Only the damage
            reduction is counted in the mitigation below.
          </p>
        )}
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default JadeSanctuary;
