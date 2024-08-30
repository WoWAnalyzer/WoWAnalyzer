import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, Tooltip } from 'interface';
import { PassFailCheckmark } from 'interface/guide';
import InformationIcon from 'interface/icons/Information';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';

import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';
import { getTranquilityTicks } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const MAX_TRANQ_TICKS = 5;

/**
 * Tracks stats relating to Tranquility
 */
class Tranquility extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
  };

  hotTracker!: HotTrackerRestoDruid;

  tranqCasts: TranquilityCast[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_CAST),
      this.onTranqCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_HEAL),
      this.onTranqHeal,
    );
  }

  onTranqCast(event: CastEvent) {
    const directHealing = 0;
    const periodicHealing = 0;
    const rejuvsOnCast =
      this.hotTracker.getHotCount(SPELLS.REJUVENATION.id) +
      this.hotTracker.getHotCount(SPELLS.REJUVENATION_GERMINATION.id);
    const wgsOnCast = this.hotTracker.getHotCount(SPELLS.WILD_GROWTH.id);
    const timestamp = event.timestamp;
    const channeledTicks = getTranquilityTicks(event).length;
    this.tranqCasts.push({
      timestamp,
      directHealing,
      periodicHealing,
      wgsOnCast,
      rejuvsOnCast,
      channeledTicks,
    });
  }

  onTranqHeal(event: HealEvent) {
    const effectiveAmount = event.amount + (event.absorbed || 0);
    if (this.tranqCasts.length > 0) {
      if (event.tick) {
        this.tranqCasts[this.tranqCasts.length - 1].periodicHealing += effectiveAmount;
      } else {
        this.tranqCasts[this.tranqCasts.length - 1].directHealing += effectiveAmount;
      }
    }
  }

  /** Guide fragment showing a breakdown of each Tranquility cast */
  get guideCastBreakdown() {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.TRANQUILITY_CAST} />
          </strong>{' '}
          is the most independent of your cooldowns, and the one most likely to be assigned
          explicitly by your raid leader. It should typically be planned for a specific mechanic.
        </p>
        <p>
          The vast majority of Tranquility's healing is direct and not from the HoT. Do NOT use the
          HoT to ramp. Watch your positioning when you cast - you want to be able to channel full
          duration without moving.
        </p>
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.tranqCasts.map((cast, ix) => {
          const castTotalHealing = cast.directHealing + cast.periodicHealing;
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={SPELLS.TRANQUILITY_CAST} /> ({formatNumber(castTotalHealing)}{' '}
              healing)
            </>
          );

          const wgRamp = cast.wgsOnCast > 0;
          const rejuvRamp = cast.rejuvsOnCast > 0;
          const channeledMaxTicks = cast.channeledTicks === MAX_TRANQ_TICKS;
          const overallPerf =
            wgRamp && rejuvRamp && channeledMaxTicks
              ? QualitativePerformance.Good
              : QualitativePerformance.Fail;

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: (
              <>
                <SpellLink spell={SPELLS.WILD_GROWTH} /> ramp
              </>
            ),
            result: <PassFailCheckmark pass={wgRamp} />,
            details: <>({cast.wgsOnCast} HoTs active)</>,
          });
          checklistItems.push({
            label: (
              <>
                <SpellLink spell={SPELLS.REJUVENATION} /> ramp
              </>
            ),
            result: <PassFailCheckmark pass={rejuvRamp} />,
            details: <>({cast.rejuvsOnCast} HoTs active)</>,
          });
          checklistItems.push({
            label: (
              <>
                Channeled full duration{' '}
                <Tooltip
                  hoverable
                  content={
                    <>
                      Every tick of Tranquility is very powerful - plan ahead so you're in a
                      position to channel it for its full duration, and be careful not to clip ticks
                      at the end.
                    </>
                  }
                >
                  <span>
                    <InformationIcon />
                  </span>
                </Tooltip>
              </>
            ),
            result: <PassFailCheckmark pass={channeledMaxTicks} />,
            details: (
              <>
                ({cast.channeledTicks} / {MAX_TRANQ_TICKS} ticks)
              </>
            ),
          });

          const detailItems: CooldownExpandableItem[] = [];
          detailItems.push({
            label: 'Direct Healing',
            result: '',
            details: <>{formatNumber(cast.directHealing)}</>,
          });
          detailItems.push({
            label: 'Periodic Healing',
            result: '',
            details: <>{formatNumber(cast.periodicHealing)}</>,
          });

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              detailItems={detailItems}
              perf={overallPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

interface TranquilityCast {
  /** Timestamp of the start of the Tranquility channel */
  timestamp: number;
  /** The healing from this cast's direct portion */
  directHealing: number;
  /** The healing from this cast's HoTs */
  periodicHealing: number;
  /** The number of Wild Growths out at the moment this Convoke is cast */
  wgsOnCast: number;
  /** The number of Rejuvs out at the moment this Convoke is cast */
  rejuvsOnCast: number;
  /** The number of ticks that were channeled in this cast */
  channeledTicks: number;
}

export default Tranquility;
