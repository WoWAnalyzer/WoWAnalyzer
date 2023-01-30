import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * Example Report: https://www.warcraftlogs.com/reports/QDMVJtvnBz43NZLk/#fight=2&source=1
 */

class MasterOfTheGlaive extends Analyzer {
  slows = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_DEMON_HUNTER.MASTER_OF_THE_GLAIVE_TALENT,
    );
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.MASTER_OF_THE_GLAIVE_DEBUFF),
      this.countingSlows,
    );
  }

  countingSlows(_: ApplyDebuffEvent) {
    this.slows += 1;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.MASTER_OF_THE_GLAIVE_TALENT}>
          {this.slows} <small>slows provided</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MasterOfTheGlaive;
