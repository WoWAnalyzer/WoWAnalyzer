import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { TALENTS_PRIEST } from 'common/TALENTS';
import { HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../../constants';

const PERFECTED_FORM_BUFF_ID = 453983;
//10% INCREASE
const PERFECTED_FORM_AMP = 0.1;

/**
 * **Perfected Form**
 * Your healing done is increased by 10% while Apotheosis is active and for 20 sec after you cast Holy Word: Salvation.
 */

//https://www.warcraftlogs.com/reports/WT19GKp2VHqLarbD#fight=19``&type=auras&source=122
class PerfectedFormHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  /** Total healing from salvation buff */
  perfectedFormSalv = 0;
  /** Total healing from apoth buff */
  perfectedFormApoth = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PERFECTED_FORM_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES),
      this.onPerfectedFormHeal,
    );
  }

  onPerfectedFormHeal(event: HealEvent) {
    if (
      this.selectedCombatant.hasBuff(PERFECTED_FORM_BUFF_ID, null, 0, 0, this.selectedCombatant.id)
    ) {
      this.perfectedFormSalv += calculateEffectiveHealing(event, PERFECTED_FORM_AMP);
    }
    //Apoth only gets the buff when Perfected Form from Salv isn't active
    else if (
      !this.selectedCombatant.hasBuff(
        PERFECTED_FORM_BUFF_ID,
        null,
        0,
        0,
        this.selectedCombatant.id,
      ) &&
      this.selectedCombatant.hasBuff(
        TALENTS_PRIEST.APOTHEOSIS_TALENT.id,
        null,
        0,
        0,
        this.selectedCombatant.id,
      )
    ) {
      this.perfectedFormApoth += calculateEffectiveHealing(event, PERFECTED_FORM_AMP);
    }
  }

  get totalHealing(): number {
    return this.perfectedFormApoth + this.perfectedFormSalv;
  }

  get percentHealing(): number {
    return this.owner.getPercentageOfTotalHealingDone(this.totalHealing);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Total healing from Perfected Form through Holy Word: Salvation -{' '}
            <strong>
              {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.perfectedFormSalv))}
              %
            </strong>
            <ul>
              Total healing from Perfected Form through Apotheosis -{' '}
              <strong>
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(this.perfectedFormApoth),
                )}
                %
              </strong>{' '}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.PERFECTED_FORM_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PerfectedFormHoly;
