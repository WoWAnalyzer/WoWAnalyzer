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
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { TIERS } from 'game/TIERS';

export default class PrismaticBolt extends Analyzer {
  prismaticBolts: PrismaticBoltCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRISMATIC_BOLT_3_ARCANE_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRISMATIC_BOLT_BUFF),
      this.onBoltApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.PRISMATIC_BOLT_BUFF),
      this.onBoltApply,
    );
  }

  onBoltApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const refresh: RefreshBuffEvent | undefined = GetRelatedEvent(event, EventType.RefreshBuff);
    const cast: CastEvent | undefined = GetRelatedEvent(event, EventType.Cast);
    const damage: DamageEvent[] | undefined = GetRelatedEvents(event, EventType.Damage);
    const remove: RemoveBuffEvent | undefined = GetRelatedEvent(event, EventType.RemoveBuff);
    const munched = !cast && !!refresh;
    const expired = !cast && !!remove;

    this.prismaticBolts.push({
      timestamp: event.timestamp,
      cast,
      damage,
      munched,
      expired,
      has4pc: this.selectedCombatant.has4PieceByTier(TIERS.MID2),
      hasClearcasting: this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE),
      hasArcaneSoul: this.selectedCombatant.hasBuff(SPELLS.ARCANE_SOUL_BUFF),
      targetsHit: damage?.length || 0,
      cumulativePowerStacks: cast
        ? this.selectedCombatant.getBuffStacks(SPELLS.CUMULATIVE_POWER_BUFF, cast.timestamp)
        : 0,
      salvoStacks: cast
        ? this.selectedCombatant.getBuffStacks(SPELLS.ARCANE_SALVO_BUFF, cast.timestamp)
        : 0,
      delay: cast ? cast.timestamp - event.timestamp : undefined,
    });
  }
}

export interface PrismaticBoltCast {
  timestamp: number;
  cast?: CastEvent;
  damage?: DamageEvent[];
  munched: boolean;
  expired: boolean;
  targetsHit: number;
  has4pc: boolean;
  hasClearcasting: boolean;
  hasArcaneSoul: boolean;
  cumulativePowerStacks: number;
  salvoStacks: number;
  delay?: number;
}
