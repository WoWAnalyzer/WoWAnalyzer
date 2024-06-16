import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options } from 'parser/core/Analyzer';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SPELL_COLORS } from '../../constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
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

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT} />
        </b>{' '}
        is a powerful AoE projectile that shields all allies it passes through. When not playing an{' '}
        <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> focused build, you should aim to cast it at
        least once every 20 seconds to spread <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        useThresholds
      />
    );
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
            <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> healing breakdown by type
          </label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default ResonatingSphere;
