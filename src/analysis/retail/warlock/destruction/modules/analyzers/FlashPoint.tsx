import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * When your Immolate deals periodic damage to a target above 80% health, gain 2% Haste for 10 sec.
 */
class FlashPoint extends Analyzer {
  static talent = TALENTS.FLASHPOINT_TALENT;
  static buffId = SPELLS.FLASHPOINT_BUFF.id;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(FlashPoint.talent);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(FlashPoint.buffId) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={FlashPoint.talent}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FlashPoint;
