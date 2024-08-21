import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ArchonAnalysis from './ArchonAnalysis';

import { TALENTS_PRIEST } from 'common/TALENTS';
import PRIEST_TALENTS from 'common/TALENTS/priest';

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
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <SpellLink spell={PRIEST_TALENTS.PERFECTED_FORM_TALENT} /> healing contributions:
            <ul>
              <li>
                {formatNumber(this.archonanalysis.perfectedFormApoth)}
                {' ('}
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(
                    this.archonanalysis.perfectedFormApoth,
                  ),
                )}
                %) from <SpellLink spell={TALENTS_PRIEST.APOTHEOSIS_TALENT} />
              </li>
              <li>
                {formatNumber(this.archonanalysis.perfectedFormSalv)}
                {' ('}
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(this.archonanalysis.perfectedFormSalv),
                )}
                %) from <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT} />
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.PERFECTED_FORM_TALENT}>
          <ItemPercentHealingDone amount={this.archonanalysis.passPerfectedFormHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PerfectedFormHoly;
