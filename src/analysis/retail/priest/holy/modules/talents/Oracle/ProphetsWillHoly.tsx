import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import { TALENTS_PRIEST } from 'common/TALENTS';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { PROPHETS_WILL_AMP, PROPHETS_WILL_SPELLS_HOLY } from '../../../constants';

class ProphetsWillHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  //write a function to change this variable to reuse for disc
  private spells_list = PROPHETS_WILL_SPELLS_HOLY;

  healingFromProphetsWill = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PROPHETS_WILL_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).to(SELECTED_PLAYER).spell(this.spells_list),
      this.handleSelfHeal,
    );
  }

  handleSelfHeal(event: HealEvent) {
    this.healingFromProphetsWill += calculateEffectiveHealing(event, PROPHETS_WILL_AMP);
    return;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.PROPHETS_WILL_TALENT}>
          <div>
            <ItemPercentHealingDone amount={this.healingFromProphetsWill} />
            <small>{' amped healing'}</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ProphetsWillHoly;
