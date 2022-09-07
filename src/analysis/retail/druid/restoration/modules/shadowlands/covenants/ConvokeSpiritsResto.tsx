import { ConvokeSpirits } from 'analysis/retail/druid/shared';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink, Tooltip } from 'interface';
import { PassFailCheckmark } from 'interface/guide';
import InformationIcon from 'interface/icons/Information';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { CooldownExpandable, CooldownExpandableItem } from '../../../Guide';
import { isFromHardcast } from '../../../normalizers/CastLinkNormalizer';
import HotTrackerRestoDruid from '../../core/hottracking/HotTrackerRestoDruid';
import { MutableAmount } from '../../talents/Flourish';

const CONVOKED_HOTS = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
  SPELLS.REGROWTH,
  SPELLS.WILD_GROWTH,
];
const CONVOKED_DIRECT_HEALS = [SPELLS.SWIFTMEND, SPELLS.REGROWTH];

const NATURES_SWIFTNESS_BOOST = 1;

const RECENT_FLOURISH_DURATION = 8_000;

/**
 * Resto's extension to the Convoke the Spirits display. Includes healing attribution.
 * Convokable healing abilities:
 * * Rejuvenation - track apply/refresh - use HotTracker
 * * Regrowth - track apply/refresh - use HotTracker
 * * Swiftmend - track heal - directly attribute healing
 * * Wild Growth - track apply/refresh - use HotTracker
 * * Flourish - track apply/refresh - use integration with Flourish module
 */
class ConvokeSpiritsResto extends ConvokeSpirits {
  static dependencies = {
    ...ConvokeSpirits.dependencies,
    hotTracker: HotTrackerRestoDruid,
  };

  hotTracker!: HotTrackerRestoDruid;

