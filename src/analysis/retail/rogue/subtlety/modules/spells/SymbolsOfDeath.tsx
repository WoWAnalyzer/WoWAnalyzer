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

export default class SymbolsOfDeath extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };

  private cooldownUses: SpellUse[] = [];
  private energyTracker!: EnergyTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SYMBOLS_OF_DEATH),
      this.onCast,
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} />
        </strong>{' '}
        is a key cooldown for burst windows. It should be used as frequently as possible, ideally
        aligning with <SpellLink spell={TALENTS.SECRET_TECHNIQUE_TALENT} /> for maximum damage
        output.
      </p>
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
        castBreakdownSmallText={<> - Red indicates a wasted Symbols of Death.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={SPELLS.SYMBOLS_OF_DEATH}
              casts={goodCasts}
              performance={QualitativePerformance.Good}
              totalCasts={totalCasts}
            />
          </div>
        }
        noCastsTexts={{
          noCastsOverride: 'No Symbols of Death casts detected! This is a major mistake.',
        }}
      />
    );
  }

  private onCast(event: CastEvent) {
    const energyAtCast = this.energyTracker.current;
    const hasSecretTechnique =
      this.selectedCombatant.hasTalent(TALENTS.SECRET_TECHNIQUE_TALENT) &&
      this.selectedCombatant.hasBuff(TALENTS.SECRET_TECHNIQUE_TALENT.id, event.timestamp);

    this.cooldownUses.push(
      createSpellUse({ event }, [
        this.energyPerformance(event, energyAtCast, hasSecretTechnique),
        this.secretTechniquePerformance(event, hasSecretTechnique),
      ]),
    );
  }

  private energyPerformance(
    event: CastEvent,
    energyAtCast: number,
    hasSecretTechnique: boolean,
  ): ChecklistUsageInfo | undefined {
    const energyGained = 40;
    const wastedEnergy = Math.max(0, energyAtCast + energyGained - 100);
    const isEnergyWasted = wastedEnergy > 0;

    let performance: QualitativePerformance;
    let summary: JSX.Element;
    let details: JSX.Element;

    if (energyAtCast === 100 && !hasSecretTechnique) {
      performance = QualitativePerformance.Fail;
      summary = <div>Major Energy Waste</div>;
      details = (
        <div>
          You used <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> at <strong>{energyAtCast}</strong>{' '}
          energy without <strong>Secret Technique</strong>. This means you{' '}
          <strong>wasted {wastedEnergy} energy</strong>. Try using abilities before activating
          Symbols of Death!
        </div>
      );
    } else if (isEnergyWasted) {
      performance = QualitativePerformance.Good;
      summary = <div>Energy Usage Could Be Improved</div>;
      details = (
        <div>
          You used <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> with{' '}
          <strong>{energyAtCast} energy</strong>, resulting in some wasted energy ({wastedEnergy}).
          Try to use abilities before activating Symbols of Death to{' '}
          <strong>optimize energy gain</strong>.
        </div>
      );
    } else {
      performance = QualitativePerformance.Perfect;
      summary = <div>Perfect Energy Management</div>;
      details = (
        <div>
          You activated <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> with{' '}
          <strong>optimal energy management</strong> ({energyAtCast}). Well played!
        </div>
      );
    }

    return createChecklistItem(
      'symbols_of_death_energy',
      { event },
      { performance, summary, details },
    );
  }

  private secretTechniquePerformance(
    event: CastEvent,
    hasSecretTechnique: boolean,
  ): ChecklistUsageInfo | undefined {
    const isGoodEnergy = this.energyTracker.current >= 60;

    let performance: QualitativePerformance;
    let summary: JSX.Element;
    let details: JSX.Element;

    if (hasSecretTechnique && isGoodEnergy) {
      performance = QualitativePerformance.Perfect;
      summary = <div>Perfect Symbols of Death</div>;
      details = (
        <div>
          You used <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> <strong>with</strong>{' '}
          <SpellLink spell={TALENTS.SECRET_TECHNIQUE_TALENT} /> and had{' '}
          <strong>{this.energyTracker.current} energy</strong>. Excellent job!
        </div>
      );
    } else if (hasSecretTechnique || isGoodEnergy) {
      performance = QualitativePerformance.Good;
      summary = <div>Good Usage</div>;
      details = (
        <div>
          You used <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} />, but{' '}
          {!hasSecretTechnique && 'missed Secret Technique.'}
          {!isGoodEnergy && `you had only ${this.energyTracker.current} energy.`}
          Try to optimize both for <strong>maximum burst damage</strong>.
        </div>
      );
    } else {
      performance = QualitativePerformance.Fail;
      summary = <div>Poor Symbols of Death Usage</div>;
      details = (
        <div>
          You used <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> without{' '}
          <strong>Secret Technique</strong> and with <strong>low energy</strong>. Try to align them
          and have at least 60 energy before using Symbols of Death.
        </div>
      );
    }

    return createChecklistItem(
      'symbols_of_death_alignment',
      { event },
      { performance, summary, details },
    );
  }
}
