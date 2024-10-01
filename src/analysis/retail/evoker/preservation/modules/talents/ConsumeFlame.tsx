import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Combatants from 'parser/shared/modules/Combatants';
import { getDreamBreathCast } from '../../normalizers/EventLinking/helpers';
import { TIERS } from 'game/TIERS';

interface CastInfo {
  timestamp: number;
  coyActive: boolean;
  temporalCompressionStacks: number;
  dreamBreathOnTarget: boolean;
}

const GUIDE_CORE_EXPLANATION_PERCENT = 40;

class ConsumeFlame extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  numberOfConsumes: number = 0;
  totalHits: number = 0;
  healed: number = 0;
  casts: CastInfo[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS_EVOKER.ENGULF_TALENT]),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.CONSUME_FLAME_HEAL]),
      this.onHeal,
    );
  }

  get averageNumTargets() {
    return this.totalHits / this.numberOfConsumes;
  }

  onCast(event: CastEvent) {
    this.numberOfConsumes += 1;

    const target = this.combatants.getEntity(event);
    let dreamBreathOnTarget = true;

    if (!target?.hasBuff(SPELLS.DREAM_BREATH.id)) {
      dreamBreathOnTarget = false;
    }

    const applyBuffEvent = target?.getBuff(SPELLS.DREAM_BREATH.id);

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
      temporalCompressionStacks: temporalCompressionStacks,
      coyActive: coyActive,
    });
  }

  onHeal(event: HealEvent) {
    const players = Object.values(this.combatants.players);
    const castTargetIsPlayer = players.find((player) => player.id === event.targetID);

    if (castTargetIsPlayer) {
      this.totalHits += 1;
    }
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
      const coyActive =
        this.selectedCombatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT) && cast.coyActive;
      const temporalCompressionStacks = cast.temporalCompressionStacks;
      const dreamBreathLanded = cast.dreamBreathOnTarget;

      const conditionsMet = [dreamBreathLanded, temporalCompressionStacks > 3, coyActive].filter(
        Boolean,
      ).length;

      let value = QualitativePerformance.Fail;
      if (conditionsMet === 3) {
        value = QualitativePerformance.Good;
      } else if (conditionsMet === 2 && dreamBreathLanded) {
        value = QualitativePerformance.Ok;
      }

      const tooltip = (
        <>
          <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> @{' '}
          {this.owner.formatTimestamp(cast.timestamp)} <br />
          <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> on target:{' '}
          {dreamBreathLanded ? 'Yes' : 'No'} <br />
          {this.selectedCombatant.has4PieceByTier(TIERS.TWW1) && (
            <>
              Temporal Compression stacks: {temporalCompressionStacks} <br />
            </>
          )}
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
          <div style={{ marginLeft: '1em' }}>
            {this.averageNumTargets.toFixed(1)}
            <small> avg targets hit</small>
          </div>
          <PerformanceBoxRow values={entries} />
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT); // GUIDE_CORE_EXPLANATION_PERCENT
  }
}

export default ConsumeFlame;
