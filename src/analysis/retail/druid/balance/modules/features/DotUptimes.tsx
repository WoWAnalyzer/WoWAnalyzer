import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import UptimeMultiBarStatistic from 'parser/ui/UptimeMultiBarStatistic';

import MoonfireUptime from 'analysis/retail/druid/balance/modules/spells/MoonfireUptime';
import SunfireUptime from 'analysis/retail/druid/balance/modules/spells/SunfireUptime';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { ResourceLink, SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

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
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.MOONFIRE_CAST} />
          </b>{' '}
          and{' '}
          <b>
            <SpellLink spell={SPELLS.SUNFIRE} />
          </b>{' '}
          are high damage-per-cast-time DoTs that synergize well with many talents like{' '}
          <SpellLink spell={TALENTS_DRUID.SHOOTING_STARS_TALENT} />.
        </p>
        <ul>
          <li>
            <strong>Priority:</strong> Maintain 100% uptime, but only if the target will live long
            enough for the DoT to deal more damage than a cast of <SpellLink spell={SPELLS.WRATH} />{' '}
            or <SpellLink spell={SPELLS.STARFIRE} />.
          </li>
          <li>
            <strong>Efficiency:</strong> Refresh during the Pandemic window (last 30%) to extend the
            duration without wasting Global Cooldowns. A low useful casts score (widgets on the
            right) is often a symptom of useless DoTs spammed during movement phases. Try to pool{' '}
            <ResourceLink id={RESOURCE_TYPES.ASTRAL_POWER.id} /> beforehand and cast{' '}
            <SpellLink spell={TALENTS_DRUID.STARSURGE_SHARED_TALENT} /> or{' '}
            <SpellLink spell={SPELLS.STARFALL_CAST} /> while moving.
          </li>
          <li>
            <strong>Uptime benchmark:</strong> Total uptime often drops during transitions or
            intermissions. Use top-ranking reports as a benchmark for what is realistic on a
            per-fight basis.
          </li>
        </ul>
      </>
    );

    const data = (
      <div>
        <RoundedPanel>{this.moonfireUptime.subStatisticV2()}</RoundedPanel>
        <div className="row" style={{ height: '20px' }} />
        <RoundedPanel>{this.sunfireUptime.subStatisticV2()}</RoundedPanel>
      </div>
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
