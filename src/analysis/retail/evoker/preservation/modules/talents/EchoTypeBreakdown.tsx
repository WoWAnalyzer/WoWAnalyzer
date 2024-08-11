import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SPELL_COLORS } from '../../constants';
import { isFromTAEcho } from '../../normalizers/EventLinking/helpers';
import Events, { ApplyBuffEvent } from 'parser/core/Events';

class EchoTypeBreakdown extends Analyzer {
  hardcastCount: number = 0;
  rsCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ECHO_TALENT),
      this.onEchoApply,
    );
  }

  onEchoApply(event: ApplyBuffEvent) {
    if (isFromTAEcho(event)) {
      this.rsCount += 1;
    } else {
      this.hardcastCount += 1;
    }
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.ECHO,
        label: 'Echo Hardcast',
        spellId: TALENTS_EVOKER.ECHO_TALENT.id,
        value: this.hardcastCount,
        valueTooltip: this.hardcastCount,
      },
    ];

    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)) {
      items.push({
        color: SPELL_COLORS.TA_ECHO,
        label: 'Temporal Anomaly Echo',
        spellId: TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id,
        value: this.rsCount,
        valueTooltip: this.rsCount,
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
            <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> source breakdown
          </label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default EchoTypeBreakdown;
