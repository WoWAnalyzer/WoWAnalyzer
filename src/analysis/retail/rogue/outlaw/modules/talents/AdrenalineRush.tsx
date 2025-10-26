import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import { SpellUse, ChecklistUsageInfo } from 'parser/core/SpellUsage/core';
import { createChecklistItem, createSpellUse } from 'parser/core/MajorCooldowns/MajorCooldown';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { HideGoodCastsSpellUsageSubSection } from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import ComboPointTracker from 'analysis/retail/rogue/shared/ComboPointTracker';
import { getGeneratedAdrenalineRushComboPoints } from '../../normalizers/CastLinkNormalizer';
import uptimeBarSubStatistic, { UptimeBarSpec } from 'parser/ui/UptimeBarSubStatistic';

const MAX_GOOD_CP = 2;

export default class AdrenalineRush extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  private cooldownUses: SpellUse[] = [];
  private comboPointTracker!: ComboPointTracker;

  hasImprovedAdrenalineRush = this.selectedCombatant.hasTalent(
    TALENTS.IMPROVED_ADRENALINE_RUSH_TALENT,
  );

  constructor(options: Options) {
    super(options);

    // Currently you just want to avoid overcapping, and that can only happen if you have Improved Adrenaline Rush
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.ADRENALINE_RUSH_TALENT) &&
      this.hasImprovedAdrenalineRush;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ADRENALINE_RUSH_TALENT),
      this.onCast,
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS.ADRENALINE_RUSH_TALENT} />
          </strong>{' '}
          is an important buff to maintain high uptime on, and should be used on cooldown.
        </p>
        <p>
          When playing with <SpellLink spell={TALENTS.IMPROVED_ADRENALINE_RUSH_TALENT} /> you should
          use it at <strong>{MAX_GOOD_CP} or less</strong> Combo Points to avoid overcapping.
        </p>
      </>
    );

    const goodCasts = this.cooldownUses.filter(
      (it) => it.performance === QualitativePerformance.Good,
    ).length;
    const totalCasts = this.cooldownUses.length;

    const adrenalineRushBarSpec: UptimeBarSpec = {
      spells: [TALENTS.ADRENALINE_RUSH_TALENT],
      uptimes: this.selectedCombatant
        .getBuffHistory(TALENTS.ADRENALINE_RUSH_TALENT)
        .map((buff) => ({
          start: buff.start,
          end: buff.end ?? this.owner.currentTimestamp,
        })),
    };

    return (
      <HideGoodCastsSpellUsageSubSection
        hideGoodCasts={false}
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Red indicates bad Adrenaline Rush usage.</>}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            {uptimeBarSubStatistic(this.owner.fight, adrenalineRushBarSpec)}
            <CastPerformanceSummary
              spell={TALENTS.ADRENALINE_RUSH_TALENT}
              casts={goodCasts}
              performance={QualitativePerformance.Good}
              totalCasts={totalCasts}
            />
          </div>
        }
        noCastsTexts={{
          noCastsOverride: 'No Adrenaline Rush casts detected! This is a major mistake.',
        }}
      />
    );
  }

  private onCast(event: CastEvent) {
    const comboPointsAtCast =
      this.comboPointTracker.maxResource - getGeneratedAdrenalineRushComboPoints(event);

    this.cooldownUses.push(
      createSpellUse({ event }, [this.comboPointPerformance(event, comboPointsAtCast)]),
    );
  }

  private comboPointPerformance(
    event: CastEvent,
    comboPointsAtCast: number,
  ): ChecklistUsageInfo | undefined {
    const isGoodCP = comboPointsAtCast <= MAX_GOOD_CP;

    return createChecklistItem(
      'adrenaline_rush_cp',
      { event },
      {
        performance: isGoodCP ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: <div>Combo Point Management</div>,
        details: isGoodCP ? (
          <div>
            You used <SpellLink spell={TALENTS.ADRENALINE_RUSH_TALENT} /> optimally with{' '}
            <strong>{comboPointsAtCast}</strong> combo points.
          </div>
        ) : (
          <div>
            You used <SpellLink spell={TALENTS.ADRENALINE_RUSH_TALENT} /> at{' '}
            <strong>{comboPointsAtCast}</strong> combo points. Try to use it at{' '}
            <strong>{MAX_GOOD_CP} or less</strong> CP to avoid overcapping.
          </div>
        ),
      },
    );
  }
}
