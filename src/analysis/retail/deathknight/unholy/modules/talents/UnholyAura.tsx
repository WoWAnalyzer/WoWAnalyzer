import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Haste from 'parser/shared/modules/Haste';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import HasteIcon from 'interface/icons/Haste';
import TalentSpellText from 'parser/ui/TalentSpellText';

class UnholyAura extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;
  hastePerStack = 0;

  constructor(options: Options) {
    super(options);

    this.haste = options.haste as Haste;
    const rank = this.selectedCombatant.getTalentRank(TALENTS.UNHOLY_AURA_TALENT);
    this.active = rank > 0;
    if (!this.active) {
      return;
    }
    this.hastePerStack = rank * 0.01;

    this.haste.addHasteBuff(SPELLS.UNHOLY_AURA_BUFF.id, {
      hastePerStack: this.hastePerStack,
    });
  }

  get stackUptimes(): Record<number, number> {
    return this.selectedCombatant.getStackBuffUptimes(SPELLS.UNHOLY_AURA_BUFF.id);
  }

  get averageStacks() {
    return (
      this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.UNHOLY_AURA_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get averageHaste() {
    return this.averageStacks * this.hastePerStack * 100;
  }

  get uptimePercent() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.UNHOLY_AURA_BUFF.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Stacks</th>
                <th>Time (s)</th>
                <th>Time (%)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(this.stackUptimes)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([stacks, totalTime]) => {
                  if (totalTime === 0) {
                    return null;
                  }
                  return (
                    <tr key={stacks}>
                      <th>{stacks}</th>
                      <td>{formatDuration(totalTime)}</td>
                      <td>{formatPercentage(totalTime / this.owner.fightDuration)}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        }
      >
        <TalentSpellText talent={TALENTS.UNHOLY_AURA_TALENT}>
          <div>
            <HasteIcon /> {this.averageHaste.toFixed(2)}% <small>average haste gained</small>
          </div>
          <div>
            {formatPercentage(this.uptimePercent, 0)}% <small>uptime</small>
          </div>
          <div>
            {this.averageStacks.toFixed(1)} <small>average stacks</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default UnholyAura;
