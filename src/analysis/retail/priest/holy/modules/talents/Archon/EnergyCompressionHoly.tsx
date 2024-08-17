import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ArchonAnalysis from './ArchonAnalysis';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { TALENTS_PRIEST } from 'common/TALENTS';
/**
 * **Perfected Form**
 * Your healing done is increased by 10% while Apotheosis is active and for 20 sec after you cast Holy Word: Salvation.
 */

//https://www.warcraftlogs.com/reports/WT19GKp2VHqLarbD#fight=19``&type=auras&source=122
class EnergyCompressionHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    archonanalysis: ArchonAnalysis,
  };

  protected combatants!: Combatants;
  protected archonanalysis!: ArchonAnalysis;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.ENERGY_COMPRESSION_TALENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_PRIEST.ENERGY_COMPRESSION_TALENT}>
          <ItemPercentHealingDone amount={this.archonanalysis.passTotalEnergyCompressionHealing} />{' '}
          <br />
          <ItemPercentDamageDone
            amount={this.archonanalysis.passTotalEnergyCompressionDamage}
          />{' '}
          <br />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EnergyCompressionHoly;
