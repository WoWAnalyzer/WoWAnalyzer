import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';

class MindsEye extends Analyzer {
  insanitySaved = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MINDS_EYE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onDevouringPlague,
    );
  }

  onDevouringPlague() {
    this.insanitySaved += 5;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Amount of Insanity Saved"
      >
        <BoringSpellValueText spell={TALENTS.MINDS_EYE_TALENT}>
          <div>
            <ItemInsanityGained amount={this.insanitySaved} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MindsEye;
