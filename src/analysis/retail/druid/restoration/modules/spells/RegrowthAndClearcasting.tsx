import type { JSX } from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import { PerformanceMark } from 'interface/guide';
import CheckmarkIcon from 'interface/icons/Checkmark';
import CrossIcon from 'interface/icons/Cross';
import HealthIcon from 'interface/icons/Health';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import Mastery from 'analysis/retail/druid/restoration/modules/core/Mastery';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import {
  getDirectHeal,
  getNaturesBountyHeals,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { buffedByClearcast } from 'analysis/retail/druid/restoration/normalizers/ClearcastingNormalizer';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { calculateHealTargetHealthPercent } from 'parser/core/EventCalculateLib';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import CastOverview from 'interface/guide/components/CastOverview';
import { TipBox } from 'interface/guide/components';

/** Health percent below which we consider a heal to be triage (always Good) */
const TRIAGE_THRESHOLD = 0.3;
/** Max time from cast to buff check for Abundance / Nature's Swiftness */
const MS_BUFFER = 100;
/** Overheal strictly below this counts as low for Good */
const LOW_OVERHEAL_THRESHOLD = 0.7;
/** Remaining HoT duration at or below this fraction of fresh duration is pandemic-refreshable */
const PANDEMIC_THRESHOLD = 0.3;
/** Mastery stack thresholds for Nature's Bounty target selection (sub-stat only) */
const PERFECT_MASTERY_STACKS = 3;
const GOOD_MASTERY_STACKS = 2;
const OK_MASTERY_STACKS = 1;

interface RegrowthCastRecord {
  timestamp: number;
  performance: QualitativePerformance;
  targetName: string;
  targetHealthPercent?: number;
  duringAbundance: boolean;
  freeNote: string | null;
  isTriage: boolean;
  cleaveHits: number;
  primaryHealing: number;
  primaryOverhealing: number;
  cleaveHealing: number;
  cleaveOverhealing: number;
  targetHadRegrowth: boolean;
  isPandemicRefresh: boolean;
  onLifebloomTarget: boolean;
  masteryStacks: number;
  regrowthRemainingMs?: number;
}

/**
 * Tracks Regrowth cast quality, Clearcasting, Abundance windows, and Nature's Bounty cleave.
 * Guide section is shown when Abundance and/or Nature's Bounty is talented.
 */
class RegrowthAndClearcasting extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTrackerRestoDruid,
    lifebloom: Lifebloom,
    mastery: Mastery,
  };

  combatants!: Combatants;
  hotTracker!: HotTrackerRestoDruid;
  lifebloom!: Lifebloom;
  mastery!: Mastery;

  totalClearcasts = 0;
  overwrittenClearcasts = 0;
  endingClearcasts = 0;

  totalRegrowths = 0;
  nsRegrowths = 0;
  ccRegrowths = 0;
  abundanceRegrowths = 0;
  triageRegrowths = 0;
  badRegrowths = 0;
  perfectRegrowths = 0;
  okRegrowths = 0;

  casts: RegrowthCastRecord[] = [];

  hasAbundance: boolean;
  hasTranquilMind: boolean;
  hasNaturesBounty: boolean;
  hasImprovedRegrowth: boolean;
  hasSoulOfTheForest: boolean;
  hasRampantGrowth: boolean;
  hasOvergrowth: boolean;
  showGuide: boolean;

  constructor(options: Options) {
    super(options);

    this.hasAbundance = this.selectedCombatant.hasTalent(TALENTS_DRUID.ABUNDANCE_TALENT);
    this.hasTranquilMind = this.selectedCombatant.hasTalent(TALENTS_DRUID.TRANQUIL_MIND_TALENT);
    this.hasNaturesBounty = this.selectedCombatant.hasTalent(TALENTS_DRUID.NATURES_BOUNTY_TALENT);
    this.hasImprovedRegrowth = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.IMPROVED_REGROWTH_TALENT,
    );
    this.hasSoulOfTheForest = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT,
    );
    this.hasRampantGrowth = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAMPANT_GROWTH_TALENT);
    this.hasOvergrowth = this.selectedCombatant.hasTalent(TALENTS_DRUID.OVERGROWTH_TALENT);
    this.showGuide = this.hasAbundance || this.hasNaturesBounty;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF),
      this.onApplyClearcast,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF),
      this.onApplyClearcast,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF),
      this.onRefreshClearcast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onCastRegrowth,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onApplyClearcast() {
    this.totalClearcasts += 1;
  }

  onRefreshClearcast() {
    if (
      this.hasTranquilMind &&
      this.selectedCombatant.getBuffStacks(SPELLS.CLEARCASTING_BUFF.id) === 1
    ) {
      return;
    }

    this.totalClearcasts += 1;
    this.overwrittenClearcasts += 1;
  }

  onCastRegrowth(event: CastEvent) {
    this.totalRegrowths += 1;

    const regrowthHeal = getDirectHeal(event);
    const targetHealthPercent = regrowthHeal
      ? calculateHealTargetHealthPercent(regrowthHeal, true)
      : undefined;
    const isTriage = targetHealthPercent !== undefined && targetHealthPercent < TRIAGE_THRESHOLD;

    const primaryHealing = regrowthHeal ? regrowthHeal.amount + (regrowthHeal.absorbed || 0) : 0;
    const primaryOverhealing = regrowthHeal?.overheal || 0;

    let freeNote: string | null = null;
    const duringAbundance = this.selectedCombatant.hasBuff(
      SPELLS.ABUNDANCE_BUFF.id,
      event.timestamp,
      MS_BUFFER,
    );

    if (this.selectedCombatant.hasBuff(SPELLS.NATURES_SWIFTNESS.id, event.timestamp, MS_BUFFER)) {
      this.nsRegrowths += 1;
      freeNote = "Free (Nature's Swiftness)";
    } else if (buffedByClearcast(event)) {
      this.ccRegrowths += 1;
      freeNote = 'Free (Clearcasting)';
    } else if (duringAbundance) {
      this.abundanceRegrowths += 1;
      freeNote = 'Cheap (Abundance)';
    }

    const nbHeals = this.hasNaturesBounty ? getNaturesBountyHeals(event) : [];
    let cleaveHealing = 0;
    let cleaveOverhealing = 0;
    nbHeals.forEach((heal: HealEvent) => {
      cleaveHealing += heal.amount + (heal.absorbed || 0);
      cleaveOverhealing += heal.overheal || 0;
    });
    const cleaveHits = nbHeals.length;

    let targetHadRegrowth = false;
    let isPandemicRefresh = false;
    let regrowthRemainingMs: number | undefined;
    const onLifebloomTarget =
      event.targetID !== undefined && event.targetID === this.lifebloom.activeLifebloomTarget;
    if (event.targetID !== undefined) {
      const existingRegrowth = this.hotTracker.hots[event.targetID]?.[SPELLS.REGROWTH.id];
      if (existingRegrowth) {
        targetHadRegrowth = true;
        regrowthRemainingMs = Math.max(0, existingRegrowth.end - event.timestamp);
        const freshDuration = this.hotTracker._getDuration(
          this.hotTracker.hotInfo[SPELLS.REGROWTH.id],
        );
        isPandemicRefresh = regrowthRemainingMs <= freshDuration * PANDEMIC_THRESHOLD;
      }
    }

    const target = this.combatants.getEntity(event);
    const masteryStacks = target ? this.mastery.getHotCount(target) : 0;

    const { performance } = this.scoreCast({
      duringAbundance,
      freeNote,
      isTriage,
      targetHadRegrowth,
      isPandemicRefresh,
      onLifebloomTarget,
    });

    if (performance === QualitativePerformance.Perfect) {
      this.perfectRegrowths += 1;
    } else if (performance === QualitativePerformance.Ok) {
      this.okRegrowths += 1;
    } else if (performance === QualitativePerformance.Fail) {
      this.badRegrowths += 1;
    } else if (isTriage && !duringAbundance && !freeNote) {
      this.triageRegrowths += 1;
    }

    if (duringAbundance && freeNote && !freeNote.includes('Abundance')) {
      this.abundanceRegrowths += 1;
    }

    this.casts.push({
      timestamp: event.timestamp,
      performance,
      targetName: this.owner.getTargetName(event) ?? 'unknown',
      targetHealthPercent,
      duringAbundance,
      freeNote,
      isTriage,
      cleaveHits,
      primaryHealing,
      primaryOverhealing,
      cleaveHealing,
      cleaveOverhealing,
      targetHadRegrowth,
      isPandemicRefresh,
      onLifebloomTarget,
      masteryStacks,
      regrowthRemainingMs,
    });
  }

  private scoreCast({
    duringAbundance,
    freeNote,
    isTriage,
    targetHadRegrowth,
    isPandemicRefresh,
    onLifebloomTarget,
  }: {
    duringAbundance: boolean;
    freeNote: string | null;
    isTriage: boolean;
    targetHadRegrowth: boolean;
    isPandemicRefresh: boolean;
    onLifebloomTarget: boolean;
  }): { performance: QualitativePerformance } {
    const hasCheapCast = duringAbundance || freeNote !== null;

    // Bad: no Abundance / Clearcasting / NS, and not triage
    if (!hasCheapCast && !isTriage) {
      return { performance: QualitativePerformance.Fail };
    }

    // Ok: Rampant Growth already puts Regrowth on the Lifebloom target — don't hardcast it there
    // (triage still grades Good — the direct heal can matter)
    // Overgrowth: intentionally Regrowth the LB target to refresh Lifebloom → Good
    if (this.hasRampantGrowth && onLifebloomTarget && !isTriage) {
      if (this.hasOvergrowth) {
        return { performance: QualitativePerformance.Good };
      }
      return { performance: QualitativePerformance.Ok };
    }

    // Perfect: Abundance up and target has pandemic-ready Regrowth
    if (duringAbundance && isPandemicRefresh) {
      return { performance: QualitativePerformance.Perfect };
    }

    // Ok: refreshed a long-duration Regrowth (prefer spreading with Nature's Bounty)
    if (targetHadRegrowth && !isPandemicRefresh) {
      return { performance: QualitativePerformance.Ok };
    }

    // Good: Abundance (any overheal), Clearcasting / NS, or triage
    if (duringAbundance || freeNote || isTriage) {
      return { performance: QualitativePerformance.Good };
    }

    return { performance: QualitativePerformance.Fail };
  }

  onFightEnd() {
    if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id)) {
      this.endingClearcasts = 1;
    }
  }

  get usedClearcasts() {
    return this.ccRegrowths;
  }

  get expiredClearcasts() {
    return (
      this.totalClearcasts -
      this.overwrittenClearcasts -
      this.usedClearcasts -
      this.endingClearcasts
    );
  }

  get clearcastUtilPercent() {
    return this.totalClearcasts === 0
      ? 1
      : this.usedClearcasts / (this.totalClearcasts - this.endingClearcasts);
  }

  get freeRegrowths() {
    return this.ccRegrowths + this.nsRegrowths;
  }

  get avgCleaveHits() {
    if (!this.hasNaturesBounty || this.casts.length === 0) {
      return 0;
    }
    return this.casts.reduce((sum, c) => sum + c.cleaveHits, 0) / this.casts.length;
  }

  get avgMasteryStacks() {
    if (this.casts.length === 0) {
      return 0;
    }
    return this.casts.reduce((sum, c) => sum + c.masteryStacks, 0) / this.casts.length;
  }

  get avgOverheal() {
    const totalHealing = this.casts.reduce((sum, c) => sum + c.primaryHealing + c.cleaveHealing, 0);
    const totalOverheal = this.casts.reduce(
      (sum, c) => sum + c.primaryOverhealing + c.cleaveOverhealing,
      0,
    );
    const raw = totalHealing + totalOverheal;
    return raw > 0 ? totalOverheal / raw : 0;
  }

  get avgHealingPerCast() {
    if (this.casts.length === 0) {
      return 0;
    }
    return (
      this.casts.reduce((sum, c) => sum + c.primaryHealing + c.cleaveHealing, 0) / this.casts.length
    );
  }

  get abundanceCastRate() {
    if (this.casts.length === 0) {
      return 0;
    }
    return this.casts.filter((c) => c.duringAbundance).length / this.casts.length;
  }

  getPossiblePerformances(isAdvanced: boolean): QualitativePerformance[] {
    const grades: QualitativePerformance[] = [
      QualitativePerformance.Good,
      QualitativePerformance.Fail,
    ];
    if (isAdvanced && this.hasAbundance) {
      grades.unshift(QualitativePerformance.Perfect);
    }
    if (
      this.hasNaturesBounty ||
      this.hasImprovedRegrowth ||
      (this.hasRampantGrowth && !this.hasOvergrowth)
    ) {
      grades.splice(grades.length - 1, 0, QualitativePerformance.Ok);
    }
    return grades;
  }

  getGuideSubsection(isAdvanced: boolean): JSX.Element | null {
    if (!this.showGuide) {
      return null;
    }

    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.REGROWTH} />
          </b>{' '}
          is your primary healing spell while{' '}
          {this.hasAbundance ? (
            <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} />
          ) : (
            'cheap windows are up'
          )}
          . You should finish fights with many more Regrowth casts than Rejuvenation casts. Outside
          of movement, you should only be casting <SpellLink spell={SPELLS.REJUVENATION} /> when you
          {this.hasSoulOfTheForest ? (
            <>
              {' '}
              have <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} />
              {this.hasAbundance ? ' or ' : null}
            </>
          ) : null}
          {this.hasAbundance ? (
            <>
              need to rebuild <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} />
            </>
          ) : !this.hasSoulOfTheForest ? (
            <>need more HoT coverage</>
          ) : null}
          . Otherwise, keep casting Regrowth
          {this.hasNaturesBounty ? (
            <>
              {' '}
              to get the most value from <SpellLink spell={TALENTS_DRUID.NATURES_BOUNTY_TALENT} />
            </>
          ) : null}
          .
        </p>
        {this.hasNaturesBounty && (
          <p>
            <SpellLink spell={TALENTS_DRUID.NATURES_BOUNTY_TALENT} /> causes your Regrowths to
            cleave, so avoid targeting players who already have an active Regrowth whenever
            possible. This lets the cleave apply new HoTs instead of refreshing existing ones.
            Prefer targets with higher stacks of <SpellLink spell={SPELLS.MASTERY_HARMONY} />, since
            the cleave scales from the direct heal.
          </p>
        )}
        {isAdvanced && this.hasImprovedRegrowth && (
          <p>
            The main exception is <SpellLink spell={TALENTS_DRUID.IMPROVED_REGROWTH_TALENT} />. If a
            player&apos;s Regrowth is already in its pandemic window, refreshing it is very good.
            You don&apos;t lose any HoT duration while gaining the increased critical strike chance
            on that target.
          </p>
        )}
        {this.hasRampantGrowth && (
          <p>
            With <SpellLink spell={TALENTS_DRUID.RAMPANT_GROWTH_TALENT} />, you should avoid
            hardcasting Regrowth on yourself.{' '}
            {this.hasOvergrowth ? (
              <>
                The exception is <SpellLink spell={TALENTS_DRUID.OVERGROWTH_TALENT} /> with{' '}
                <SpellLink spell={SPELLS.NATURES_SWIFTNESS} />: self-cast that during dangerous
                damage to refresh your HoTs
              </>
            ) : null}
            . Prefer other targets
            {this.hasOvergrowth ? ' when you are not refreshing' : ''}.
          </p>
        )}
        <TipBox hideIcon>
          {isAdvanced && this.hasAbundance && (
            <div>
              <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect - Abundance up and
              target has a pandemic-ready Regrowth
            </div>
          )}
          <div>
            <PerformanceMark perf={QualitativePerformance.Good} /> Good -{' '}
            {this.hasAbundance ? (
              <>Abundance up, Clearcasting, Nature&apos;s Swiftness, or triage</>
            ) : (
              <>Clearcasting or triage</>
            )}
            {this.hasRampantGrowth && this.hasOvergrowth && (
              <>
                ; on <SpellLink spell={SPELLS.LIFEBLOOM_HOT_HEAL} /> target with{' '}
                <SpellLink spell={TALENTS_DRUID.OVERGROWTH_TALENT} />
              </>
            )}
          </div>
          {(this.hasNaturesBounty ||
            this.hasImprovedRegrowth ||
            (this.hasRampantGrowth && !this.hasOvergrowth)) && (
            <div>
              <PerformanceMark perf={QualitativePerformance.Ok} /> Ok -{' '}
              {this.hasRampantGrowth && !this.hasOvergrowth && (
                <>
                  Cast on <SpellLink spell={SPELLS.LIFEBLOOM_HOT_HEAL} /> target (Rampant Growth)
                </>
              )}
              {this.hasRampantGrowth &&
                !this.hasOvergrowth &&
                (this.hasNaturesBounty || this.hasImprovedRegrowth) &&
                '; '}
              {(this.hasNaturesBounty || this.hasImprovedRegrowth) && (
                <>
                  Refreshed a long-duration Regrowth
                  {this.hasNaturesBounty ? ' (prefer spreading)' : ''}
                </>
              )}
            </div>
          )}
          <div>
            <PerformanceMark perf={QualitativePerformance.Fail} /> Bad - No Abundance or
            Clearcasting
          </div>
        </TipBox>
      </>
    );

    const stats = [];
    if (this.hasAbundance) {
      stats.push({
        value: `${formatPercentage(this.abundanceCastRate, 0)}%`,
        label: 'Casts During Abundance',
        tooltip: (
          <>
            Share of <SpellLink spell={SPELLS.REGROWTH} /> hardcasts while{' '}
            <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} /> was active
          </>
        ),
        performance: evaluateQualitativePerformanceByThreshold({
          actual: this.abundanceCastRate,
          isGreaterThanOrEqual: { perfect: 0.7, good: 0.5, ok: 0.3 },
        }),
      });
    }
    if (this.hasNaturesBounty) {
      stats.push({
        value: this.avgCleaveHits.toFixed(1),
        label: 'Avg NB Cleaves',
        tooltip: (
          <>
            Average other allies hit by <SpellLink spell={TALENTS_DRUID.NATURES_BOUNTY_TALENT} />{' '}
            per Regrowth (primary target is not included)
          </>
        ),
      });
      stats.push({
        value: this.avgMasteryStacks.toFixed(1),
        label: 'Avg Mastery Stacks',
        tooltip: (
          <>
            Average <SpellLink spell={SPELLS.MASTERY_HARMONY} /> stacks on the Regrowth target at
            cast. Higher stacks increase the direct heal and Nature&apos;s Bounty cleave.
          </>
        ),
        performance: evaluateQualitativePerformanceByThreshold({
          actual: this.avgMasteryStacks,
          isGreaterThanOrEqual: {
            perfect: PERFECT_MASTERY_STACKS,
            good: GOOD_MASTERY_STACKS,
            ok: OK_MASTERY_STACKS,
          },
        }),
      });
    }
    stats.push({
      value: `${formatPercentage(this.avgOverheal, 0)}%`,
      label: 'Avg Overheal',
      tooltip: <>Average overheal across primary heal and Nature&apos;s Bounty cleaves</>,
      performance: evaluateQualitativePerformanceByThreshold({
        actual: this.avgOverheal,
        isLessThanOrEqual: { perfect: 0.3, good: 0.5, ok: 0.7 },
      }),
    });
    stats.push({
      value: formatNumber(this.avgHealingPerCast),
      label: 'Avg Healing Per Cast',
      tooltip: <>Effective healing from the direct heal and Nature&apos;s Bounty cleaves</>,
    });

    return (
      <GuideSection explanation={explanation} explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}>
        <CastOverview
          spell={SPELLS.REGROWTH}
          title={
            <>
              <SpellLink spell={SPELLS.REGROWTH} /> Overview
            </>
          }
          stats={stats}
        />
        <CastDetail
          title="Regrowth Casts"
          casts={this.buildCastDetails(isAdvanced)}
          possiblePerformances={this.getPossiblePerformances(isAdvanced)}
        />
      </GuideSection>
    );
  }

  private displayPerformance(
    performance: QualitativePerformance,
    isAdvanced: boolean,
  ): QualitativePerformance {
    if (!isAdvanced && performance === QualitativePerformance.Perfect) {
      return QualitativePerformance.Good;
    }
    return performance;
  }

  private buildCastDetails(isAdvanced: boolean): PerCastData[] {
    return this.casts.map((cast) => {
      const performance = this.displayPerformance(cast.performance, isAdvanced);
      const totalHealing = cast.primaryHealing + cast.cleaveHealing;
      const primaryRaw = cast.primaryHealing + cast.primaryOverhealing;
      const directOverhealPct = primaryRaw > 0 ? cast.primaryOverhealing / primaryRaw : 0;

      const reasonParts: string[] = [];
      if (cast.duringAbundance) {
        reasonParts.push('Abundance');
      }
      if (cast.freeNote?.includes('Clearcasting') || cast.freeNote?.includes('Swiftness')) {
        reasonParts.push(cast.freeNote);
      }
      if (cast.isTriage) {
        reasonParts.push('Triage');
      }
      if (this.hasRampantGrowth && cast.onLifebloomTarget) {
        reasonParts.push(this.hasOvergrowth ? 'Overgrowth LB refresh' : 'On Lifebloom target');
      }
      if (cast.isPandemicRefresh) {
        reasonParts.push('Pandemic refresh');
      } else if (cast.targetHadRegrowth) {
        reasonParts.push(
          cast.regrowthRemainingMs !== undefined
            ? `Early refresh (${(cast.regrowthRemainingMs / 1000).toFixed(1)}s left)`
            : 'Early refresh',
        );
      } else if (performance !== QualitativePerformance.Fail) {
        reasonParts.push('New Regrowth');
      }
      if (performance === QualitativePerformance.Fail) {
        reasonParts.push('Full price');
      }

      const stats = [];
      if (this.hasNaturesBounty) {
        const cleaveRaw = cast.cleaveHealing + cast.cleaveOverhealing;
        const cleaveOverhealPct = cleaveRaw > 0 ? cast.cleaveOverhealing / cleaveRaw : undefined;
        stats.push({
          value: `${cast.cleaveHits}`,
          label: 'NB Cleaves',
          tooltip:
            cleaveOverhealPct !== undefined
              ? `${formatPercentage(cleaveOverhealPct, 0)}% cleave overheal`
              : "No Nature's Bounty cleaves",
          performance:
            cleaveOverhealPct === undefined
              ? undefined
              : cleaveOverhealPct < LOW_OVERHEAL_THRESHOLD
                ? QualitativePerformance.Good
                : QualitativePerformance.Ok,
        });
        stats.push({
          value: `${cast.masteryStacks}`,
          label: 'Mastery Stacks',
          tooltip: (
            <>
              <SpellLink spell={SPELLS.MASTERY_HARMONY} /> stacks on the target at cast
            </>
          ),
          performance: evaluateQualitativePerformanceByThreshold({
            actual: cast.masteryStacks,
            isGreaterThanOrEqual: {
              perfect: PERFECT_MASTERY_STACKS,
              good: GOOD_MASTERY_STACKS,
              ok: OK_MASTERY_STACKS,
            },
          }),
        });
      }
      stats.push({
        value: `${formatPercentage(directOverhealPct, 0)}%`,
        label: 'Direct Overheal',
        performance: evaluateQualitativePerformanceByThreshold({
          actual: directOverhealPct,
          isLessThanOrEqual: { perfect: 0.3, good: 0.5, ok: 0.7 },
        }),
      });
      stats.push({
        value: formatNumber(totalHealing),
        label: 'Healing',
      });

      return {
        performance,
        timestamp: this.owner.formatTimestamp(cast.timestamp),
        stats,
        details: (
          <>
            {performance}: {reasonParts.join(' · ') || 'Regrowth'} on{' '}
            <strong>{cast.targetName}</strong>
            {cast.targetHealthPercent !== undefined && (
              <> ({formatPercentage(cast.targetHealthPercent, 0)}% HP)</>
            )}
            {this.hasNaturesBounty && (
              <>
                {' '}
                · <SpellLink spell={TALENTS_DRUID.NATURES_BOUNTY_TALENT} /> hit {cast.cleaveHits}
              </>
            )}
          </>
        ),
      };
    });
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(20)}
        tooltip={
          <>
            <SpellLink spell={SPELLS.REGROWTH} /> hardcasts should mostly happen during{' '}
            {this.hasAbundance ? (
              <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} />
            ) : (
              'cheap windows'
            )}
            , when free from <SpellLink spell={SPELLS.CLEARCASTING_BUFF} /> /{' '}
            <SpellLink spell={SPELLS.NATURES_SWIFTNESS} />, or as triage.
            <br />
            <br />
            <strong>
              You hardcast {this.totalRegrowths} <SpellLink spell={SPELLS.REGROWTH} />
            </strong>
            <ul>
              {this.hasAbundance && (
                <li>
                  Perfect (pandemic): <strong>{this.perfectRegrowths}</strong>
                </li>
              )}
              <li>
                Ok (early refresh): <strong>{this.okRegrowths}</strong>
              </li>
              <li>
                <SpellIcon spell={SPELLS.CLEARCASTING_BUFF} />{' '}
                <SpellIcon spell={SPELLS.NATURES_SWIFTNESS} /> Free Casts:{' '}
                <strong>{this.freeRegrowths}</strong>
              </li>
              {this.hasAbundance && (
                <li>
                  <SpellIcon spell={SPELLS.ABUNDANCE_BUFF} /> During Abundance:{' '}
                  <strong>{this.abundanceRegrowths}</strong>
                </li>
              )}
              <li>
                <HealthIcon /> Full Price Triage ({'<'}
                {formatPercentage(TRIAGE_THRESHOLD, 0)}% HP):{' '}
                <strong>{this.triageRegrowths}</strong>
              </li>
              <li>
                <CrossIcon /> Bad Casts: <strong>{this.badRegrowths}</strong>
              </li>
            </ul>
            <br />
            <strong>
              You gained {this.totalClearcasts} <SpellLink spell={SPELLS.CLEARCASTING_BUFF} />
            </strong>
            <ul>
              <li>
                <SpellIcon spell={SPELLS.REGROWTH} /> Used: <strong>{this.usedClearcasts}</strong>
              </li>
              <li>
                <CrossIcon /> Overwritten: <strong>{this.overwrittenClearcasts}</strong>
              </li>
              <li>
                <UptimeIcon /> Expired: <strong>{this.expiredClearcasts}</strong>
              </li>
              {this.endingClearcasts > 0 && (
                <li>
                  Still active at fight end: <strong>{this.endingClearcasts}</strong>
                </li>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.REGROWTH}>
          <>
            {this.badRegrowths === 0 ? <CheckmarkIcon /> : <CrossIcon />}
            {'  '}
            {this.badRegrowths} <small>bad casts</small>
            <br />
            <SpellIcon spell={SPELLS.CLEARCASTING_BUFF} />
            {'  '}
            {formatPercentage(this.clearcastUtilPercent, 1)}% <small>util</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RegrowthAndClearcasting;
