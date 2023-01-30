import { formatNumber } from 'common/format';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SPELL_COLORS } from '../../constants';
import Echo from './Echo';

class ResonatingSphere extends Analyzer {
  static dependencies = {
    echo: Echo,
  };
  protected echo!: Echo;
  taEchoEnabled: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT);
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.ECHO,
        label: 'Echo Hardcast',
        spellId: TALENTS_EVOKER.ECHO_TALENT.id,
        value: this.echo.totalHardcastEchoHealing,
        valueTooltip: formatNumber(this.echo.totalHardcastEchoHealing),
      },
    ];

    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)) {
      items.push({
        color: SPELL_COLORS.TA_ECHO,
        label: 'Temporal Anomaly Echo',
        spellId: TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id,
        value: this.echo.totalTaEchoHealing,
        valueTooltip: formatNumber(this.echo.totalTaEchoHealing),
      });
    }
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink id={TALENTS_EVOKER.ECHO_TALENT} /> healing breakdown by type
          </label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default ResonatingSphere;
