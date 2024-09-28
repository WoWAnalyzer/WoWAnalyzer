import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Combatants from 'parser/shared/modules/Combatants';
import { getDreamBreathCast } from '../../normalizers/EventLinking/helpers';

interface CastInfo {
  timestamp: number;
  coyActive: boolean;
  temporalCompressionStacked: boolean;
  dreamBreathOnTarget: boolean;
}

class ConsumeFlame extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  casts: CastInfo[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS_EVOKER.ENGULF_TALENT]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const target = this.combatants.getEntity(event);
    let dreamBreathOnTarget = true;

    if (!target?.hasBuff(SPELLS.DREAM_BREATH.id) && !target?.hasBuff(SPELLS.DREAM_BREATH_ECHO.id)) {
      dreamBreathOnTarget = false;
    }

    const applyBuffEvent = target?.getBuff(SPELLS.DREAM_BREATH.id);
    console.log(applyBuffEvent?._linkedEvents);

    let cast;

    if (applyBuffEvent) {
      cast = getDreamBreathCast(applyBuffEvent, false);
    }

    const temporalCompressionStacks = this.selectedCombatant?.getBuffStacks(
      SPELLS.TEMPORAL_COMPRESSION_BUFF,
      cast?.timestamp,
    );
    const coyActive = this.selectedCombatant.hasBuff(
      SPELLS.CALL_OF_YSERA_BUFF.id,
      applyBuffEvent?.timestamp,
      150,
    );

    this.casts.push({
      timestamp: event.timestamp,
      dreamBreathOnTarget: dreamBreathOnTarget,
      temporalCompressionStacked: temporalCompressionStacks === 4,
      coyActive: coyActive,
    });
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT} />
        </b>{' '}
        benefits greatly from modifiers on <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} />.
        Prioritize <SpellLink spell={TALENTS_EVOKER.CALL_OF_YSERA_TALENT} /> after casting{' '}
        <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} />. Always cast{' '}
        <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> at four stacks of{' '}
        <SpellLink spell={TALENTS_EVOKER.TEMPORAL_COMPRESSION_TALENT} /> to get the 4pc set bonus.{' '}
        Make sure to target non-Echo <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> for
        maximum healing when using <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} />.
      </p>
    );

    const entries: BoxRowEntry[] = [];
    this.casts.forEach((cast) => {
      let value = QualitativePerformance.Fail;

      const coyActive =
        this.selectedCombatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT) && cast.coyActive;
      const temporalCompressionMaxed = cast.temporalCompressionStacked;
      const dreamBreathLanded = cast.dreamBreathOnTarget;

      if (dreamBreathLanded && temporalCompressionMaxed && coyActive) {
        value = QualitativePerformance.Good;
      }

      const tooltip = (
        <>
          <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> @{' '}
          {this.owner.formatTimestamp(cast.timestamp)} <br />
          Dream Breath on target: {dreamBreathLanded ? 'Yes' : 'No'} <br />
          Temporal Compression stacked: {temporalCompressionMaxed ? 'Yes' : 'No'} <br />
          {this.selectedCombatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT) && (
            <>
              <SpellLink spell={TALENTS_EVOKER.CALL_OF_YSERA_TALENT} /> active:{' '}
              {cast.coyActive ? 'Yes' : 'No'}
            </>
          )}
        </>
      );
      entries.push({ value, tooltip });
    });

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT} /> cast analysis
          </strong>
          <PerformanceBoxRow values={entries} />
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, 50); // GUIDE_CORE_EXPLANATION_PERCENT
  }
}

export default ConsumeFlame;
