import type { JSX, ReactNode } from 'react';
import { Fragment } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  ChangeBuffStackEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { mergeTimePeriods, OpenTimePeriod } from 'parser/core/mergeTimePeriods';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import { TALENTS_DRUID } from 'common/TALENTS';
import type { Talent } from 'common/TALENTS/types';
import {
  causedBloom,
  getHardcast,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import Combatants from 'parser/shared/modules/Combatants';
import Efflorescence from 'analysis/retail/druid/restoration/modules/spells/Efflorescence';

const DEBUG = false;

const LB_COLOR = '#00bb44';
const MAX_LIFEBLOOM_STACKS = 3;

/**
 * Components related to Lifebloom and Lifebloom's uptime.
 *
 * Spell ID split (Midnight):
 * - LIFEBLOOM_BUFF (1227806): HoT aura apply/refresh/remove; lines up with casts
 * - LIFEBLOOM_HOT_HEAL (33763): periodic ticks + Everbloom stack buff events
 *
 * When Lifetreading is talented, the guide subsection also covers Efflorescence
 * (Efflo follows the Lifebloom target).
 */
class Lifebloom extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    efflorescence: Efflorescence,
  };

  protected combatants!: Combatants;
  protected efflorescence!: Efflorescence;

  /** list of time periods when lifebloom was active */
  lifebloomUptimes: OpenTimePeriod[] = [];
  private hasEverbloom = false;
  /** Rank 2+ unlocks splash healing that scales from the final bloom */
  private hasEverbloomSplash = false;
  private hasVerdancy = false;
  private hasLifetreading = false;
  private hasForestwalk = false;
  private hasBondWithNature = false;
  private hasVerdantHeart = false;
  private hasPhotosynthesis = false;
  private hasRampantGrowth = false;
  private showCastPanel = false;
  private hasActiveLifebloom = false;
  activeLifebloomTarget: number | undefined = undefined;
  private possibleVerdancyBlooms = 0;
  private actualVerdancyBlooms = 0;
  private currentLifebloomStacks = 0;
  private analyzedLifebloomCasts = 0;

  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.hasEverbloom =
      this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_1_RESTORATION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT);
    this.hasEverbloomSplash =
      this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT);
    this.hasVerdancy = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANCY_TALENT);
    this.hasLifetreading = this.selectedCombatant.hasTalent(TALENTS_DRUID.LIFETREADING_TALENT);
    this.hasForestwalk = this.selectedCombatant.hasTalent(TALENTS_DRUID.FORESTWALK_TALENT);
    this.hasBondWithNature = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.BOND_WITH_NATURE_TALENT,
    );
    this.hasVerdantHeart = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANT_HEART_TALENT);
    this.hasPhotosynthesis = this.selectedCombatant.hasTalent(TALENTS_DRUID.PHOTOSYNTHESIS_TALENT);
    this.hasRampantGrowth = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAMPANT_GROWTH_TALENT);
    this.showCastPanel = this.hasVerdancy || this.hasEverbloom;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_BUFF),
      this.onApplyLifebloom,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_BUFF),
      this.onRemoveLifebloom,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_HOT_HEAL),
      this.onApplyLifebloomStack,
    );
    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_HOT_HEAL),
      this.onChangeLifebloomStack,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_BUFF),
      this.onRefreshLifebloom,
    );
  }

  /** Everbloom stacks live on 33763; read them from the Lifebloom target at the given time */
  private getStacksOnTarget(event: ApplyBuffEvent | RefreshBuffEvent): number {
    const target = this.combatants.getEntity(event);
    if (!target) {
      return this.currentLifebloomStacks;
    }

    const stacks = target.getBuffStacks(
      SPELLS.LIFEBLOOM_HOT_HEAL.id,
      event.timestamp,
      0,
      0,
      this.selectedCombatant.id,
    );

    DEBUG &&
      console.log(
        `LB stacks @ ${this.owner.formatTimestamp(event.timestamp, 1)}: ${stacks} (tracked ${this.currentLifebloomStacks})`,
      );

    return stacks;
  }

  onApplyLifebloom(event: ApplyBuffEvent) {
    this.recordCast(event, this.currentLifebloomStacks);
    this.currentLifebloomStacks = 1;
    this.activeLifebloomTarget = event.targetID;

    if (this.hasActiveLifebloom) {
      return;
    }

    this.hasActiveLifebloom = true;
    this.lifebloomUptimes.push({ start: event.timestamp });
  }

  onRemoveLifebloom(event: RemoveBuffEvent) {
    if (!this.hasActiveLifebloom) {
      return;
    }

    // Ignore Remove for a target that is no longer the active Lifebloom target
    // (happens during target swaps when the new Apply arrives before the old Remove)
    if (event.targetID !== this.activeLifebloomTarget) {
      return;
    }

    this.hasActiveLifebloom = false;
    this.activeLifebloomTarget = undefined;
    this.currentLifebloomStacks = 0;
    if (this.lifebloomUptimes.length > 0) {
      this.lifebloomUptimes[this.lifebloomUptimes.length - 1].end = event.timestamp;
    }
  }

  onApplyLifebloomStack(event: ApplyBuffStackEvent) {
    this.currentLifebloomStacks = event.stack;
  }

  onChangeLifebloomStack(event: ChangeBuffStackEvent) {
    this.currentLifebloomStacks = event.newStacks;
  }

  private recordCast(
    event: ApplyBuffEvent | RefreshBuffEvent,
    preCastStacks: number,
    bloomed?: boolean,
  ) {
    if (!this.showCastPanel) {
      return;
    }

    if (event.prepull) {
      return;
    }

    const isFirstLifebloomCast = this.analyzedLifebloomCasts === 0;
    this.analyzedLifebloomCasts += 1;

    const isApplyCast = event.type === 'applybuff';
    const isFailCast =
      this.hasEverbloom &&
      !isFirstLifebloomCast &&
      (isApplyCast || preCastStacks < MAX_LIFEBLOOM_STACKS);

    const targetName = this.owner.getTargetName(event);
    const hardcast = getHardcast(event);
    const castTimestamp = hardcast?.timestamp ?? event.timestamp;

    const isRefresh = event.type === 'refreshbuff';
    let value: QualitativePerformance;
    let text: string;

    if (isFailCast) {
      value = QualitativePerformance.Fail;
      text = 'Did not refresh a 3-stack Lifebloom';
    } else if (isRefresh) {
      value = bloomed ? QualitativePerformance.Good : QualitativePerformance.Ok;
      text = bloomed
        ? 'Triggered bloom from existing Lifebloom'
        : 'Refreshed existing Lifebloom without triggering bloom';
    } else {
      value = this.hasEverbloom ? QualitativePerformance.Ok : QualitativePerformance.Good;
      text = this.hasEverbloom
        ? 'Applied/refreshed without maintaining 3 stacks'
        : 'Fresh cast (no active refresh)';
    }

    this.castEntries.push({
      value,
      tooltip: (
        <>
          @ <strong>{this.owner.formatTimestamp(castTimestamp)}</strong> - {text}
          <br />
          targetting <strong>{targetName}</strong>
        </>
      ),
    });
  }

  onRefreshLifebloom(event: RefreshBuffEvent) {
    // Stacks are on 33763 (ICD stack buff), not on the 1227806 refresh itself
    const preCastStacks = Math.max(1, this.getStacksOnTarget(event));
    // Prefer the bloom event-link over reconstructing remaining duration: combatantinfo
    // auras do not include remaining time, so prepull Lifebloom has no reliable clock.
    // A linked bloom heal means the refresh was in the pandemic window (<=4.5s remaining).
    const bloomed = causedBloom(event);

    this.possibleVerdancyBlooms += 1;
    if (bloomed) {
      this.actualVerdancyBlooms += 1;
    }

    this.recordCast(event, preCastStacks, bloomed);

    // Hardcast refresh doesn't change Everbloom stacks; keep the 33763 value
    this.currentLifebloomStacks = preCastStacks;
  }

  /** The time at least one lifebloom was active */
  get lifebloomUptime() {
    return this._getTotalUptime(this.lifebloomUptimes);
  }

  /** Guide subsection describing the proper usage of Lifebloom (and Efflo when Lifetreading) */
  getGuideSubsection(isAdvanced: boolean): JSX.Element {
    const healingAmps = this.healingReceivedAmpTalents;

    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.LIFEBLOOM_HOT_HEAL} />
          </b>{' '}
          belongs on yourself. Aim for 100% uptime, and keep other HoTs stacked with it
          {this.hasEverbloom ? (
            <>
              . We do this to maximize{' '}
              <SpellLink
                spell={
                  this.hasEverbloomSplash
                    ? TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT
                    : TALENTS_DRUID.EVERBLOOM_1_RESTORATION_TALENT
                }
              />{' '}
              healing
            </>
          ) : null}
          . If uptime is a recurring issue, consider adjusting your UI so it's more obvious when
          Lifebloom falls off.
        </p>
        {isAdvanced && (
          <p>
            Refresh Lifebloom (and any other HoT) when it has about 5–6 seconds left. That pandemic
            window extends the HoT with no duration penalty. Refreshing much earlier or moving
            Lifebloom to another target skips the bloom
            {(this.hasEverbloom || this.hasVerdancy) && (
              <>
                , costing
                {this.hasEverbloom && (
                  <>
                    {' '}
                    <SpellLink
                      spell={
                        this.hasEverbloomSplash
                          ? TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT
                          : TALENTS_DRUID.EVERBLOOM_1_RESTORATION_TALENT
                      }
                    />
                  </>
                )}
                {this.hasEverbloom && this.hasVerdancy && ' and'}
                {this.hasVerdancy && (
                  <>
                    {this.hasEverbloom ? ' ' : ' '}
                    <SpellLink spell={TALENTS_DRUID.VERDANCY_TALENT} />
                  </>
                )}{' '}
                value
              </>
            )}
            .
          </p>
        )}
        {isAdvanced && this.hasEverbloom && (
          <p>
            <SpellLink
              spell={
                this.hasEverbloomSplash
                  ? TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT
                  : TALENTS_DRUID.EVERBLOOM_1_RESTORATION_TALENT
              }
            />{' '}
            does AoE healing whenever Lifebloom blooms, and that splash scales with{' '}
            <SpellLink spell={SPELLS.MASTERY_HARMONY} /> stacks on the Lifebloom target. Keep
            Lifebloom on yourself
            {healingAmps.length > 0 ? (
              <>
                , since {this.renderTalentList(healingAmps)} all increase the healing you receive
                {this.hasEverbloomSplash ? (
                  <>, making the splash strongest when it blooms on you</>
                ) : null}
              </>
            ) : this.hasEverbloomSplash ? (
              <> so the splash is as strong as possible</>
            ) : null}
            . Avoid moving it unless you have to, since swapping also resets its stacks.
          </p>
        )}
        {isAdvanced && this.hasPhotosynthesis && (
          <p>
            <SpellLink spell={TALENTS_DRUID.PHOTOSYNTHESIS_TALENT} /> gives HoTs on the Lifebloom
            target an extra chance to cause a bloom, which is another reason to keep Rejuvenation
            {this.selectedCombatant.hasTalent(TALENTS_DRUID.GERMINATION_TALENT) ? (
              <>
                {' '}
                and <SpellLink spell={TALENTS_DRUID.GERMINATION_TALENT} />
              </>
            ) : null}{' '}
            on yourself.
          </p>
        )}
        {this.hasLifetreading && (
          <p>
            With <SpellLink spell={TALENTS_DRUID.LIFETREADING_TALENT} />,{' '}
            <SpellLink spell={SPELLS.EFFLORESCENCE_CAST} /> follows your Lifebloom target. Since
            that&apos;s usually you, think of your feet as your Efflorescence placement. Stay
            stacked with the raid so Efflorescence
            {this.hasVerdancy ? (
              <>
                {' '}
                and <SpellLink spell={TALENTS_DRUID.VERDANCY_TALENT} />
              </>
            ) : null}{' '}
            can hit as many players as possible.
          </p>
        )}
      </>
    );

    const data = (
      <div>
        {isAdvanced && this.showCastPanel && this.castEntries.length > 0 && (
          <CastSummaryAndBreakdown
            spell={SPELLS.LIFEBLOOM_HOT_HEAL}
            castEntries={this.castEntries}
            goodExtraExplanation={
              this.hasEverbloom ? (
                <>refresh existing Lifebloom and trigger bloom</>
              ) : (
                <>trigger bloom or be a fresh cast</>
              )
            }
            okExtraExplanation={<>refresh existing Lifebloom without triggering bloom</>}
            badExtraExplanation={
              this.hasEverbloom
                ? 'cast when not refreshing a 3-stack Lifebloom (except first cast)'
                : 'n/a'
            }
          />
        )}
        <RoundedPanel>
          <strong>
            {this.hasLifetreading ? 'Lifebloom and Efflorescence uptimes' : 'Lifebloom uptimes'}
          </strong>
          {this.subStatistic()}
          {this.hasLifetreading && this.efflorescence.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  get hasEverbloomRank1Effective() {
    return this.hasEverbloom;
  }

  get lifebloomStacks() {
    return this.currentLifebloomStacks;
  }

  _getTotalUptime(uptimes: OpenTimePeriod[]) {
    return uptimes.reduce(
      (acc, ut) => acc + (ut.end === undefined ? this.owner.currentTimestamp : ut.end) - ut.start,
      0,
    );
  }

  hasActiveLifebloomAt(timestamp: number): boolean {
    return this.lifebloomUptimes.some(
      (uptime) =>
        uptime.start <= timestamp && (uptime.end === undefined || uptime.end >= timestamp),
    );
  }

  private get healingReceivedAmpTalents(): Talent[] {
    const amps: Talent[] = [];
    if (this.hasForestwalk) {
      amps.push(TALENTS_DRUID.FORESTWALK_TALENT);
    }
    if (this.hasBondWithNature) {
      amps.push(TALENTS_DRUID.BOND_WITH_NATURE_TALENT);
    }
    if (this.hasVerdantHeart) {
      amps.push(TALENTS_DRUID.VERDANT_HEART_TALENT);
    }
    return amps;
  }

  private renderTalentList(talents: Talent[]): ReactNode {
    return talents.map((spell, index) => (
      <Fragment key={spell.id}>
        {index > 0 &&
          (index === talents.length - 1 ? (talents.length === 2 ? ' and ' : ', and ') : ', ')}
        <SpellLink spell={spell} />
      </Fragment>
    ));
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.LIFEBLOOM_BUFF],
        uptimes: mergeTimePeriods(this.lifebloomUptimes, this.owner.currentTimestamp),
        color: LB_COLOR,
      },
      [],
      SubPercentageStyle.ABSOLUTE,
    );
  }
}

export default Lifebloom;
