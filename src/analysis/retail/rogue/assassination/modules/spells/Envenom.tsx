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
  getTargetComboPoints,
} from 'analysis/retail/rogue/assassination/constants';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import Enemies from 'parser/shared/modules/Enemies';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { RoundedPanelWithBottomMargin } from 'analysis/retail/rogue/shared/styled-components';

const MIN_ACCEPTABLE_TIME_LEFT_ON_RUPTURE_MS = 3000;

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
    const targetCps = getTargetComboPoints(this.selectedCombatant);
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.ENVENOM} />
        </strong>{' '}
        is your direct damage finisher. Use it when you've already applied{' '}
        <SpellLink spell={SPELLS.RUPTURE} /> to enemies. Always use{' '}
        <SpellLink spell={SPELLS.ENVENOM} /> at {targetCps}+ CPs.
      </p>
    );

    return (
      <ContextualSpellUsageSubSection
        explanation={explanation}
        uses={this.cooldownUses}
        abovePerformanceDetails={
          <RoundedPanelWithBottomMargin>
            <div>
              <strong>
                <SpellLink spell={SPELLS.ENVENOM} /> uptime
              </strong>
              <small> - Try to get as close to 100% as the encounter allows!</small>
            </div>
            {uptimeBarSubStatistic(this.owner.fight, {
              spells: [SPELLS.ENVENOM],
              uptimes: this.envenomBuffUptimes,
            })}
          </RoundedPanelWithBottomMargin>
        }
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

  private get envenomBuffUptimes() {
    return this.selectedCombatant.getBuffHistory(SPELLS.ENVENOM.id).map((buff) => ({
      start: buff.start,
      end: buff.end ?? this.owner.fight.end_time,
    }));
  }

  private onCast(event: CastEvent) {
    const checklistItems: ChecklistUsageInfo[] = [
      this.determineEnvenomDuringRupturePerformance(event),
      this.determineComboPointsPerformance(event),
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
  }

  private determineEnvenomDuringRupturePerformance(event: CastEvent): ChecklistUsageInfo {
    let timeLeftOnRupture = 0;
    // target is optional in cast event, but we know Envenom cast will always have it
    if (event.targetID !== undefined && event.targetIsFriendly !== undefined) {
      timeLeftOnRupture = this.ruptureUptimeAndSnapshots.getTimeRemaining(
        event as TargettedEvent<any>,
      );
    }
    const acceptableTimeLeftOnRupture = timeLeftOnRupture >= MIN_ACCEPTABLE_TIME_LEFT_ON_RUPTURE_MS;

    const performance = acceptableTimeLeftOnRupture
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;
    const summary = <div>Don&apos;t need to pandemic Rupture</div>;
    let details: ReactNode;
    if (acceptableTimeLeftOnRupture) {
      details = (
        <div>
          You cast <SpellLink spell={SPELLS.ENVENOM} /> with{' '}
          {formatDurationMillisMinSec(timeLeftOnRupture)} left on{' '}
          <SpellLink spell={SPELLS.RUPTURE} />.
        </div>
      );
    } else if (timeLeftOnRupture > 1000) {
      details = (
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
      details = (
        <div>
          You cast <SpellLink spell={SPELLS.ENVENOM} /> with less than 1s left on{' '}
          <SpellLink spell={SPELLS.RUPTURE} />. Try not to cast <SpellLink spell={SPELLS.ENVENOM} />{' '}
          with less than {formatDurationMillisMinSec(MIN_ACCEPTABLE_TIME_LEFT_ON_RUPTURE_MS)} left
          on <SpellLink spell={SPELLS.RUPTURE} />, as it may cause you to miss pandemic-ing{' '}
          <SpellLink spell={SPELLS.RUPTURE} />.
        </div>
      );
    } else {
      details = (
        <div>
          You cast <SpellLink spell={SPELLS.ENVENOM} /> with no <SpellLink spell={SPELLS.RUPTURE} />{' '}
          applied to the target. Always ensure that your target has{' '}
          <SpellLink spell={SPELLS.RUPTURE} /> applied before casting{' '}
          <SpellLink spell={SPELLS.ENVENOM} />.
        </div>
      );
    }

    if (performance === QualitativePerformance.Fail) {
      addInefficientCastReason(event, details);
    }

    return {
      check: 'rupture',
      timestamp: event.timestamp,
      performance,
      summary,
      details,
    };
  }

  private determineComboPointsPerformance(event: CastEvent): ChecklistUsageInfo {
    const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    const targetCps = getTargetComboPoints(this.selectedCombatant);
    const appropriateCpsSpent = cpsSpent >= targetCps;
    const performance = appropriateCpsSpent
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;
    const summary: ReactNode = <div>Spend {targetCps}+ CPs</div>;
    let details: ReactNode;
    if (appropriateCpsSpent) {
      details = <div>You spent {cpsSpent} CPs.</div>;
    } else {
      details = (
        <div>
          You spent {cpsSpent} CPs. Try to always spend {targetCps}+ CPs when casting{' '}
          <SpellLink spell={SPELLS.ENVENOM} />.
        </div>
      );
    }

    if (performance === QualitativePerformance.Fail) {
      addInefficientCastReason(event, details);
    }

    return {
      check: 'cps',
      timestamp: event.timestamp,
      performance,
      summary,
      details,
    };
  }
}
