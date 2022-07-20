import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Example Report: https://www.warcraftlogs.com/reports/QDMVJtvnBz43NZLk/#fight=2&source=1
 */

class MasterOfTheGlaives extends Analyzer {
  slows = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_OF_THE_GLAIVE_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.MASTER_OF_THE_GLAIVE_DEBUFF),
      this.countingSlows,
    );
  }

  countingSlows(event) {
    this.slows += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="small"
      >
        <BoringSpellValueText spellId={SPELLS.MASTER_OF_THE_GLAIVE_TALENT.id}>
          {this.slows} <small>slows provided</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MasterOfTheGlaives;
