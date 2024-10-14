import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  EventType,
  DamageEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  GetRelatedEvent,
  GetRelatedEvents,
  RefreshBuffEvent,
} from 'parser/core/Events';

export default class NetherPrecision extends Analyzer {
  netherPrecisionBuffs: NetherPrecisionProc[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.NETHER_PRECISION_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.NETHER_PRECISION_BUFF),
      this.onBuffApply,
    );
  }

  onBuffApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const removeBuff: RemoveBuffEvent | RefreshBuffEvent | undefined = GetRelatedEvent(
      event,
      'BuffRemove',
    );
    const damage: DamageEvent[] = GetRelatedEvents(event, 'SpellDamage');
    const overwritten = removeBuff?.type === EventType.RefreshBuff;

    this.netherPrecisionBuffs.push({
      applied: event.timestamp,
      removed: removeBuff?.timestamp || this.owner.fight.end_time,
      overwritten: overwritten,
      damageEvents: damage || [],
    });
  }

  //ADD STATISTIC
}

export interface NetherPrecisionProc {
  applied: number;
  removed: number;
  damageEvents?: DamageEvent[];
  overwritten?: boolean;
}
