import type { JSX, ReactNode } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import { SpellUse, ChecklistUsageInfo } from 'parser/core/SpellUsage/core';
import { createChecklistItem, createSpellUse } from 'parser/core/MajorCooldowns/MajorCooldown';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { HideGoodCastsSpellUsageSubSection } from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Enemies from 'parser/shared/modules/Enemies';
import { getMatchingDeathmarkOrKingsbaneCast } from 'analysis/retail/rogue/assassination/normalizers/KingsbaneLinkNormalizer';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';

export default class Deathmark extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    enemies: Enemies,
  };

  private cooldownUses: SpellUse[] = [];
  private spellUsable!: SpellUsable;
  private enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DEATHMARK_TALENT),
      this.onCast,
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <div>
        <p>
          <strong>
            <SpellLink spell={TALENTS.DEATHMARK_TALENT} />
          </strong>{' '}
          is your major burst cooldown. It should be aligned with{' '}
          <SpellLink spell={TALENTS.KINGSBANE_TALENT} /> and, if possible, used while having an{' '}
          <SpellLink spell={SPELLS.IMPROVED_GARROTE_BUFF} /> active on your target.
        </p>
        <p>
          <SpellLink spell={SPELLS.VANISH} /> can be used in sync with{' '}
          <SpellLink spell={TALENTS.DEATHMARK_TALENT} /> to apply{' '}
          <SpellLink spell={SPELLS.IMPROVED_GARROTE_BUFF} /> and create a bigger damage window.
        </p>
      </div>
    );

    const goodCasts = this.cooldownUses.filter(
      (it) =>
        it.performance === QualitativePerformance.Good ||
        it.performance === QualitativePerformance.Perfect,
    ).length;
    const totalCasts = this.cooldownUses.length;

    return (
      <HideGoodCastsSpellUsageSubSection
        hideGoodCasts={false}
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Red indicates a wasted or poorly timed Deathmark.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={TALENTS.DEATHMARK_TALENT}
              casts={goodCasts}
              performance={QualitativePerformance.Good}
              totalCasts={totalCasts}
            />
          </div>
        }
        noCastsTexts={{
          noCastsOverride: 'No Deathmark casts detected! This is a major mistake.',
        }}
      />
    );
  }

  private onCast(event: CastEvent) {
    const checklistItems: ChecklistUsageInfo[] = [
      this.kingsbaneAlignment(event),
      this.garroteAndVanishCheck(event),
    ].filter((it): it is ChecklistUsageInfo => it !== undefined);

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    this.cooldownUses.push({
      event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    });
  }

  private kingsbaneAlignment(event: CastEvent): ChecklistUsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS.KINGSBANE_TALENT)) {
      return undefined;
    }

    const matchingKingsbane = getMatchingDeathmarkOrKingsbaneCast(event);
    const performance = matchingKingsbane
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;

    return createChecklistItem(
      'deathmark_kingsbane_alignment',
      { event },
      {
        performance,
        summary: <div>Kingsbane Alignment</div>,
        details: (
          <div>
            {matchingKingsbane ? (
              <>
                <SpellLink spell={TALENTS.KINGSBANE_TALENT} /> was cast during your{' '}
                <SpellLink spell={TALENTS.DEATHMARK_TALENT} /> window. Good job!
              </>
            ) : (
              <>
                You cast <SpellLink spell={TALENTS.DEATHMARK_TALENT} /> but{' '}
                <SpellLink spell={TALENTS.KINGSBANE_TALENT} /> was not cast. Try to align them
                together!
              </>
            )}
          </div>
        ),
      },
    );
  }

  private garroteAndVanishCheck(event: CastEvent): ChecklistUsageInfo | undefined {
    const enemy = this.enemies.getEntity(event);
    const hasImprovedGarrote = enemy ? enemy.hasBuff(SPELLS.GARROTE.id, event.timestamp) : false;

    const isVanishAvailable = this.spellUsable.isAvailable(SPELLS.VANISH.id);

    let performance = QualitativePerformance.Good;
    let details: ReactNode;

    if (hasImprovedGarrote) {
      details = (
        <div>
          Target had <SpellLink spell={SPELLS.IMPROVED_GARROTE_BUFF} /> active. Good job!
        </div>
      );
    } else if (isVanishAvailable) {
      performance = QualitativePerformance.Ok;
      details = (
        <div>
          Target did not have <SpellLink spell={SPELLS.IMPROVED_GARROTE_BUFF} /> active, but{' '}
          <SpellLink spell={SPELLS.VANISH} /> was available. Try to use{' '}
          <SpellLink spell={SPELLS.VANISH} /> to apply an Improved Garrote before{' '}
          <SpellLink spell={TALENTS.DEATHMARK_TALENT} />!
        </div>
      );
    } else {
      performance = QualitativePerformance.Ok;
      details = (
        <div>
          Target did not have <SpellLink spell={SPELLS.IMPROVED_GARROTE_BUFF} /> active and{' '}
          <SpellLink spell={SPELLS.VANISH} /> was not available!
        </div>
      );
    }

    return createChecklistItem(
      'deathmark_garrote_vanish',
      { event },
      {
        performance,
        summary: <div>Improved Garrote & Vanish availability</div>,
        details,
      },
    );
  }
}
