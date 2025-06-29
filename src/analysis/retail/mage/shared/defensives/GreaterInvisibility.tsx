import TALENTS from 'common/TALENTS/mage';
import { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { SpellLink } from 'interface';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'src/analysis/retail/mage/shared/SPELLS';

const BASE_MITIGATION = 0.6;

class GreaterInvisibility extends MajorDefensiveBuff {
  mitigation = BASE_MITIGATION;

  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(TALENTS.GREATER_INVISIBILITY_TALENT, buff(SPELLS.GREATER_INVISIBILITY_BUFF), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GREATER_INVISIBILITY_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event: DamageEvent) {
    if (!this.defensiveActive) {
      return;
    }
    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, this.mitigation),
    });
  }

  description() {
    return (
      <p>
        <SpellLink spell={TALENTS.GREATER_INVISIBILITY_TALENT} /> reduces the damage you take by
        60%.
      </p>
    );
  }

  statistic() {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default GreaterInvisibility;
