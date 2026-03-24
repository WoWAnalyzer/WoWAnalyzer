import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import { Options } from 'parser/core/Module';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TALENTS_PRIEST } from 'common/TALENTS';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

class PreemptiveCareHoly extends Analyzer {
  protected combatants!: Combatants;
  attribution: Attribution = HotTracker.getNewAttribution('Preemptive Care');

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PREEMPTIVE_CARE_TALENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_PRIEST.PREEMPTIVE_CARE_TALENT}>
          <ItemPercentHealingDone amount={this.attribution.healing} /> <br />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PreemptiveCareHoly;
