import Analyzer from 'parser/core/Analyzer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import EarlyDotRefreshesInstants from 'analysis/retail/druid/balance/modules/features/EarlyDotRefreshesInstants';
import SPELLS from 'common/SPELLS';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { SpellLink } from 'interface';

/**
 * Wide statistics box for tracking the most important Balance DoT uptimes
 */
class DotRefresh extends Analyzer {
  static dependencies = {
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,
  };

  protected earlyDotRefreshesInstants!: EarlyDotRefreshesInstants;

  get guideSubsection() {
    const explanation = (
      <p>
        Apply <SpellLink spell={SPELLS.MOONFIRE_CAST} /> and{' '}
        <SpellLink spell={SPELLS.SUNFIRE_CAST} /> on targets missing the DoT or within the pandemic
        window (30% of its duration) to avoid wasting GCDs.
      </p>
    );

    const moonfireTotalCasts =
      this.earlyDotRefreshesInstants.casts[SPELLS.MOONFIRE_CAST.id].totalCasts;
    const moonfireBadCasts = this.earlyDotRefreshesInstants.casts[SPELLS.MOONFIRE_CAST.id].badCasts;

    const goodMoonfireData = {
      count: moonfireTotalCasts - moonfireBadCasts,
      label: 'Moonfires on target lacking the DoT or within the Pandemic window',
    };
    const badMoonfireData = {
      count: moonfireBadCasts,
      label: 'Moonfires overwritten outside the pandemic window',
    };

    const sunfireTotalCasts =
      this.earlyDotRefreshesInstants.casts[SPELLS.SUNFIRE_CAST.id].totalCasts;
    const sunfireBadCasts = this.earlyDotRefreshesInstants.casts[SPELLS.SUNFIRE_CAST.id].badCasts;

    const goodSunfireData = {
      count: sunfireTotalCasts - sunfireBadCasts,
      label: 'Sunfires on target lacking the DoT or within the Pandemic window',
    };
    const badSunfireData = {
      count: sunfireBadCasts,
      label: 'Sunfires overwritten outside the pandemic window',
    };

    const data = (
      <RoundedPanel>
        <p>
          <strong>DoT Refreshes - </strong>{' '}
          <small>
            {' '}
            Green is a good cast (missing DoT or within the Pandemic window), Red is a bad cast
            (existing DoT overwritten). Mouseover for more details.
          </small>
        </p>
        <p>
          <big>
            <SpellLink spell={SPELLS.MOONFIRE_CAST} />
          </big>
          <GradiatedPerformanceBar good={goodMoonfireData} bad={badMoonfireData} />
        </p>
        <p>
          <big>
            <SpellLink spell={SPELLS.SUNFIRE_CAST} />
          </big>
          <GradiatedPerformanceBar good={goodSunfireData} bad={badSunfireData} />
        </p>
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  // statistic() {
  //   return (
  //     <UptimeMultiBarStatistic
  //       title={
  //         <>
  //           <UptimeIcon /> DoT Uptimes
  //         </>
  //       }
  //       position={STATISTIC_ORDER.CORE(1)}
  //       tooltip={<>These uptime bars show the times your DoT was active on at least one target.</>}
  //     >
  //     </UptimeMultiBarStatistic>
  //   );
  // }
}

export default DotRefresh;
