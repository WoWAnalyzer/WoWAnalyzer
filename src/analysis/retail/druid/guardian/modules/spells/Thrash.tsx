import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

const deps = {
  enemies: Enemies,
};

export default class Thrash extends Analyzer.withDependencies(deps) {
  get guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.THRASH_BEAR} />
        </strong>{' '}
        is AoE direct damage and a stacking bleed. It generates rage and should be used on cooldown.
        The very short cooldown combined with jammed GCDs means 100% usage will be practically
        impossible, but get as close as you can.
      </p>
    );

    const data = <CastEfficiencyPanel spell={SPELLS.THRASH_BEAR} useThresholds />;

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    const thrashUptimePercentage =
      this.deps.enemies.getBuffUptime(SPELLS.THRASH_BEAR_DOT.id) / this.owner.fightDuration;

    return (
      <Statistic position={STATISTIC_ORDER.CORE(11)} size="flexible">
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.THRASH_BEAR} /> Thrash uptime{' '}
            </>
          }
        >
          {`${formatPercentage(thrashUptimePercentage)}%`}
        </BoringValueText>
      </Statistic>
    );
  }
}
