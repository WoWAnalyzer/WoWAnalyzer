import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { PassFailCheckmark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { FLOURISH_EXTENDED_HOTS } from 'analysis/retail/druid/restoration/constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import ConvokeSpiritsResto from 'analysis/retail/druid/restoration/modules/spells/ConvokeSpiritsResto';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';

const TRANQUILITY_TICK_EXTENSION = 2_000;

/**
 * **Flourish**
 * Spec Talent Tier 6
 *
 * Tranquility extends the duration of all of your heal over time effects by 2 sec every 1 sec.
 *
 * (Tranquility casts that proc from Convoke the Spirits are just one tick, so a 2 second extension)
 */
class Flourish extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    convokeSpirits: ConvokeSpiritsResto,
  };

  hotTracker!: HotTrackerRestoDruid;
  convokeSpirits!: ConvokeSpiritsResto;

  extensionAttributions: Attribution[] = [];
  rampTrackers: FlourishTracker[] = [];
  hardcastCount = 0;
  wgsExtended = 0; // tracks how many flourishes extended Wild Growth
  hardcastsWithWgExtension = new Set<Attribution>();

  currentHardcastAttribution?: Attribution;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.FLOURISH_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_CAST),
      this.onTranquilityCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_HEAL),
      this.onTranquilityHeal,
    );
  }

  get totalExtensionHealing() {
    return this.extensionAttributions.reduce((acc, flourish) => acc + flourish.healing, 0);
  }

  get totalExtensionOverhealing() {
    return this.extensionAttributions.reduce((acc, flourish) => acc + flourish.overheal, 0);
  }

  get casts() {
    return this.hardcastCount;
  }

  get healingPerCast() {
    return this.casts === 0 ? 0 : this.totalExtensionHealing / this.casts;
  }

  onTranquilityCast(event: CastEvent) {
    this.hardcastCount += 1;
    this.currentHardcastAttribution = HotTracker.getNewAttribution(
      `Flourish #${this.hardcastCount}`,
    );
    this.extensionAttributions.push(this.currentHardcastAttribution);

    const rejuvsOnCast =
      this.hotTracker.getHotCount(SPELLS.REJUVENATION.id) +
      this.hotTracker.getHotCount(SPELLS.REJUVENATION_GERMINATION.id);
    const wgsOnCast = this.hotTracker.getHotCount(SPELLS.WILD_GROWTH.id);
    this.rampTrackers.push({
      timestamp: event.timestamp,
      extensionAttribution: this.currentHardcastAttribution,
      wgsOnCast,
      rejuvsOnCast,
    });
  }

  onTranquilityHeal(event: HealEvent) {
    const targetId = event.targetID;
    const trackersOnTarget = this.hotTracker.hots[targetId];
    if (!trackersOnTarget) {
      return;
    }

    const convokeFlourish = isConvoking(this.selectedCombatant);
    const extensionAttribution = convokeFlourish
      ? this.convokeSpirits.currentConvokeFlourishExtensionAttribution
      : this.currentHardcastAttribution;

    if (!extensionAttribution) {
      return;
    }

    FLOURISH_EXTENDED_HOTS.forEach((hot: { id: number }) => {
      if (!trackersOnTarget[hot.id]) {
        return;
      }

      this.hotTracker.addExtension(
        extensionAttribution,
        TRANQUILITY_TICK_EXTENSION,
        targetId,
        hot.id,
      );
      if (
        !convokeFlourish &&
        hot.id === SPELLS.WILD_GROWTH.id &&
        !this.hardcastsWithWgExtension.has(extensionAttribution)
      ) {
        this.hardcastsWithWgExtension.add(extensionAttribution);
        this.wgsExtended += 1;
      }
    });
  }

  /** Guide fragment showing a breakdown of each Flourish */
  get guideCastBreakdown() {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DRUID.FLOURISH_TALENT} />
          </strong>{' '}
          extends your active HoTs during <SpellLink spell={SPELLS.TRANQUILITY_CAST} />. The value
          in raid depends heavily on what HoTs are already out when Tranquility starts and during
          its ticks, so ramping with Rejuvenation and Wild Growth first is still important.
        </p>
        {this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) && (
          <p>
            When pairing this with <SpellLink spell={SPELLS.CONVOKE_SPIRITS} />, the Convoke should
            always be cast first. Convoke produces many HoTs that can then be extended.
          </p>
        )}
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.rampTrackers.map((cast, ix) => {
          const castTotalHealing = cast.extensionAttribution.healing;

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={TALENTS_DRUID.FLOURISH_TALENT} /> ({formatNumber(castTotalHealing)}{' '}
              healing)
            </>
          );

          const wgRamp = cast.wgsOnCast > 0;
          const rejuvRamp = cast.rejuvsOnCast > 0;
          const overallPerf =
            wgRamp && rejuvRamp ? QualitativePerformance.Good : QualitativePerformance.Fail;

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

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    if (!this.selectedCombatant.hasTalent(TALENTS_DRUID.FLOURISH_TALENT)) {
      return; // module needs to stay active for convoke, but we shouldn't display stat
    }
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(6)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the sum of the healing enabled by the Flourish HoT extension from Tranquility
            ticks.
            {this.selectedCombatant.hasTalent(TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT) && (
              <>
                <br />
                This value does not include Flourish extension procs from{' '}
                <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> tranquility procs.
                <br />
                Excluded Convoke Flourish extension healing:{' '}
                <strong>
                  {this.owner.formatItemHealingDone(
                    this.convokeSpirits.totalFlourishExtensionHealing,
                  )}
                </strong>
              </>
            )}
            <ul>
              <li>
                Extension:{' '}
                <strong>{this.owner.formatItemHealingDone(this.totalExtensionHealing)}</strong>
              </li>
              <li>
                Wild Growths Casts Extended:{' '}
                <strong>
                  {this.wgsExtended} / {this.hardcastCount}
                </strong>
              </li>
              <li>
                Average Healing per Cast: <strong>{formatNumber(this.healingPerCast)}</strong>
              </li>
            </ul>
            <strong>
              Overhealing:{' '}
              {formatOverhealing(this.totalExtensionOverhealing, this.totalExtensionHealing)}
            </strong>
            <br />
            For the included table, note that extension healing for a flourish cast near the end of
            a fight might have lower than expected numbers because extension healing isn't tallied
            until the HoT has ticked past its original duration.
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast</th>
                  <th>HoTs Extended</th>
                  <th>Extension Healing</th>
                </tr>
              </thead>
              <tbody>
                {this.extensionAttributions.map((flourish, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{flourish.procs}</td>
                    <td>{formatNumber(flourish.healing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.FLOURISH_TALENT}>
          <ItemPercentHealingDone approximate amount={this.totalExtensionHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

/** A tracker Flourish cast checklist stuff */
interface FlourishTracker {
  /** Cast's timestamp */
  timestamp: number;
  /** The attribution object for all healing caused by the HoT extension */
  extensionAttribution: Attribution;
  /** The number of Wild Growths out at the moment this Convoke is cast */
  wgsOnCast: number;
  /** The number of Rejuvs out at the moment this Convoke is cast */
  rejuvsOnCast: number;
}

export default Flourish;
