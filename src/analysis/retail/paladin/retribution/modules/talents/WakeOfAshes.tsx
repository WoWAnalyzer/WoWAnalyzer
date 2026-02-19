import { SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import SPELLS from 'common/SPELLS/paladin';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { ExplanationSection } from 'analysis/retail/demonhunter/shared/guide/CommonComponents';
import { TALENTS_PALADIN } from 'common/TALENTS';
import { getCastsDuringWake } from '../../normalizers/WakeOfAshesNormalizer';
import { TIERS } from 'game/TIERS';
interface WakeOfAshesCooldownCast extends CooldownTrigger<CastEvent> {
  hammerOfLightCasts: number;
  targetHasExecutionSentenceOnCast: boolean;
  divineHammerCastDuringWake: boolean;
}

class WakeOfAshes extends MajorCooldown<WakeOfAshesCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;
  hasExecutionSentenceTalented = this.selectedCombatant.hasTalent(
    TALENTS_PALADIN.EXECUTION_SENTENCE_TALENT,
  );
  isTemplar = this.selectedCombatant.hasTalent(TALENTS_PALADIN.LIGHTS_GUIDANCE_TALENT);

  constructor(options: Options) {
    super({ spell: TALENTS_PALADIN.WAKE_OF_ASHES_TALENT }, options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PALADIN.WAKE_OF_ASHES_TALENT),
      this.onCast,
    );
  }

  description() {
    const playerHasTWW3_4Piece = this.selectedCombatant.has4PieceByTier(TIERS.TWW3);

    return (
      <>
        <ExplanationSection>
          <p>
            Thanks to <SpellLink spell={TALENTS_PALADIN.RADIANT_GLORY_TALENT} />,{' '}
            <SpellLink spell={TALENTS_PALADIN.WAKE_OF_ASHES_TALENT} /> becomes your main offensive
            cooldown.
          </p>
          {this.hasExecutionSentenceTalented && (
            <p>
              You want to press <SpellLink spell={TALENTS_PALADIN.EXECUTION_SENTENCE_TALENT} />{' '}
              before <SpellLink spell={TALENTS_PALADIN.WAKE_OF_ASHES_TALENT} /> and fit as much
              damage as possible during that window.
            </p>
          )}
          {this.isTemplar && (
            <p>
              <SpellLink spell={SPELLS.HAMMER_OF_LIGHT} /> is your highest damage ability. It is
              available right after every <SpellLink spell={TALENTS_PALADIN.WAKE_OF_ASHES_TALENT} />{' '}
              casts.
              {playerHasTWW3_4Piece && (
                <>
                  {' '}
                  With the season 3 Tier Set, you will be able to use it a second time each{' '}
                  <SpellLink spell={TALENTS_PALADIN.WAKE_OF_ASHES_TALENT} /> cast.
                </>
              )}
            </p>
          )}
        </ExplanationSection>
      </>
    );
  }

  explainPerformance(cast: WakeOfAshesCooldownCast): SpellUse {
    const executionSentencePerformance = this.executionSentencePerformance(cast);
    const hammerOfLightPerformance = this.hammerOfLightPerformance(cast);
    const divineHammerPerformance = this.divineHammerPerformance(cast);

    const checklistItems = [];

    if (this.isTemplar) {
      checklistItems.push({
        check: 'hol',
        timestamp: cast.event.timestamp,
        ...hammerOfLightPerformance,
      });
    }
    if (this.hasExecutionSentenceTalented) {
      checklistItems.push({
        check: 'exec',
        timestamp: cast.event.timestamp,
        ...executionSentencePerformance,
      });
    }
    if (divineHammerPerformance) {
      checklistItems.push({
        check: 'dh',
        timestamp: cast.event.timestamp,
        ...divineHammerPerformance,
      });
    }

    const combinedPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    return {
      event: cast.event,
      performance: combinedPerformance,
      performanceExplanation:
        combinedPerformance !== QualitativePerformance.Fail
          ? `${combinedPerformance} Usage`
          : 'Bad Usage',
      checklistItems: checklistItems,
    };
  }

  private executionSentencePerformance(cast: WakeOfAshesCooldownCast): UsageInfo {
    let performance = QualitativePerformance.Perfect;
    const summary = (
      <>
        Target had <SpellLink spell={TALENTS_PALADIN.EXECUTION_SENTENCE_TALENT} /> applied.
      </>
    );
    let details = (
      <>
        Target already had <SpellLink spell={TALENTS_PALADIN.EXECUTION_SENTENCE_TALENT} /> applied.
      </>
    );

    if (!cast.targetHasExecutionSentenceOnCast) {
      performance = QualitativePerformance.Fail;
      details = (
        <>
          Target did not have <SpellLink spell={TALENTS_PALADIN.EXECUTION_SENTENCE_TALENT} />{' '}
          applied.
        </>
      );
    }

    return {
      performance: performance,
      summary: summary,
      details: details,
    };
  }

  private hammerOfLightPerformance(cast: WakeOfAshesCooldownCast): UsageInfo {
    const numberOfHammerOfLightCast = cast.hammerOfLightCasts;
    const playerHasTWW3_4Piece = this.selectedCombatant.has4PieceByTier(TIERS.TWW3);
    const expectedNumberOfHammerOfLightCast = playerHasTWW3_4Piece ? 2 : 1;

    const summary = (
      <>
        {expectedNumberOfHammerOfLightCast}+ <SpellLink spell={SPELLS.HAMMER_OF_LIGHT} />
      </>
    );

    if (numberOfHammerOfLightCast >= expectedNumberOfHammerOfLightCast) {
      return {
        performance: QualitativePerformance.Good,
        summary: summary,
        details: (
          <>
            You cast <SpellLink spell={SPELLS.HAMMER_OF_LIGHT} /> {numberOfHammerOfLightCast} time
            {numberOfHammerOfLightCast > 1 ? 's' : ''} during your cooldowns, nice !
          </>
        ),
      };
    }

    return {
      performance: QualitativePerformance.Fail,
      summary: summary,
      details: (
        <>
          {numberOfHammerOfLightCast === 0 ? (
            <>
              You did not cast {<SpellLink spell={SPELLS.HAMMER_OF_LIGHT} />} during your cooldowns.
              Expected casts : {expectedNumberOfHammerOfLightCast}+
            </>
          ) : (
            <>
              You only cast {<SpellLink spell={SPELLS.HAMMER_OF_LIGHT} />}{' '}
              {numberOfHammerOfLightCast} time{numberOfHammerOfLightCast > 1 ? 's' : ''} during your
              cooldowns. Expected casts : {expectedNumberOfHammerOfLightCast}+
            </>
          )}
        </>
      ),
    };
  }

  private divineHammerPerformance(cast: WakeOfAshesCooldownCast): UsageInfo | undefined {
    if (!cast.divineHammerCastDuringWake) {
      return undefined;
    }

    return {
      performance: QualitativePerformance.Ok,
      summary: (
        <>
          <SpellLink spell={TALENTS_PALADIN.DIVINE_HAMMER_TALENT} /> cast during{' '}
          <SpellLink spell={TALENTS_PALADIN.WAKE_OF_ASHES_TALENT} />
        </>
      ),
      details: (
        <>
          <>
            You cast <SpellLink spell={TALENTS_PALADIN.DIVINE_HAMMER_TALENT} /> during your
            cooldowns. Use it beforehand, if available.
          </>
        </>
      ),
    };
  }

  onCast(event: CastEvent) {
    this.recordCooldown({
      event,
      divineHammerCastDuringWake:
        getCastsDuringWake(event).filter(
          (castEvent) => castEvent.ability.guid === SPELLS.DIVINE_HAMMER_CAST.id,
        ).length > 0,
      hammerOfLightCasts: getCastsDuringWake(event).filter(
        (castEvent) => castEvent.ability.guid === SPELLS.HAMMER_OF_LIGHT.id,
      ).length,
      targetHasExecutionSentenceOnCast: this.enemies.hasBuffOnAny(
        TALENTS_PALADIN.EXECUTION_SENTENCE_TALENT.id,
      ),
    });
  }
}

export default WakeOfAshes;
