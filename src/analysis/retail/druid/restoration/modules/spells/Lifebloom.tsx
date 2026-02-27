import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
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
import { causedBloom, getHardcast } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

const LB_COLOR = '#00bb44';
const MAX_LIFEBLOOM_STACKS = 3;

/**
 * Components related to Lifebloom and Lifebloom's uptime.
 */
class Lifebloom extends Analyzer {
  /** list of time periods when lifebloom was active */
  lifebloomUptimes: OpenTimePeriod[] = [];
  private hasEverbloom = false;
  private hasVerdancy = false;
  private showCastPanel = false;
  private hasActiveLifebloom = false;
  private possibleVerdancyBlooms = 0;
  private actualVerdancyBlooms = 0;
  private currentLifebloomStacks = 0;
  private analyzedLifebloomCasts = 0;

  castEntries: BoxRowEntry[] = [];
  nonThreeStackCasts = 0;

  constructor(options: Options) {
    super(options);

    this.hasEverbloom =
      this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_1_RESTORATION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT);
    this.hasVerdancy = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANCY_TALENT);
    this.showCastPanel = this.hasVerdancy || this.hasEverbloom;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_HOT_HEAL),
      this.onApplyLifebloom,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_HOT_HEAL),
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
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_HOT_HEAL),
      this.onRefreshLifebloom,
    );
  }

  onApplyLifebloom(event: ApplyBuffEvent) {
    this.recordCast(event, this.currentLifebloomStacks);
    this.currentLifebloomStacks = 1;

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

    this.hasActiveLifebloom = false;
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

    const isFirstLifebloomCast = this.analyzedLifebloomCasts === 0;
    this.analyzedLifebloomCasts += 1;

    const isApplyCast = event.type === 'applybuff';
    const isFailCast =
      this.hasEverbloom &&
      !isFirstLifebloomCast &&
      (isApplyCast || preCastStacks < MAX_LIFEBLOOM_STACKS);
    if (isFailCast) {
      this.nonThreeStackCasts += 1;
    }

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
    const preCastStacks = Math.max(1, this.currentLifebloomStacks);

    this.possibleVerdancyBlooms += 1;
    const bloomed = causedBloom(event);
    if (bloomed) {
      this.actualVerdancyBlooms += 1;
    }

    this.recordCast(event, preCastStacks, bloomed);

    this.currentLifebloomStacks = this.hasEverbloom
      ? Math.min(MAX_LIFEBLOOM_STACKS, preCastStacks + 1)
      : 1;
  }

  /** The time at least one lifebloom was active */
  get lifebloomUptime() {
    return this._getTotalUptime(this.lifebloomUptimes);
  }

  get verdancyBloomRate() {
    if (this.possibleVerdancyBlooms === 0) {
      return 0;
    }
    return this.actualVerdancyBlooms / this.possibleVerdancyBlooms;
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
      (uptime) => uptime.start <= timestamp && (uptime.end === undefined || uptime.end >= timestamp),
    );
  }

  /** Guide subsection describing the proper usage of Lifebloom */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.LIFEBLOOM_HOT_HEAL} />
          </b>{' '}can only be active on one target at a time and its baseline throughput is similar to
          Rejuvenation. However, it causes{' '}
          <SpellLink spell={SPELLS.CLEARCASTING_BUFF} /> procs and so is a big benefit to your mana
          efficiency. You should aim for 100% Lifebloom uptime.
        </p>
        {this.hasEverbloom && (
          <p>
            Because you took{' '}
            <strong>
              <SpellLink spell={TALENTS_DRUID.EVERBLOOM_1_RESTORATION_TALENT} />
            </strong>
            , target swaps are especially punishing. Any time you swap targets, Lifebloom resets to
            1 stack and loses throughput.
            <br />
            <strong>{this.nonThreeStackCasts} casts not refreshing a 3-stack Lifebloom</strong>
          </p>
        )}
        {this.hasVerdancy && (
          <p>
            Because you took{' '}
            <strong>
              <SpellLink spell={TALENTS_DRUID.VERDANCY_TALENT} />
            </strong>
            , you should take extra care to allow your Lifeblooms to bloom. Refreshing lifebloom
            early or swapping targets before the existing Lifebloom has completed both will cause
            the bloom to be skipped - avoid doing this.
            <br />
            <strong>
              Lifebloom refreshes that bloomed:{' '}
              {formatPercentage(this.verdancyBloomRate, 1)}%
            </strong>
          </p>
        )}
      </>
    );

    const data = (
      <div>
        {this.showCastPanel && this.castEntries.length > 0 && (
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
            okExtraExplanation={
              this.hasEverbloom ? (
                <>refresh existing Lifebloom without triggering bloom</>
              ) : (
                <>refresh existing Lifebloom without triggering bloom</>
              )
            }
            badExtraExplanation={
              this.hasEverbloom
                ? 'cast when not refreshing a 3-stack Lifebloom (except first cast)'
                : 'n/a'
            }
          />
        )}
        <RoundedPanel>
          <strong>Lifebloom uptimes</strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.LIFEBLOOM_HOT_HEAL],
        uptimes: mergeTimePeriods(this.lifebloomUptimes, this.owner.currentTimestamp),
        color: LB_COLOR,
      },
      [],
      SubPercentageStyle.ABSOLUTE,
    );
  }
}

export default Lifebloom;
