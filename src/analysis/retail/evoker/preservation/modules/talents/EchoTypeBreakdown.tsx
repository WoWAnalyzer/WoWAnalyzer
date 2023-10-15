import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SPELL_COLORS } from '../../constants';
import Echo from './Echo';
import { TIERS } from 'game/TIERS';
import T31PrevokerSet from '../dragonflight/tier/T31TierSet';
import { isEchoFromT314PC, isFromTAEcho } from '../../normalizers/CastLinkNormalizer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';

class EchoTypeBreakdown extends Analyzer {
  static dependencies = {
    echo: Echo,
    t31: T31PrevokerSet,
  };
  protected echo!: Echo;
  protected t31!: T31PrevokerSet;
  tierCount: number = 0;
  hardcastCount: number = 0;
  rsCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT) ||
      this.selectedCombatant.has4PieceByTier(TIERS.T31);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ECHO_TALENT),
      this.onEchoApply,
    );
  }

  onEchoApply(event: ApplyBuffEvent) {
    if (isFromTAEcho(event)) {
      this.rsCount += 1;
    } else if (isEchoFromT314PC(event)) {
      this.tierCount += 1;
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
    if (this.selectedCombatant.has4PieceByTier(TIERS.T31)) {
      items.push({
        color: SPELL_COLORS.VERDANT_EMBRACE,
        label: 'Echo from T31 4PC',
        spellId: SPELLS.LIVING_FLAME_CAST.id,
        value: this.tierCount,
        valueTooltip: this.tierCount,
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
