import {
  MajorDefensiveBuff,
  absoluteMitigation,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/warlock';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellLink from 'interface/SpellLink';
import { ReactNode } from 'react';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class UnendingResolve extends MajorDefensiveBuff {
  hasStrengthOfWill: boolean;
  hasDarkAccord: boolean;

  constructor(options: Options) {
    super(SPELLS.UNENDING_RESOLVE, buff(SPELLS.UNENDING_RESOLVE), options);
    this.active = true;
    this.hasStrengthOfWill = this.selectedCombatant.hasTalent(TALENTS.STRENGTH_OF_WILL_TALENT);
    this.hasDarkAccord = this.selectedCombatant.hasTalent(TALENTS.DARK_ACCORD_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  private onDamageTaken(event: DamageEvent) {
    if (!this.defensiveActive || event.sourceIsFriendly) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, this.hasStrengthOfWill ? 0.4 : 0.25),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={SPELLS.UNENDING_RESOLVE} /> reduces the damage you take by 25%, increased
        to 40% with <SpellLink spell={TALENTS.STRENGTH_OF_WILL_TALENT} />.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}

export default UnendingResolve;
