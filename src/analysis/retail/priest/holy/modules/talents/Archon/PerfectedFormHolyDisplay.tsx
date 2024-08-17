import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ArchonAnalysis from './ArchonAnalysis';

import { TALENTS_PRIEST } from 'common/TALENTS';

/**
 * **Perfected Form**
 * Your healing done is increased by 10% while Apotheosis is active and for 20 sec after you cast Holy Word: Salvation.
 */

//https://www.warcraftlogs.com/reports/WT19GKp2VHqLarbD#fight=19``&type=auras&source=122
class PerfectedFormHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    archonanalysis: ArchonAnalysis,
  };

  protected combatants!: Combatants;
  protected archonanalysis!: ArchonAnalysis;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PERFECTED_FORM_TALENT);
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
              {formatPercentage(
                this.owner.getPercentageOfTotalHealingDone(this.archonanalysis.perfectedFormSalv),
              )}
              %
            </strong>
            <ul>
              Total healing from Perfected Form through Apotheosis -{' '}
              <strong>
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(
                    this.archonanalysis.perfectedFormApoth,
                  ),
                )}
                %
              </strong>{' '}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.PERFECTED_FORM_TALENT}>
          <ItemPercentHealingDone amount={this.archonanalysis.totalPerfectedFormHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PerfectedFormHoly;
