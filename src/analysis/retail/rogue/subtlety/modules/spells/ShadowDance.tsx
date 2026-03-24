import type { JSX } from 'react';
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
import EnergyTracker from 'analysis/retail/rogue/shared/EnergyTracker';
import ComboPointTracker from 'analysis/retail/rogue/shared/ComboPointTracker';

export default class ShadowDance extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
    comboPointTracker: ComboPointTracker,
  };

  private cooldownUses: SpellUse[] = [];
  private energyTracker!: EnergyTracker;
  private comboPointTracker!: ComboPointTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_DANCE), this.onCast);
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.SHADOW_DANCE} />
        </strong>{' '}
        is Subtlety Rogue's most important cooldown. It should be used strategically with{' '}
        <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> and major cooldowns like{' '}
        <SpellLink spell={TALENTS.FLAGELLATION_TALENT} /> and{' '}
        <SpellLink spell={TALENTS.SHADOW_BLADES_TALENT} />.
      </p>
    );

    const goodCasts = this.cooldownUses.filter(
      (it) => it.performance === QualitativePerformance.Good,
    ).length;
    const totalCasts = this.cooldownUses.length;

    return (
      <HideGoodCastsSpellUsageSubSection
        hideGoodCasts={false}
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Red indicates a wasted Shadow Dance.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={SPELLS.SHADOW_DANCE}
              casts={goodCasts}
              performance={QualitativePerformance.Good}
              totalCasts={totalCasts}
            />
          </div>
        }
        noCastsTexts={{
          noCastsOverride: 'No Shadow Dance casts detected! This is a major mistake.',
        }}
      />
    );
  }

  private onCast(event: CastEvent) {
    const energyAtCast = this.energyTracker.current;
    const comboPointsAtCast = this.comboPointTracker.current;
    const hasSymbolsActive = this.selectedCombatant.hasBuff(
      SPELLS.SYMBOLS_OF_DEATH.id,
      event.timestamp,
    );

    this.cooldownUses.push(
      createSpellUse({ event }, [
        this.energyPerformance(event, energyAtCast),
        this.comboPointPerformance(event, comboPointsAtCast),
        this.buffAlignmentPerformance(event, hasSymbolsActive),
        this.energyPerformance(event, energyAtCast),
      ]),
    );
  }

  private energyPerformance(
    event: CastEvent,
    energyAtCast: number,
  ): ChecklistUsageInfo | undefined {
    const isGoodEnergy = energyAtCast >= 60;

    return createChecklistItem(
      'shadow_dance_energy',
      { event },
      {
        performance: isGoodEnergy ? QualitativePerformance.Perfect : QualitativePerformance.Good,
        summary: <div>Energy Management</div>,
        details: isGoodEnergy ? (
          <div>
            You activated <SpellLink spell={SPELLS.SHADOW_DANCE} /> with sufficient energy (
            {energyAtCast}). Well played!
          </div>
        ) : (
          <div>
            You activated <SpellLink spell={SPELLS.SHADOW_DANCE} /> with only {energyAtCast} energy.
            Try to start with at least 60 energy for maximum burst potential.
          </div>
        ),
      },
    );
  }

  private comboPointPerformance(
    event: CastEvent,
    comboPointsAtCast: number,
  ): ChecklistUsageInfo | undefined {
    const isGoodCP = comboPointsAtCast === 0 || comboPointsAtCast >= 6;

    return createChecklistItem(
      'shadow_dance_cp',
      { event },
      {
        performance: isGoodCP ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: <div>Combo Point Management</div>,
        details: isGoodCP ? (
          <div>
            You used <SpellLink spell={SPELLS.SHADOW_DANCE} /> optimally with {comboPointsAtCast}{' '}
            combo points.
          </div>
        ) : (
          <div>
            You used <SpellLink spell={SPELLS.SHADOW_DANCE} /> at{' '}
            <strong>{comboPointsAtCast}</strong> combo points. Try to use it at{' '}
            <strong> 6+ CP for a finisher</strong>.
          </div>
        ),
      },
    );
  }

  private buffAlignmentPerformance(
    event: CastEvent,
    hasSymbolsActive: boolean,
  ): ChecklistUsageInfo | undefined {
    return createChecklistItem(
      'shadow_dance_alignment',
      { event },
      {
        performance: hasSymbolsActive
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Fail,
        summary: <div>Buff Alignment</div>,
        details: (
          <div>
            {hasSymbolsActive ? (
              <>
                <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> was active.
              </>
            ) : (
              <>
                Missing <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} />.
              </>
            )}
          </div>
        ),
      },
    );
  }
}
