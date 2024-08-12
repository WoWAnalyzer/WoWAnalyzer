import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class DeeperDaggers extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEEPER_DAGGERS_TALENT);
  }

  get percentUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.DEEPER_DAGGERS_BUFF.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.DEEPER_DAGGERS_TALENT} /> Uptime
          </label>
          <div className="value">{formatPercentage(this.percentUptime)}%</div>
        </div>
      </Statistic>
    );
  }
}

export default DeeperDaggers;
