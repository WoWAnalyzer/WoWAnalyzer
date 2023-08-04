import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events, { HealEvent } from 'parser/core/Events';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { EFFECTS_INCREASED_BY_BENEVOLENCE_DISCIPLINE } from '../discipline/constants';
import { EFFECTS_INCREASED_BY_BENEVOLENCE_HOLY } from '../holy/constants';

const BENEVOLENCE_INCREASE = 0.03;

class Benevolence extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.BENEVOLENCE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (
      !EFFECTS_INCREASED_BY_BENEVOLENCE_DISCIPLINE.includes(event.ability.guid) &&
      !EFFECTS_INCREASED_BY_BENEVOLENCE_HOLY.includes(event.ability.guid)
    ) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, BENEVOLENCE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(15)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_PRIEST.BENEVOLENCE_TALENT}>
          <>
            <ItemHealingDone amount={this.healing} /> <br />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Benevolence;
