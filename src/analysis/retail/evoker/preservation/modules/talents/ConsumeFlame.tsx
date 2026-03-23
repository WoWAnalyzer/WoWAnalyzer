import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { getConsumeFromEngulf, getDreamBreathCast } from '../../normalizers/EventLinking/helpers';
import { CAST_BUFFER_MS } from 'analysis/retail/evoker/preservation/normalizers/EventLinking/constants';

interface CastInfo {
  timestamp: number;
  coyActive: boolean;
  temporalCompressionStacks: number;
  numPlayersHit: number;
}

class ConsumeFlame extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  numberOfConsumes = 0;
  totalHits = 0;
  healed = 0;
  casts: CastInfo[] = [];

  constructor(options: Options) {
    super(options);
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
}

export default ConsumeFlame;
