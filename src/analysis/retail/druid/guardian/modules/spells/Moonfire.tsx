import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const MF_COLOR = '#22aaff';

const deps = {
  enemies: Enemies,
};

export default class Moonfire extends Analyzer.withDependencies(deps) {
  get guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.MOONFIRE_CAST} />
        </strong>{' '}
        is a DoT that can be applied to any number of targets. It's worth maintaining full uptime on
        low target counts.
      </p>
    );

    const history = this.deps.enemies.getDebuffHistory(SPELLS.MOONFIRE_DEBUFF.id);
    const uptimeBar = uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.MOONFIRE_DEBUFF],
      uptimes: history,
      color: MF_COLOR,
    });
    const data = (
      <div>
        <RoundedPanel>
          <strong>Moonfire uptimes</strong>
          {uptimeBar}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  get uptime() {
    return this.deps.enemies.getBuffUptime(SPELLS.MOONFIRE_DEBUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        tooltip={
          <>
            Your <strong>Moonfire</strong> uptime is{' '}
            <strong>{`${formatPercentage(this.uptime)}%`}</strong>
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.MOONFIRE_DEBUFF} /> Moonfire uptime{' '}
            </>
          }
        >
          {`${formatPercentage(this.uptime)}%`}
        </BoringValueText>
      </Statistic>
    );
  }
}
