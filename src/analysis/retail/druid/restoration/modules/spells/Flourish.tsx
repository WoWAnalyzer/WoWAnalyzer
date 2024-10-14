import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, Tooltip } from 'interface';
import { PassFailCheckmark } from 'interface/guide';
import InformationIcon from 'interface/icons/Information';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, EventType, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { FLOURISH_INCREASED_RATE } from 'analysis/retail/druid/restoration/constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';
import { isFromHardcast } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import ConvokeSpiritsResto from 'analysis/retail/druid/restoration/modules/spells/ConvokeSpiritsResto';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';

const HARDCAST_FLOURISH_EXTENSION = 8000;
const CONVOKE_FLOURISH_EXTENSION = 4000;
const FLOURISH_HEALING_INCREASE = 0.25;

/**
 * **Flourish**
 * Spec Talent Tier 8
 *
 * Extends the duration of all of your heal over time effects on friendly targets within 60 yards by 6 sec,
 * and increases the rate of your heal over time effects by 25% for 6 sec.
 *
 * (Flourishes that proc from Convoke the Spirits are half duration)
 */
class Flourish extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    abilityTracker: AbilityTracker,
    convokeSpirits: ConvokeSpiritsResto,
  };

  hotTracker!: HotTrackerRestoDruid;
  abilityTracker!: AbilityTracker;
  convokeSpirits!: ConvokeSpiritsResto;

  extensionAttributions: Attribution[] = [];
  rateAttributions: MutableAmount[] = [];
  rampTrackers: FlourishTracker[] = [];
  lastCastTimestamp?: number;
  hardcastCount: number = 0;
  wgsExtended = 0; // tracks how many flourishes extended Wild Growth

  currentRateAttribution: MutableAmount = { amount: 0 };

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_DRUID.FLOURISH_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(FLOURISH_INCREASED_RATE),
      this.onIncreasedRateHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_DRUID.FLOURISH_TALENT),
      this.onFlourishApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS_DRUID.FLOURISH_TALENT),
      this.onFlourishApplyBuff,
    );
  }

  get totalExtensionHealing() {
    return this.extensionAttributions.reduce((acc, flourish) => acc + flourish.healing, 0);
  }

  get totalRateHealing() {
    return this.rateAttributions.reduce((acc, flourish) => acc + flourish.amount, 0);
  }

  get totalHealing() {
    return this.totalExtensionHealing + this.totalRateHealing;
  }

  get casts() {
    return this.hardcastCount;
  }

  get healingPerCast() {
    return this.casts === 0 ? 0 : this.totalHealing / this.casts;
  }

  onIncreasedRateHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS_DRUID.FLOURISH_TALENT.id) && event.tick) {
      this.currentRateAttribution.amount += calculateEffectiveHealing(
        event,
        FLOURISH_HEALING_INCREASE,
      );
    }
  }

  onFlourishApplyBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    let extensionAttribution: Attribution;
    let extensionAmount = HARDCAST_FLOURISH_EXTENSION;
    if (!isFromHardcast(event) && isConvoking(this.selectedCombatant)) {
      extensionAttribution = this.convokeSpirits.currentConvokeAttribution;
      extensionAmount = CONVOKE_FLOURISH_EXTENSION;
      this.currentRateAttribution = this.convokeSpirits.currentConvokeRateAttribution;
    } else {
      this.hardcastCount += 1;
      extensionAttribution = HotTracker.getNewAttribution(`Flourish #${this.hardcastCount}`);
      this.currentRateAttribution = { amount: 0 };
      this.rateAttributions.push(this.currentRateAttribution);
      this.extensionAttributions.push(extensionAttribution);

      const rejuvsOnCast =
        this.hotTracker.getHotCount(SPELLS.REJUVENATION.id) +
        this.hotTracker.getHotCount(SPELLS.REJUVENATION_GERMINATION.id);
      const wgsOnCast = this.hotTracker.getHotCount(SPELLS.WILD_GROWTH.id);
      const clipped = event.type === EventType.RefreshBuff;
      this.rampTrackers.push({
        timestamp: event.timestamp,
        extensionAttribution,
        rateAttribution: this.currentRateAttribution,
        wgsOnCast,
        rejuvsOnCast,
        clipped,
      });
    }

    let foundWg = false;
    Object.keys(this.hotTracker.hots).forEach((playerIdString) => {
      const playerId = Number(playerIdString);
      Object.keys(this.hotTracker.hots[playerId]).forEach((spellIdString) => {
        const spellId = Number(spellIdString);
        this.hotTracker.addExtension(extensionAttribution, extensionAmount, playerId, spellId);
        if (spellId === SPELLS.WILD_GROWTH.id) {
          foundWg = true;
        }
      });
    });
    if (foundWg) {
      this.wgsExtended += 1;
    }
  }

  /** Guide fragment showing a breakdown of each Flourish cast */
  get guideCastBreakdown() {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DRUID.FLOURISH_TALENT} />
          </strong>{' '}
          requires a ramp more than any of your other cooldowns, as its power is based almost
          entirely in the HoTs present when cast. Cast many Rejuvenations, and then a Wild Growth a
          few seconds before you're ready to Flourish.
        </p>
        {this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) && (
          <p>
            When pairing this with <SpellLink spell={SPELLS.CONVOKE_SPIRITS} />, the Convoke should
            ALWAYS be cast first. This is because the Convoke will produce many HoTs which can be
            extended, but also because it could proc a Flourish thus allowing you to save the
            hardcast.
          </p>
        )}
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.rampTrackers.map((cast, ix) => {
          const castTotalHealing = cast.extensionAttribution.healing + cast.rateAttribution.amount;

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={TALENTS_DRUID.FLOURISH_TALENT} /> ({formatNumber(castTotalHealing)}{' '}
              healing)
            </>
          );

          const wgRamp = cast.wgsOnCast > 0;
          const rejuvRamp = cast.rejuvsOnCast > 0;
          const noFlourishClip = !cast.clipped;
          const overallPerf =
            wgRamp && rejuvRamp && noFlourishClip
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
          this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) &&
            checklistItems.push({
              label: (
                <>
                  Don't clip existing <SpellLink spell={TALENTS_DRUID.FLOURISH_TALENT} />{' '}
                  <Tooltip
                    hoverable
                    content={
                      <>
                        <SpellLink spell={SPELLS.CONVOKE_SPIRITS} /> can proc{' '}
                        <SpellLink spell={TALENTS_DRUID.FLOURISH_TALENT} />. After Convoking, always
                        check to see if you get a proc before Flourishing. If you got a proc, you
                        need to wait before Flourishing so you don't overwrite the buff and lose a
                        lot of duration. If you got an{' '}
                        <i className="glyphicon glyphicon-remove fail-mark" /> here, it means you
                        overwrote an existing Flourish.
                      </>
                    }
                  >
                    <span>
                      <InformationIcon />
                    </span>
                  </Tooltip>
                </>
              ),
              result: <PassFailCheckmark pass={noFlourishClip} />,
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
        position={STATISTIC_ORDER.OPTIONAL(8)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the sum of the healing enabled by the HoT extension and the HoT rate increase.
            Due to limitations in the way we do healing attribution, there may be some
            double-counting between the Extension and Increased Rate values, meaning the true amount
            attributable will be somewhat lower than listed.
            {this.selectedCombatant.hasTalent(TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT) && (
              <>
                <br />
                These stats do NOT include Flourishes procced from{' '}
                <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} />.
              </>
            )}
            <ul>
              <li>
                Extension:{' '}
                <strong>{this.owner.formatItemHealingDone(this.totalExtensionHealing)}</strong>
              </li>
              <li>
                Increased Rate:{' '}
                <strong>{this.owner.formatItemHealingDone(this.totalRateHealing)}</strong>
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
                  <th>Rate Healing</th>
                </tr>
              </thead>
              <tbody>
                {this.extensionAttributions.map((flourish, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{flourish.procs}</td>
                    <td>{formatNumber(flourish.healing)}</td>
                    <td>{formatNumber(this.rateAttributions[index].amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.FLOURISH_TALENT}>
          <ItemPercentHealingDone approximate amount={this.totalHealing} />
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
  /** The attribution object for all healing caused by the HoT rate increase */
  rateAttribution: MutableAmount;
  /** The number of Wild Growths out at the moment this Convoke is cast */
  wgsOnCast: number;
  /** The number of Rejuvs out at the moment this Convoke is cast */
  rejuvsOnCast: number;
  /** True iff this cast clipped an existing Flourish buff */
  clipped: boolean;
}

export type MutableAmount = {
  amount: number;
};

export default Flourish;
