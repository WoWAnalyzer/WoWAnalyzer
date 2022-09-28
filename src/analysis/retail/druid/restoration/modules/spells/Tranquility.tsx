import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, Tooltip } from 'interface';
import { PassFailCheckmark } from 'interface/guide';
import InformationIcon from 'interface/icons/Information';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';

import {
  CooldownExpandable,
  CooldownExpandableItem,
} from 'analysis/retail/druid/restoration/Guide';
import { getTranquilityTicks } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';

export const MAX_TRANQ_TICKS = 5;

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
    return (
      <>
        <strong>
          <SpellLink id={SPELLS.TRANQUILITY_CAST.id} />
        </strong>{' '}
        is the most independent of your cooldowns, and the one most likely to be assigned explicitly
        by your raid leader. It should typically be planned for a specific mechanic. The vast
        majority of Tranquility's healing is direct and not from the HoT. Do NOT use the HoT to
        ramp. Watch your positioning when you cast - you want to be able to channel full duration
        without moving.
        <p />
        {this.tranqCasts.map((cast, ix) => {
          const castTotalHealing = cast.directHealing + cast.periodicHealing;
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={SPELLS.TRANQUILITY_CAST.id} /> ({formatNumber(castTotalHealing)}{' '}
              healing)
            </>
          );

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: (
              <>
                <SpellLink id={SPELLS.WILD_GROWTH.id} /> ramp
              </>
            ),
            result: <PassFailCheckmark pass={cast.wgsOnCast > 0} />,
            details: <>({cast.wgsOnCast} HoTs active)</>,
          });
          checklistItems.push({
            label: (
              <>
                <SpellLink id={SPELLS.REJUVENATION.id} /> ramp
              </>
            ),
            result: <PassFailCheckmark pass={cast.rejuvsOnCast > 0} />,
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
            result: <PassFailCheckmark pass={cast.channeledTicks === MAX_TRANQ_TICKS} />,
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
              key={ix}
            />
          );
        })}
        <p />
      </>
    );
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
