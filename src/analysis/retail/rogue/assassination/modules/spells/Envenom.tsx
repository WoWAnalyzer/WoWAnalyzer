import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/rogue';
import Events, { CastEvent, TargettedEvent } from 'parser/core/Events';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import RuptureUptimeAndSnapshots from 'analysis/retail/rogue/assassination/modules/spells/RuptureUptimeAndSnapshots';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatDurationMillisMinSec } from 'common/format';
import { ReactNode } from 'react';
import SpellLink from 'interface/SpellLink';
import {
  animachargedCheckedUsageInfo,
  getMaxComboPoints,
} from 'analysis/retail/rogue/assassination/constants';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import Enemies from 'parser/shared/modules/Enemies';
import HideGoodCastsSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';

const MIN_ACCEPTABLE_TIME_LEFT_ON_RUPTURE_MS = 5000;

export default class Envenom extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    ruptureUptimeAndSnapshots: RuptureUptimeAndSnapshots,
  };

  cooldownUses: SpellUse[] = [];

  protected enemies!: Enemies;
  protected ruptureUptimeAndSnapshots!: RuptureUptimeAndSnapshots;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ENVENOM), this.onCast);
  }

  /** Subsection explaining the use of Envenom and providing performance statistics */
  get guideSubsection(): JSX.Element {
    const maxCps = getMaxComboPoints(this.selectedCombatant);
    const targetCps = maxCps - 1;
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.ENVENOM} />
        </strong>{' '}
        is your direct damage finisher. Use it when you've already applied{' '}
        <SpellLink spell={SPELLS.RUPTURE} /> to enemies. Always use{' '}
        <SpellLink spell={SPELLS.ENVENOM} /> at {targetCps}-{maxCps} CPs.
      </p>
    );

    return (
      <HideGoodCastsSpellUsageSubSection
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={
          <>
            {' '}
            - Blue is an Animacharged cast, Green is a good cast, Yellow is an ok cast, Red is a bad
            cast.
          </>
        }
      />
    );
  }

  private onCast(event: CastEvent) {
    let timeLeftOnRupture = 0;
    // target is optional in cast event, but we know Envenom cast will always have it
    if (event.targetID !== undefined && event.targetIsFriendly !== undefined) {
      timeLeftOnRupture = this.ruptureUptimeAndSnapshots.getTimeRemaining(
        event as TargettedEvent<any>,
      );
    }
    const acceptableTimeLeftOnRupture = timeLeftOnRupture >= MIN_ACCEPTABLE_TIME_LEFT_ON_RUPTURE_MS;

    const rupturePerformance = acceptableTimeLeftOnRupture
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;
    const ruptureSummary =
      timeLeftOnRupture > 0 ? (
        <div>Time remaining on Rupture: {formatDurationMillisMinSec(timeLeftOnRupture)}</div>
      ) : (
        <div>No Rupture on target</div>
      );
    let ruptureDetails: ReactNode;
    if (acceptableTimeLeftOnRupture) {
      ruptureDetails = (
        <div>
          You cast <SpellLink spell={SPELLS.ENVENOM} /> with{' '}
          {formatDurationMillisMinSec(timeLeftOnRupture)} left on{' '}
          <SpellLink spell={SPELLS.RUPTURE} />.
        </div>
      );
    } else if (timeLeftOnRupture > 1000) {
      ruptureDetails = (
        <div>
          You cast <SpellLink spell={SPELLS.ENVENOM} /> with{' '}
          {formatDurationMillisMinSec(timeLeftOnRupture)} left on{' '}
          <SpellLink spell={SPELLS.RUPTURE} />. Try not to cast <SpellLink spell={SPELLS.ENVENOM} />{' '}
          with less than {formatDurationMillisMinSec(MIN_ACCEPTABLE_TIME_LEFT_ON_RUPTURE_MS)} left
          on <SpellLink spell={SPELLS.RUPTURE} />, as it may cause you to miss pandemic-ing{' '}
          <SpellLink spell={SPELLS.RUPTURE} />.
        </div>
      );
    } else if (timeLeftOnRupture > 0) {
      ruptureDetails = (
        <div>
          You cast <SpellLink spell={SPELLS.ENVENOM} /> with less than 1s left on{' '}
          <SpellLink spell={SPELLS.RUPTURE} />. Try not to cast <SpellLink spell={SPELLS.ENVENOM} />{' '}
          with less than {formatDurationMillisMinSec(MIN_ACCEPTABLE_TIME_LEFT_ON_RUPTURE_MS)} left
          on <SpellLink spell={SPELLS.RUPTURE} />, as it may cause you to miss pandemic-ing{' '}
          <SpellLink spell={SPELLS.RUPTURE} />.
        </div>
      );
    } else {
      ruptureDetails = (
        <div>
          You cast <SpellLink spell={SPELLS.ENVENOM} /> with no <SpellLink spell={SPELLS.RUPTURE} />{' '}
          applied to the target. Always ensure that your target has{' '}
          <SpellLink spell={SPELLS.RUPTURE} /> applied before casting{' '}
          <SpellLink spell={SPELLS.ENVENOM} />.
        </div>
      );
    }

    const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    const targetCps = getMaxComboPoints(this.selectedCombatant) - 1;
    const appropriateCpsSpent = cpsSpent >= targetCps;
    const cpsPerformance = appropriateCpsSpent
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;
    let cpsSummary: ReactNode;
    let cpsDetails: ReactNode;
    if (appropriateCpsSpent) {
      cpsSummary = <div>Spent &gt;= {targetCps} CPs</div>;
      cpsDetails = <div>You spent {cpsSpent} CPs.</div>;
    } else {
      cpsSummary = <div>Spend &gt;= {targetCps} CPs</div>;
      cpsDetails = (
        <div>
          You spent {cpsSpent} CPs. Try to always spend at least {targetCps} CPs when casting{' '}
          <SpellLink spell={SPELLS.ENVENOM} />.
        </div>
      );
    }

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'rupture',
        timestamp: event.timestamp,
        performance: rupturePerformance,
        summary: ruptureSummary,
        details: ruptureDetails,
      },
      {
        check: 'cps',
        timestamp: event.timestamp,
        performance: cpsPerformance,
        summary: cpsSummary,
        details: cpsDetails,
      },
    ];

    const actualChecklistItems = animachargedCheckedUsageInfo(
      this.selectedCombatant,
      event,
      checklistItems,
    );
    const actualPerformance = combineQualitativePerformances(
      actualChecklistItems.map((it) => it.performance),
    );

    this.cooldownUses.push({
      event,
      performance: actualPerformance,
      checklistItems: actualChecklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    });

    // TODO also highlight 'bad' Envenoms in the timeline
  }
}
