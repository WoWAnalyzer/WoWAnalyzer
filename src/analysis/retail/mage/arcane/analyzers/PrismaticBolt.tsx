import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import { TIERS } from 'game/TIERS';

export default class PrismaticBolt extends Analyzer {
  prismaticBolts: PrismaticBoltCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRISMATIC_BOLT_3_ARCANE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PRISMATIC_BOLT),
      this.onBoltCast,
    );
  }

  onBoltCast(event: CastEvent) {
    const cumulativePowerStacks = this.selectedCombatant.getBuffStacks(
      SPELLS.CUMULATIVE_POWER_BUFF,
    );
    const salvoStacks = this.selectedCombatant.getBuffStacks(SPELLS.ARCANE_SALVO_BUFF);
    const hasClearcasting = this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE);
    const has4pc = this.selectedCombatant.has4PieceByTier(TIERS.MID2);

    const damageEvents: DamageEvent[] = GetRelatedEvents(event, EventType.Damage) || [];
    const targetsHit = damageEvents.length;

    const applyBuff: ApplyBuffEvent | undefined = GetRelatedEvent(event, EventType.ApplyBuff);
    const delay = applyBuff && event.timestamp - applyBuff.timestamp;

    this.log(applyBuff);
    this.log(damageEvents);

    this.prismaticBolts.push({
      timestamp: event.timestamp,
      targetsHit,
      cumulativePowerStacks,
      salvoStacks,
      hasClearcasting,
      has4pc,
      delay,
    });
  }
}

export interface PrismaticBoltCast {
  timestamp: number;
  targetsHit: number;
  cumulativePowerStacks: number;
  salvoStacks: number;
  hasClearcasting: boolean;
  has4pc: boolean;
  delay?: number;
}
