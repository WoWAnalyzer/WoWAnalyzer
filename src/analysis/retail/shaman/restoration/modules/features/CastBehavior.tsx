import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticGroup from 'parser/ui/StatisticGroup';

import { RESTORATION_COLORS } from '../../constants';
import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

class CastBehavior extends Analyzer {
  static dependencies = {
    abilityTracker: RestorationAbilityTracker,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TIDAL_WAVES_TALENT);
  }

  protected abilityTracker!: RestorationAbilityTracker;

  get twUsageRatioChart() {
    const riptide = this.abilityTracker.getAbility(TALENTS.RIPTIDE_TALENT.id);
    const healingWave = this.abilityTracker.getAbility(TALENTS.HEALING_WAVE_TALENT.id);
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE.id);
    const chainHeal = this.abilityTracker.getAbility(TALENTS.CHAIN_HEAL_TALENT.id);

    const riptideCasts = riptide.casts || 0;
    const totalTwGenerated = riptideCasts * 2;
    const twHealingWaves = healingWave.healingTwHits || 0;
    const twHealingSurges = healingSurge.healingTwHits || 0;
    const twChainHeals = chainHeal.healingTwHits || 0;

    const totalTwUsed = twHealingWaves + twHealingSurges + twChainHeals;
    const unusedTw = totalTwGenerated - totalTwUsed;

    const items = [
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <>Healing Wave</>,
        spellId: TALENTS.HEALING_WAVE_TALENT.id,
        value: twHealingWaves,
      },
      {
        color: RESTORATION_COLORS.HEALING_SURGE,
        label: <>Healing Surge</>,
        spellId: SPELLS.HEALING_SURGE.id,
        value: twHealingSurges,
      },
      {
        color: RESTORATION_COLORS.CHAIN_HEAL,
        label: <>Chain Heal</>,
        spellId: TALENTS.CHAIN_HEAL_TALENT.id,
        value: twChainHeals,
      },
      {
        color: RESTORATION_COLORS.UNUSED,
        label: <>Unused Tidal Waves</>,
        tooltip: (
          <>
            The amount of Tidal Waves you did not use out of the total available. You cast{' '}
            {riptideCasts} Riptides which gave you {totalTwGenerated} Tidal Waves charges, of which
            you used ${totalTwUsed}.
          </>
        ),
        value: unusedTw,
      },
    ];

    return <DonutChart items={items} />;
  }

  get fillerCastRatioChart() {
    const healingWave = this.abilityTracker.getAbility(TALENTS.HEALING_WAVE_TALENT.id);
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE.id);
    const twHealingWaves = healingWave.healingTwHits || 0;
    const twHealingSurges = healingSurge.healingTwHits || 0;

    const healingWaveHeals = healingWave.casts || 0;
    const healingSurgeHeals = healingSurge.casts || 0;
    const fillerHealingWaves = healingWaveHeals - twHealingWaves;
    const fillerHealingSurges = healingSurgeHeals - twHealingSurges;

    const items = [
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <>Healing Wave</>,
        spellId: TALENTS.HEALING_WAVE_TALENT.id,
        value: fillerHealingWaves,
      },
      {
        color: RESTORATION_COLORS.HEALING_SURGE,
        label: <>Healing Surge</>,
        spellId: SPELLS.HEALING_SURGE.id,
        value: fillerHealingSurges,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.GENERAL} large={false} wide={false} style={{}}>
        <Statistic ultrawide size="flexible">
          <div className="pad">
            <label>
              <>
                <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> usage
              </>
            </label>
            {this.twUsageRatioChart}
          </div>
        </Statistic>
        <Statistic ultrawide>
          <div className="pad">
            <label>
              <>Fillers</>
            </label>
            {this.fillerCastRatioChart}
          </div>
        </Statistic>
      </StatisticGroup>
    );
  }
}

export default CastBehavior;
