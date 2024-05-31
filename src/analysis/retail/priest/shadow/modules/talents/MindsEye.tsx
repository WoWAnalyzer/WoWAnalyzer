import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import InsanityIcon from 'interface/icons/Insanity';

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

  onDevouringPlague(event: CastEvent) {
    const resource = event.classResources?.at(0)?.cost; //Some buffs grant free Devouring Plagues, which do not have a resource cost
    if (resource !== undefined) {
      //If devouring Plague is free, then we have not saved the extra insanity
      this.insanitySaved += 5;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Amount of Insanity saved due to cost reduction"
      >
        <BoringSpellValueText spell={TALENTS.MINDS_EYE_TALENT}>
          <div>
            <InsanityIcon /> {formatNumber(this.insanitySaved)} <small> Insanity Saved</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MindsEye;