  /** Mapping from convoke cast number to a tracker for that cast - note that index zero will always be empty */
  restoConvokeTracker: RestoConvokeCast[] = [];
  /** Timestamp of the last Flourish cast (or null if there wasn't one) */
  lastFlourishTimestamp?: number;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(CONVOKED_HOTS),
      this.onRestoHotApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(CONVOKED_HOTS),
      this.onRestoHotApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(CONVOKED_DIRECT_HEALS),
      this.onRestoDirectHeal,
    );
    this.selectedCombatant.hasTalent(SPELLS.FLOURISH_TALENT) &&
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLOURISH_TALENT),
        this.onFlourishCast,
      );

    // Flourish healing is tracked from the Flourish module, which calls into this one to update
    // the attribution. The cast tracker is just for overlap detection.
  }

  onRestoHotApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!isFromHardcast(event) && this.isConvoking()) {
      this.hotTracker.addAttributionFromApply(this.currentConvokeAttribution, event);
      if (
        event.ability.guid === SPELLS.REGROWTH.id &&
        this.selectedCombatant.hasBuff(SPELLS.NATURES_SWIFTNESS.id)
      ) {
        this.hotTracker.addBoostFromApply(
          this.currentNsConvokeAttribution,
          NATURES_SWIFTNESS_BOOST,
          event,
        );
      }
    }
  }

  onRestoDirectHeal(event: HealEvent) {
    if (!isFromHardcast(event) && !event.tick && this.isConvoking()) {
      this.currentConvokeAttribution.healing += event.amount + (event.absorbed || 0);
      if (
        event.ability.guid === SPELLS.REGROWTH.id &&
        this.selectedCombatant.hasBuff(SPELLS.NATURES_SWIFTNESS.id)
      ) {
        this.currentNsConvokeAttribution.healing += calculateEffectiveHealing(
          event,
          NATURES_SWIFTNESS_BOOST,
        );
      }
    }
  }

  onConvoke(event: ApplyBuffEvent) {
    super.onConvoke(event);

    const totalAttribution = HotTracker.getNewAttribution('Convoke #' + this.cast);
    const flourishRateAttribution = { amount: 0 };
    const nsAttribution = HotTracker.getNewAttribution("Nature's Swiftness Convoke #" + this.cast);
    const rejuvsOnCast =
      this.hotTracker.getHotCount(SPELLS.REJUVENATION.id) +
      this.hotTracker.getHotCount(SPELLS.REJUVENATION_GERMINATION.id);
    const wgsOnCast = this.hotTracker.getHotCount(SPELLS.WILD_GROWTH.id);
    const recentlyFlourished =
      this.lastFlourishTimestamp !== undefined &&
      event.timestamp - this.lastFlourishTimestamp < RECENT_FLOURISH_DURATION;

    this.restoConvokeTracker[this.cast] = {
      totalAttribution,
      flourishRateAttribution,
      nsAttribution,
      rejuvsOnCast,
      wgsOnCast,
      recentlyFlourished,
    };
  }

  onFlourishCast(event: CastEvent) {
    this.lastFlourishTimestamp = event.timestamp;
  }

  get currentConvokeAttribution(): Attribution {
    return this.restoConvokeTracker[this.cast].totalAttribution;
  }

  get currentConvokeRateAttribution() {
    return this.restoConvokeTracker[this.cast].flourishRateAttribution;
  }

  get currentNsConvokeAttribution(): Attribution {
    return this.restoConvokeTracker[this.cast].nsAttribution;
  }

  get totalHealing(): number {
    return this.restoConvokeTracker.reduce(
      (sum, cast) => sum + cast.totalAttribution.healing + cast.flourishRateAttribution.amount,
      0,
    );
  }

  get convokeCount(): number {
    // attributions start indexed from 1
    return this.restoConvokeTracker.length - 1;
  }

  get totalNsConvokeHealing(): number {
    return this.restoConvokeTracker.reduce((sum, cast) => sum + cast.nsAttribution.healing, 0);
  }

  get nsBoostedConvokeRegrowthCount(): number {
    return this.restoConvokeTracker.reduce((sum, cast) => sum + cast.nsAttribution.procs, 0);
  }

  get nsBoostedConvokeCount(): number {
    return this.restoConvokeTracker.filter((cast) => cast.nsAttribution.healing !== 0).length;
  }

  /** Guide fragment showing a breakdown of each Convoke cast */
  get guideCastBreakdown() {
    return (
      <>
        <strong>
          <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} />
        </strong>{' '}
        is a powerful but somewhat random burst of healing with a decent chance of proccing{' '}
        <SpellLink id={SPELLS.FLOURISH_TALENT.id} />. Its short cooldown and random nature mean its
        best used as it becomes available. Lightly ramping for a Convoke is still worthwhile in case
        it procs Flourish.
        <p />
        {this.convokeTracker.map((cast, ix) => {
          const restoCast = this.restoConvokeTracker[ix];
          const castTotalHealing =
            restoCast.totalAttribution.healing + restoCast.flourishRateAttribution.amount;

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> ({formatNumber(castTotalHealing)}{' '}
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
            result: <PassFailCheckmark pass={restoCast.wgsOnCast > 0} />,
            details: <>({restoCast.wgsOnCast} HoTs active)</>,
          });
          checklistItems.push({
            label: (
              <>
                <SpellLink id={SPELLS.REJUVENATION.id} /> ramp
              </>
            ),
            result: <PassFailCheckmark pass={restoCast.rejuvsOnCast > 0} />,
            details: <>({restoCast.rejuvsOnCast} HoTs active)</>,
          });
          this.selectedCombatant.hasTalent(SPELLS.FLOURISH_TALENT.id) &&
            checklistItems.push({
              label: (
                <>
                  Avoid <SpellLink id={SPELLS.FLOURISH_TALENT.id} /> clip{' '}
                  <Tooltip
                    hoverable
                    content={
                      <>
                        When casting <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> and{' '}
                        <SpellLink id={SPELLS.FLOURISH_TALENT.id} /> together, the Convoke should
                        ALWAYS go first. This is both because the Convoke could proc Flourish and
                        cause you to clip your hardcast's buff, and also because Convoke produces a
                        lot of HoTs which Flourish could extend. If you got an{' '}
                        <i className="glyphicon glyphicon-remove fail-mark" /> here, it means you
                        cast Flourish before this Convoke.
                      </>
                    }
                  >
                    <span>
                      <InformationIcon />
                    </span>
                  </Tooltip>
                </>
              ),
              result: <PassFailCheckmark pass={!restoCast.recentlyFlourished} />,
            });
          this.selectedCombatant.has4Piece() &&
            checklistItems.push({
              label: (
                <>
                  Sync with <SpellLink id={SPELLS.RESTO_DRUID_TIER_28_4P_SET_BONUS.id} />{' '}
                  <Tooltip
                    hoverable
                    content={
                      <>
                        <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} />
                        's power is greatly increased when in Tree of Life form. With the 4 piece
                        set bonus <SpellLink id={SPELLS.RESTO_DRUID_TIER_28_4P_SET_BONUS.id} />, you
                        can reasonably get a proc about once every minute, so it is recommended to
                        sync your procs with Convoke.
                      </>
                    }
                  >
                    <span>
                      <InformationIcon />
                    </span>
                  </Tooltip>
                </>
              ),
              result: <PassFailCheckmark pass={cast.form === 'Tree of Life'} />,
            });

          return <CooldownExpandable header={header} checklistItems={checklistItems} key={ix} />;
        })}
        <p />
      </>
    );
  }

  statistic() {
    return (
      <Statistic
        wide
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            {this.baseTooltip}
            <br />
            <br />
            Healing amount is attributed by tracking the healing spells cast by Convoke, including
            possible Flourish casts. This amount includes mastery benefit from the proceed HoTs.
            {this.totalNsConvokeHealing !== 0 && (
              <>
                <br />
                <br />
                In addition, you took advantage of the fact that{' '}
                <SpellLink id={SPELLS.NATURES_SWIFTNESS.id} /> boosts convoked Regrowth healing
                without consuming the buff. Nature's swiftness was active during{' '}
                <strong>
                  {this.nsBoostedConvokeCount} out of {this.convokeCount}
                </strong>{' '}
                casts, during which it boosted{' '}
                <strong>{this.nsBoostedConvokeRegrowthCount} Regrowths</strong> and caused{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.totalNsConvokeHealing),
                    1,
                  )}
                  %
                </strong>{' '}
                of total healing. This amount is included in the top-line Convoke healing amount.
              </>
            )}
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast #</th>
                  <th>Time</th>
                  <th>Form</th>
                  <th>Healing</th>
                  <th>Spells In Cast</th>
                </tr>
              </thead>
              <tbody>
                {this.convokeTracker.map((convokeCast, index) => (
                  <tr key={index}>
                    <th scope="row">{index}</th>
                    <td>{this.owner.formatTimestamp(convokeCast.timestamp)}</td>
                    <td>{convokeCast.form}</td>
                    <td>
                      {formatNumber(
                        this.restoConvokeTracker[index].totalAttribution.healing +
                          this.restoConvokeTracker[index].flourishRateAttribution.amount,
                      )}
                    </td>
                    <td>
                      {convokeCast.spellIdToCasts.map((casts, spellId) => (
                        <>
                          <SpellLink id={spellId} /> {casts} <br />
                        </>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.CONVOKE_SPIRITS.id}>
          <ItemPercentHealingDone approximate amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

/** A tracker for resto specific things that happen in a single Convoke cast */
interface RestoConvokeCast {
  /** The attribution object for all healing this Convoke cast causes */
  totalAttribution: Attribution;
  /** A special tracker specifically for the rate-increase healing due to a Flourish
   * procced by this Convoke cast */
  flourishRateAttribution: MutableAmount;
  /** Nature's Swiftness boosts convoked Regrowths but does not consume the buff.
   * This attributor specifically tracks the healing due to this. */
  nsAttribution: Attribution;
  /** The number of Wild Growths out at the moment this Convoke is cast */
  wgsOnCast: number;
  /** The number of Rejuvs out at the moment this Convoke is cast */
  rejuvsOnCast: number;
  /** True iff the player flourished recently (you shouldn't do this, always Convoke first) */
  recentlyFlourished: boolean;
}

export default ConvokeSpiritsResto;
