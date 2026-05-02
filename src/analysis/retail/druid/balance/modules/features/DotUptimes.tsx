import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import UptimeMultiBarStatistic from 'parser/ui/UptimeMultiBarStatistic';

import MoonfireUptime from 'analysis/retail/druid/balance/modules/spells/MoonfireUptime';
import SunfireUptime from 'analysis/retail/druid/balance/modules/spells/SunfireUptime';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';

/**
 * Wide statistics box for tracking the most important Balance DoT uptimes
 */
class DotUptimes extends Analyzer {
  static dependencies = {
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
  };

  protected moonfireUptime!: MoonfireUptime;
  protected sunfireUptime!: SunfireUptime;

  get guideSubsection() {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.MOONFIRE_CAST} />
        </b>{' '}
        and{' '}
        <b>
          <SpellLink spell={SPELLS.SUNFIRE} />
        </b>{' '}
        are high damage-per-cast-time DoTs that synergize well with many talents like{' '}
        <SpellLink spell={TALENTS_DRUID.SHOOTING_STARS_TALENT} />. Maintaining 100% uptime is your
        highest priority.
      </p>
    );

    const data = (
      <RoundedPanel>
        <strong>DoT Uptimes</strong>
        {this.moonfireUptime.subStatistic()}
        {this.sunfireUptime.subStatistic()}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  get guideSubsectionV2() {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.MOONFIRE_CAST} />
        </b>{' '}
        and{' '}
        <b>
          <SpellLink spell={SPELLS.SUNFIRE} />
        </b>{' '}
        are high damage-per-cast-time DoTs that synergize well with many talents like{' '}
        <SpellLink spell={TALENTS_DRUID.SHOOTING_STARS_TALENT} />. Maintaining 100% uptime is your
        highest priority, even if some fights have unavoidable downtime (e.g. phase transitions).
      </p>
    );

    const data = (
      <RoundedPanel>
        {this.moonfireUptime.subStatisticV2()}
        {this.sunfireUptime.subStatistic()}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <UptimeMultiBarStatistic
        title={
          <>
            <UptimeIcon /> DoT Uptimes
          </>
        }
        position={STATISTIC_ORDER.CORE(1)}
        tooltip={<>These uptime bars show the times your DoT was active on at least one target.</>}
      >
        {this.moonfireUptime.subStatistic()}
        {this.sunfireUptime.subStatistic()}
      </UptimeMultiBarStatistic>
    );
  }
}

export default DotUptimes;
