import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import {
  evaluateQualitativePerformanceByThreshold,
  getLowestPerf,
  QualitativePerformance,
  QualitativePerformanceThreshold,
} from 'parser/ui/QualitativePerformance';
import Combatants from 'parser/shared/modules/Combatants';
import { getConsumeFromEngulf, getDreamBreathCast } from '../../normalizers/EventLinking/helpers';
import { TIERS } from 'game/TIERS';
import ItemSetLink from 'interface/ItemSetLink';
import { EVOKER_TWW1_ID } from 'common/ITEMS/dragonflight';
import { CAST_BUFFER_MS } from 'analysis/retail/evoker/preservation/normalizers/EventLinking/constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { PerformanceMark } from 'interface/guide';

interface CastInfo {
  timestamp: number;
  coyActive: boolean;
  temporalCompressionStacks: number;
  dreamBreathOnTarget: boolean;
  numPlayersHit: number;
}

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
    if (!applyBuffEvent) {
      return;
    }
    const cast = getDreamBreathCast(applyBuffEvent, false);
    if (!cast) {
      return;
    }

    const temporalCompressionStacks = this.selectedCombatant?.getBuffStacks(
      SPELLS.TEMPORAL_COMPRESSION_BUFF,
      cast.timestamp,
    );
    const coyActive = this.selectedCombatant.hasBuff(
      SPELLS.CALL_OF_YSERA_BUFF.id,
      applyBuffEvent.timestamp,
      CAST_BUFFER_MS,
    );

    this.casts.push({
      timestamp: event.timestamp,
      dreamBreathOnTarget: dreamBreathOnTarget,
      temporalCompressionStacks: temporalCompressionStacks,
      coyActive: coyActive,
      numPlayersHit: getConsumeFromEngulf(event).filter((ev) => {
        return this.combatants.getEntity(ev) !== null;
      }).length,
    });
  }

  onHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);

    if (target) {
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
        Make sure to have the following buffs before casting{' '}
        <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} />
        <div>
          <ul>
            <li>
              <SpellLink spell={TALENTS_EVOKER.CALL_OF_YSERA_TALENT} /> if talented
            </li>
            <li>
              4 stacks of <SpellLink spell={TALENTS_EVOKER.TEMPORAL_COMPRESSION_TALENT} /> if you
              have <ItemSetLink id={EVOKER_TWW1_ID} /> 4 Piece
            </li>
          </ul>
        </div>
        and make sure to always cast <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> on a target
        with a hardcasted <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> (i.e. not from{' '}
        <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
        ).
      </p>
    );

    const entries: BoxRowEntry[] = [];
    this.casts.forEach((cast) => {
      const percentHit = cast.numPlayersHit / this.combatants.playerCount;
      const targetThreshold: QualitativePerformanceThreshold = {
        isGreaterThanOrEqual: {
          perfect: 1,
          good: 0.9,
          ok: 0.8,
          fail: 0.7,
        },
        actual: percentHit,
      };
      const targetPerf = evaluateQualitativePerformanceByThreshold(targetThreshold);
      const dbPerf = cast.dreamBreathOnTarget
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;
      const optionalPerfs = [];
      let tcPerf = undefined;
      let coyPerf = undefined;
      if (this.selectedCombatant.has4PieceByTier(TIERS.TWW1)) {
        const threshold: QualitativePerformanceThreshold = {
          isGreaterThanOrEqual: {
            good: 4,
            ok: 3,
            fail: 2,
          },
          actual: cast.temporalCompressionStacks,
        };
        tcPerf = evaluateQualitativePerformanceByThreshold(threshold);
        optionalPerfs.push(tcPerf);
      }
      if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT)) {
        coyPerf = cast.coyActive ? QualitativePerformance.Good : QualitativePerformance.Fail;
        optionalPerfs.push(coyPerf);
      }

      const tooltip = (
        <>
          <div>
            <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> @{' '}
            {this.owner.formatTimestamp(cast.timestamp)}
          </div>
          <div>
            Players hit: {cast.numPlayersHit} <PerformanceMark perf={targetPerf} />
          </div>
          <div>
            <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> on target{' '}
            <PerformanceMark perf={dbPerf} />
          </div>

          {this.selectedCombatant.has4PieceByTier(TIERS.TWW1) && (
            <div>
              <SpellLink spell={TALENTS_EVOKER.TEMPORAL_COMPRESSION_TALENT} /> stacks:{' '}
              {cast.temporalCompressionStacks} <PerformanceMark perf={tcPerf!} />
            </div>
          )}
          {this.selectedCombatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT) && (
            <div>
              <SpellLink spell={TALENTS_EVOKER.CALL_OF_YSERA_TALENT} /> active{' '}
              <PerformanceMark perf={coyPerf!} />
            </div>
          )}
        </>
      );
      const value = getLowestPerf([targetPerf, dbPerf, ...optionalPerfs]);
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

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default ConsumeFlame;
