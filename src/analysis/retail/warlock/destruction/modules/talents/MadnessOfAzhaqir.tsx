import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TalentSpellText from 'parser/ui/TalentSpellText';

class MadnessOfAzhaqir extends Analyzer {
  static talent = TALENTS.MADNESS_OF_THE_AZJAQIR_TALENT;
  static buffId = SPELLS.MADNESS_OF_AZHAQIR_BUFF.id;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(MadnessOfAzhaqir.talent);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(MadnessOfAzhaqir.buffId) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE()}>
        <TalentSpellText talent={MadnessOfAzhaqir.talent}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MadnessOfAzhaqir;
