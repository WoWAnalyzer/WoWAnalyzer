import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { PRISMATIC_ECHOES_PER_RANK } from '../../../constants';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

class PrismaticEchoes extends Analyzer {
  private peMod = 0;
  private peTotal = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PRISMATIC_ECHOES_TALENT);
    this.peMod +=
      this.selectedCombatant.getTalentRank(TALENTS_PRIEST.PRISMATIC_ECHOES_TALENT) *
      PRISMATIC_ECHOES_PER_RANK;

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ECHO_OF_LIGHT_HEAL),
      this.eolHeal,
    );
  }

  eolHeal(event: HealEvent) {
    this.peTotal += calculateEffectiveHealing(event, this.peMod);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_PRIEST.PRISMATIC_ECHOES_TALENT}>
          <ItemPercentHealingDone amount={this.peTotal} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PrismaticEchoes;
