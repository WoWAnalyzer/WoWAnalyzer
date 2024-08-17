import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import { formatNumber } from 'common/format';
import ArchonAnalysis from './ArchonAnalysis';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

import { TALENTS_PRIEST } from 'common/TALENTS';
import PRIEST_TALENTS from 'common/TALENTS/priest';
/**
 * **Perfected Form**
 * Your healing done is increased by 10% while Apotheosis is active and for 20 sec after you cast Holy Word: Salvation.
 */

//https://www.warcraftlogs.com/reports/WT19GKp2VHqLarbD#fight=19``&type=auras&source=122
class ManifestedPowerHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    archonanalysis: ArchonAnalysis,
  };

  protected combatants!: Combatants;
  protected archonanalysis!: ArchonAnalysis;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.MANIFESTED_POWER_TALENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <SpellLink spell={PRIEST_TALENTS.SURGE_OF_LIGHT_TALENT} /> procs and usage from ALL
            sources:
            <ul>
              <li>
                {formatNumber(this.archonanalysis.surgeOfLightProcsGainedTotal)}
                {' gained total'}
              </li>
              <li>
                {formatNumber(this.archonanalysis.surgeOfLightProcsSpent)}
                {' spent total'}
              </li>
              <li>
                {formatNumber(this.archonanalysis.surgeOfLightProcsOverwritten)}
                {' overwritten'}
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.MANIFESTED_POWER_TALENT}>
          <div>
            {this.archonanalysis.surgeOfLightProcsGainedFromHalo}
            <small> procs gained from Halo</small> <br />
            {this.archonanalysis.surgeOfLightProcsOverwrittenByHalo}
            <small> overwritten procs from Halo</small> <br />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ManifestedPowerHoly;
