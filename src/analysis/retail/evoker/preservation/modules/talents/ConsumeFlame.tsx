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
import { getDreamBreathCast } from '../../normalizers/EventLinking/helpers';
import { TIERS } from 'game/TIERS';
import ItemSetLink from 'interface/ItemSetLink';
import { EVOKER_TWW1_ID } from 'common/ITEMS/dragonflight';
import { CAST_BUFFER_MS } from 'analysis/retail/evoker/preservation/normalizers/EventLinking/constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

interface CastInfo {
  timestamp: number;
  coyActive: boolean;
  temporalCompressionStacks: number;
  dreamBreathOnTarget: boolean;
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
      const perfs: QualitativePerformance[] = [
        cast.dreamBreathOnTarget ? QualitativePerformance.Good : QualitativePerformance.Fail,
      ];
      if (this.selectedCombatant.has4PieceByTier(TIERS.TWW1)) {
        const threshold: QualitativePerformanceThreshold = {
          isGreaterThanOrEqual: {
            good: 4,
            ok: 3,
            fail: 2,
          },
          actual: cast.temporalCompressionStacks,
        };
        perfs.push(evaluateQualitativePerformanceByThreshold(threshold));
      }
      if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT)) {
        perfs.push(cast.coyActive ? QualitativePerformance.Good : QualitativePerformance.Fail);
      }

      const tooltip = (
        <>
          <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> @{' '}
          {this.owner.formatTimestamp(cast.timestamp)} <br />
          <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> on target:{' '}
          {cast.dreamBreathOnTarget ? 'Yes' : 'No'} <br />
          {this.selectedCombatant.has4PieceByTier(TIERS.TWW1) && (
            <>
              <SpellLink spell={TALENTS_EVOKER.TEMPORAL_COMPRESSION_TALENT} /> stacks:{' '}
              {cast.temporalCompressionStacks} <br />
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
      const value = getLowestPerf(perfs);
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
