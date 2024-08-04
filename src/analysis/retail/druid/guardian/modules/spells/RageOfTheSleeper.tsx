import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
  Mitigation,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options } from 'parser/core/Module';
import Events, { ApplyBuffEvent, DamageEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { RAGE_OF_THE_SLEEPER_MIT } from 'analysis/retail/druid/guardian/constants';
import RageTracker, {
  RAGE_SCALE_FACTOR,
} from 'analysis/retail/druid/guardian/modules/core/rage/RageTracker';
import SPELLS from 'common/SPELLS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { getAveragePerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { formatNumber, formatPercentage } from 'common/format';

const PERFECT_RAGE_POOL = 80 / RAGE_SCALE_FACTOR;
const GOOD_RAGE_POOL = 60 / RAGE_SCALE_FACTOR;
const OK_RAGE_POOL = 30 / RAGE_SCALE_FACTOR;
export function getRagePoolPerf(rage: number): QualitativePerformance {
  if (rage >= PERFECT_RAGE_POOL) {
    return QualitativePerformance.Perfect;
  } else if (rage >= GOOD_RAGE_POOL) {
    return QualitativePerformance.Good;
  } else if (rage >= OK_RAGE_POOL) {
    return QualitativePerformance.Ok;
  } else {
    return QualitativePerformance.Fail;
  }
}

const PERFECT_TNC_POOL = 2;
const GOOD_TNC_POOL = 1;
export function getTncPoolPerf(procs: number): QualitativePerformance {
  if (procs >= PERFECT_TNC_POOL) {
    return QualitativePerformance.Perfect;
  } else if (procs >= GOOD_TNC_POOL) {
    return QualitativePerformance.Good;
  } else {
    return QualitativePerformance.Ok;
  }
}

/**
 * **Rage of the Sleeper**
 * Spec Talent
 * Unleashes the rage of Ursoc for 8 sec, preventing 20% of all damage you take,
 * increasing your damage done by 15%, granting you 20% leech,
 * and reflecting X Nature damage back at your attackers.
 */
export default class RageOfTheSleeper extends MajorDefensiveBuff {
  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
    rageTracker: RageTracker,
  };

  protected rageTracker!: RageTracker;

  rotsTrackers: RotsCast[] = [];

  constructor(options: Options) {
    super(
      TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT,
      buff(TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT),
      options,
    );
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT),
      this.onApplyRots,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT),
      this.onRemoveRots,
    );
    this.addEventListener(Events.fightend, this.onRemoveRots);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.MAUL, TALENTS_DRUID.RAZE_TALENT]),
      this.onMaulOrRaze,
    );
  }

  onApplyRots(event: ApplyBuffEvent) {
    this.rotsTrackers.push({
      startTimestamp: event.timestamp,
      endTimestamp: undefined,
      rageOnCast: this.rageTracker.current,
      tncProcsOnCast: this.selectedCombatant.getBuffStacks(SPELLS.TOOTH_AND_CLAW_BUFF.id),
      maulsAndRazesCount: 0,
    });
  }

  onRemoveRots() {
    const lastRots = this.rotsTrackers.at(-1);
    if (lastRots && lastRots.endTimestamp === undefined) {
      lastRots.endTimestamp = this.owner.currentTimestamp;
    }
  }

  onMaulOrRaze() {
    const lastRots = this.rotsTrackers.at(-1);
    if (lastRots && lastRots.endTimestamp === undefined) {
      // indicates a RotS is active
      lastRots.maulsAndRazesCount += 1;
    }
  }

  ///////////////////////////////////////////////////////////////////
  // MAJOR DEFENSIVE stuff

  private recordDamage(event: DamageEvent) {
    // TODO also count the flat mitigation / reflect
    if (this.defensiveActive(event) && !event.sourceIsFriendly) {
      this.recordMitigation({
        event,
        mitigatedAmount: absoluteMitigation(event, RAGE_OF_THE_SLEEPER_MIT),
      });
    }
  }

  description(): React.ReactNode {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT} />
          </strong>{' '}
          provides a moderate damage reduction in addition to Leech and an outgoing damage boost.
        </p>
        <p>
          It's best when you will be both taking and dealing a large volume of damage, like during a
          large pull in Dungeons or while picking up many adds in Raids.
        </p>
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }

  ///////////////////////////////////////////////////////////////////
  // OFFENSIVE COOLDOWN guide stuff

  private perCastBreakdown(cast: RotsCast, ix: number): React.ReactNode {
    const header = (
      <>
        @ {this.owner.formatTimestamp(cast.startTimestamp)} &mdash;{' '}
        <SpellLink spell={TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT} />
      </>
    );

    let castMit: Mitigation | undefined = undefined;
    let mitPerf: QualitativePerformance = QualitativePerformance.Good;
    if (this.mitigations.length <= ix) {
      console.error(
        'RageOfTheSleeper had mismatch in defensive and offensive tracker array lengths - should not have been possible',
      );
    } else {
      castMit = this.mitigations[ix];
      const { perf } = this.explainPerformance(castMit);
      mitPerf = perf;
    }

    const ragePoolPerf = getRagePoolPerf(cast.rageOnCast);
    const tncPoolPerf = getTncPoolPerf(cast.tncProcsOnCast);

    const checklistItems: CooldownExpandableItem[] = [];
    checklistItems.push({
      label: <>Pool Rage</>,
      result: <PerformanceMark perf={ragePoolPerf} />,
      details: (
        <>
          (<strong>{(cast.rageOnCast * RAGE_SCALE_FACTOR).toFixed(0)}</strong> rage on cast)
        </>
      ),
    });
    checklistItems.push({
      label: (
        <>
          Pool <SpellLink spell={TALENTS_DRUID.TOOTH_AND_CLAW_TALENT} /> procs
        </>
      ),
      result: <PerformanceMark perf={tncPoolPerf} />,
      details: (
        <>
          (<strong>{cast.tncProcsOnCast}</strong> procs available on cast)
        </>
      ),
    });
    if (castMit) {
      const maxHpPercent = castMit.amount / this.firstSeenMaxHp;
      checklistItems.push({
        label: <>Mitigate incoming damage</>,
        result: <PerformanceMark perf={mitPerf} />,
        details: (
          <>
            prevented <strong>{formatNumber(castMit.amount)}</strong> damage (
            {formatPercentage(maxHpPercent, 0)}% of Max HP)
          </>
        ),
      });
    } else {
      checklistItems.push({
        label: <>Mitigate incoming damage</>,
        details: <>ERROR RETRIEVING MITIGATION DATA</>,
      });
    }

    const overallPerf = getAveragePerf([ragePoolPerf, tncPoolPerf, mitPerf]);

    const detailItems: CooldownExpandableItem[] = [];
    detailItems.push({
      label: (
        <>
          <SpellLink spell={SPELLS.MAUL} /> & <SpellLink spell={TALENTS_DRUID.RAZE_TALENT} />
        </>
      ),
      details: (
        <>
          <strong>{cast.maulsAndRazesCount}</strong> casts
        </>
      ),
    });

    return (
      <CooldownExpandable
        header={header}
        checklistItems={checklistItems}
        detailItems={detailItems}
        perf={overallPerf}
        key={cast.startTimestamp}
      />
    );
  }

  get guideCastBreakdown(): React.ReactNode {
    const hasTnc = this.selectedCombatant.hasTalent(TALENTS_DRUID.TOOTH_AND_CLAW_TALENT);
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT} />
        </strong>{' '}
        is both an offensive and defensive cooldown. Save it for defense if the fight requires, but
        if you can afford to use it offensively use it as often as possible and try to pool Rage
        {hasTnc && (
          <>
            {' '}
            and <SpellLink spell={TALENTS_DRUID.TOOTH_AND_CLAW_TALENT} /> procs
          </>
        )}{' '}
        beforehand.
      </p>
    );

    const data = (
      <p>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.rotsTrackers.map((cast, ix) => this.perCastBreakdown(cast, ix))}
      </p>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

interface RotsCast {
  startTimestamp: number;
  endTimestamp?: number; // Fill when cast falls
  rageOnCast: number;
  tncProcsOnCast: number;
  maulsAndRazesCount: number;
}
