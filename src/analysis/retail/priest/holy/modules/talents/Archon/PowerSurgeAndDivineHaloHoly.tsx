import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
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
class PowerSurgeAndDivineHaloHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    archonanalysis: ArchonAnalysis,
  };

  protected combatants!: Combatants;
  protected archonanalysis!: ArchonAnalysis;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.DIVINE_HALO_TALENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            {'If you only cast your first '}
            <SpellLink spell={SPELLS.HALO_TALENT} />
            {' each time, it would have done '}
            {formatNumber(this.archonanalysis.firstHaloHealing)}
            (
            {formatPercentage(
              this.owner.getPercentageOfTotalHealingDone(this.archonanalysis.firstHaloHealing),
            )}
            %) of your healing
            <br />
            {'and '}
            {formatNumber(this.archonanalysis.firstHaloDamage)}
            (
            {formatPercentage(
              this.owner.getPercentageOfTotalHealingDone(this.archonanalysis.firstHaloDamage),
            )}
            %) of your damage
            <br />
            <br />

            {'This includes the amp from '}
            <SpellLink spell={TALENTS_PRIEST.DIVINE_HALO_TALENT} />
            {' if you are talented into it.'}
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.POWER_SURGE_TALENT}>
          <small>
            {'Your extra 5 casts of '}
            <SpellLink spell={SPELLS.HALO_TALENT} />
            {' from both '}
            <SpellLink spell={TALENTS_PRIEST.POWER_SURGE_TALENT} />
            {' and '}
            <SpellLink spell={TALENTS_PRIEST.DIVINE_HALO_TALENT} />
            {' did:'}
          </small>
          <br />
          <br />
          <ItemPercentHealingDone
            amount={this.archonanalysis.passHaloFirstAndCapStoneHealing}
          />{' '}
          <br />
          <ItemPercentDamageDone amount={this.archonanalysis.passHaloFirstAndCapStoneDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PowerSurgeAndDivineHaloHoly;
