import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Example Report: https://www.warcraftlogs.com/reports/QDMVJtvnBz43NZLk/#fight=2&source=1
 */

class MasterOfTheGlaives extends Analyzer {
  slows = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_OF_THE_GLAIVE_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.MASTER_OF_THE_GLAIVE_DEBUFF),
      this.countingSlows,
    );
  }

  countingSlows(event: ApplyDebuffEvent) {
    this.slows += 1;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spellId={SPELLS.MASTER_OF_THE_GLAIVE_TALENT.id}>
          <>
            {this.slows} <small>slows provided</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MasterOfTheGlaives;
