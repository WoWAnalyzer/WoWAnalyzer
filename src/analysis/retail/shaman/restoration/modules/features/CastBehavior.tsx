import { Trans } from '@lingui/react/macro';
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
    this.active = false;
  }

  protected abilityTracker!: RestorationAbilityTracker;

  get twUsageRatioChart() {
    const riptide = this.abilityTracker.getAbility(TALENTS.RIPTIDE_TALENT.id);
    const healingWave = this.abilityTracker.getAbility(SPELLS.HEALING_WAVE.id);
    const chainHeal = this.abilityTracker.getAbility(TALENTS.CHAIN_HEAL_TALENT.id);

    const riptideCasts = riptide.casts || 0;
    const totalTwGenerated = riptideCasts * 2;
    const twHealingWaves = healingWave.healingTwHits || 0;
    const twChainHeals = chainHeal.healingTwHits || 0;

    const totalTwUsed = twHealingWaves + twChainHeals;
    const unusedTw = totalTwGenerated - totalTwUsed;

    const items = [
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: SPELLS.HEALING_WAVE.id,
        value: twHealingWaves,
      },
      {
        color: RESTORATION_COLORS.CHAIN_HEAL,
        label: <Trans id="shaman.restoration.spell.chainHeal">Chain Heal</Trans>,
        spellId: TALENTS.CHAIN_HEAL_TALENT.id,
        value: twChainHeals,
      },
      {
        color: RESTORATION_COLORS.UNUSED,
        label: <Trans id="shaman.restoration.castBehaviour.unusedTW">Unused Tidal Waves</Trans>,
        tooltip: (
          <Trans id="shaman.restoration.castBehaviour.unusedTW.tooltip">
            The amount of Tidal Waves you did not use out of the total available. You cast{' '}
            {riptideCasts} Riptides which gave you {totalTwGenerated} Tidal Waves charges, of which
            you used {totalTwUsed}.
          </Trans>
        ),
        value: unusedTw,
      },
    ];

    return <DonutChart items={items} />;
  }

  get fillerCastRatioChart() {
    const healingWave = this.abilityTracker.getAbility(SPELLS.HEALING_WAVE.id);
    const twHealingWaves = healingWave.healingTwHits || 0;

    const healingWaveHeals = healingWave.casts || 0;
    const fillerHealingWaves = healingWaveHeals - twHealingWaves;

    const items = [
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: SPELLS.HEALING_WAVE.id,
        value: fillerHealingWaves,
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
              <Trans id="shaman.restoration.castBehaviour.statistic.tidalWaves">
                <SpellLink spell={SPELLS.TIDAL_WAVES_BUFF} /> usage
              </Trans>
            </label>
            {this.twUsageRatioChart}
          </div>
        </Statistic>
      </StatisticGroup>
    );
  }
}

export default CastBehavior;
