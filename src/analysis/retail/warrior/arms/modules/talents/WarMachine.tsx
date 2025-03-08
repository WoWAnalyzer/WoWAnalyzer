import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Your auto attacks generate 10% more Rage.
 *
 * Killing an enemy instantly generates 10 Rage, and increases your movement speed by 30% for 8 sec.
 */

class WarMachine extends Analyzer {
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.WAR_MACHINE_TALENT_BUFF.id) /
      this.owner.fightDuration
    );
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_TALENT);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={
          <>
            <SpellLink spell={TALENTS.WAR_MACHINE_TALENT} /> uptime
          </>
        }
        value={`${formatPercentage(this.uptime)} %`}
      />
    );
  }
}

export default WarMachine;
