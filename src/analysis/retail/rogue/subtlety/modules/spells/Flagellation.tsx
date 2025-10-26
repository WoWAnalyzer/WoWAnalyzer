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
import ComboPointTracker from 'analysis/retail/rogue/shared/ComboPointTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class FlagellationAnalysis extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
    spellUsable: SpellUsable,
  };

  private cooldownUses: SpellUse[] = [];
  private comboPointTracker!: ComboPointTracker;
  private spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLAGELLATION), this.onCast);
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.FLAGELLATION} />
        </strong>{' '}
        is one of Subtlety Rogue's most important cooldowns. It should be used strategically with{' '}
        <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> and major cooldowns like{' '}
        <SpellLink spell={SPELLS.SHADOW_DANCE} /> and{' '}
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
        castBreakdownSmallText={<> - Red indicates a wasted Flagellation.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={SPELLS.FLAGELLATION}
              casts={goodCasts}
              performance={QualitativePerformance.Good}
              totalCasts={totalCasts}
            />
          </div>
        }
        noCastsTexts={{
          noCastsOverride: 'No Flagellation casts detected! This is a major mistake.',
        }}
      />
    );
  }

  private onCast(event: CastEvent) {
    const comboPointsAtCast = this.comboPointTracker.current;
    const hasBladesAvailable = this.spellUsable.isAvailable(TALENTS.SHADOW_BLADES_TALENT.id);
    const hasSymbolsAvailable =
      (this.spellUsable.chargesAvailable(SPELLS.SYMBOLS_OF_DEATH.id) === 1 &&
        this.spellUsable.cooldownRemaining(SPELLS.SYMBOLS_OF_DEATH.id, event.timestamp) < 10) ||
      this.spellUsable.chargesAvailable(SPELLS.SYMBOLS_OF_DEATH.id) >= 2;
    const hasShadowDanceAvailable =
      (this.spellUsable.chargesAvailable(SPELLS.SHADOW_DANCE.id) === 1 &&
        this.spellUsable.cooldownRemaining(SPELLS.SHADOW_DANCE.id, event.timestamp) < 40) ||
      this.spellUsable.chargesAvailable(SPELLS.SHADOW_DANCE.id) === 2;
    const hasSecretTechniqueAvailable = this.spellUsable.isAvailable(SPELLS.SECRET_TECHNIQUE.id);

    this.cooldownUses.push(
      createSpellUse({ event }, [
        // this.energyPerformance(event, energyAtCast),
        this.comboPointPerformance(event, comboPointsAtCast),
        ...this.cooldownAlignmentPerformance(
          event,
          hasBladesAvailable,
          hasSymbolsAvailable,
          hasShadowDanceAvailable,
          hasSecretTechniqueAvailable,
        ),
      ]),
    );
  }

  private comboPointPerformance(
    event: CastEvent,
    comboPointsAtCast: number,
  ): ChecklistUsageInfo | undefined {
    const isGoodCP = comboPointsAtCast > 5;

    return createChecklistItem(
      'flagellation_cp',
      { event },
      {
        performance: isGoodCP ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: <div>Combo Point Management</div>,
        details: isGoodCP ? (
          <div>
            You used <SpellLink spell={SPELLS.FLAGELLATION} /> optimally with{' '}
            <strong>{comboPointsAtCast}</strong> combo points.
          </div>
        ) : (
          <div>
            You used <SpellLink spell={SPELLS.FLAGELLATION} /> at{' '}
            <strong>{comboPointsAtCast}</strong> combo points. Try to use it at{' '}
            <strong>6 or more</strong> CP for a finisher.
          </div>
        ),
      },
    );
  }

  private cooldownAlignmentPerformance(
    event: CastEvent,
    hasBladesAvailable: boolean,
    hasSymbolsAvailable: boolean,
    hasShadowDanceAvailable: boolean,
    hasSecretTechniqueAvailable: boolean,
  ): ChecklistUsageInfo[] {
    return [
      this.bladesPerformance(event, hasBladesAvailable),
      this.symbolsPerformance(event, hasSymbolsAvailable),
      this.shadowDancePerformance(event, hasShadowDanceAvailable),
      this.secretTechniquePerformance(event, hasSecretTechniqueAvailable),
    ].filter((performance): performance is ChecklistUsageInfo => performance !== undefined);
  }

  private bladesPerformance(
    event: CastEvent,
    hasBladesAvailable: boolean,
  ): ChecklistUsageInfo | undefined {
    return createChecklistItem(
      'flagellation_blades',
      { event },
      {
        performance: hasBladesAvailable ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: <div>Shadow Blades Cooldown</div>,
        details: hasBladesAvailable ? (
          <div>
            <SpellLink spell={TALENTS.SHADOW_BLADES_TALENT} /> cooldown was available.
          </div>
        ) : (
          <div>
            <SpellLink spell={TALENTS.SHADOW_BLADES_TALENT} /> cooldown was not available.
          </div>
        ),
      },
    );
  }

  private symbolsPerformance(
    event: CastEvent,
    hasSymbolsAvailable: boolean,
  ): ChecklistUsageInfo | undefined {
    return createChecklistItem(
      'flagellation_symbols',
      { event },
      {
        performance: hasSymbolsAvailable
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail,
        summary: <div>Symbols of Death Cooldown</div>,
        details: hasSymbolsAvailable ? (
          <div>
            <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> has at least one charge and less than 10
            seconds left on the second charge.
          </div>
        ) : (
          <div>
            <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> did not have enough charges available.
          </div>
        ),
      },
    );
  }

  private shadowDancePerformance(
    event: CastEvent,
    hasShadowDanceAvailable: boolean,
  ): ChecklistUsageInfo | undefined {
    return createChecklistItem(
      'flagellation_shadow_dance',
      { event },
      {
        performance: hasShadowDanceAvailable
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail,
        summary: <div>Shadow Dance Cooldown</div>,
        details: hasShadowDanceAvailable ? (
          <div>
            <SpellLink spell={SPELLS.SHADOW_DANCE} /> has at least one charge and less than 40
            seconds left on the second charge.
          </div>
        ) : (
          <div>
            <SpellLink spell={SPELLS.SHADOW_DANCE} /> did not have enough charges available.
          </div>
        ),
      },
    );
  }

  private secretTechniquePerformance(
    event: CastEvent,
    hasSecretTechniqueAvailable: boolean,
  ): ChecklistUsageInfo | undefined {
    return createChecklistItem(
      'flagellation_secret_technique',
      { event },
      {
        performance: hasSecretTechniqueAvailable
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail,
        summary: <div>Secret Technique Cooldown</div>,
        details: hasSecretTechniqueAvailable ? (
          <div>
            <SpellLink spell={SPELLS.SECRET_TECHNIQUE} /> cooldown was available.
          </div>
        ) : (
          <div>
            <SpellLink spell={SPELLS.SECRET_TECHNIQUE} /> cooldown was not available.
          </div>
        ),
      },
    );
  }
}
