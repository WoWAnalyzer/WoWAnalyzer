import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';

const PATIENT_CUSTODIAN_HEALING_INCREASE = 0.06;

/**
 * **Patient Custodian**
 * Hero Talent - Wildstalker
 *
 * Your heal over time effects are 6% more effective.
 */
export default class PatientCustodian extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.PATIENT_CUSTODIAN_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  private onHeal(event: HealEvent) {
    if (!event.tick) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, PATIENT_CUSTODIAN_HEALING_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS_DRUID.PATIENT_CUSTODIAN_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
