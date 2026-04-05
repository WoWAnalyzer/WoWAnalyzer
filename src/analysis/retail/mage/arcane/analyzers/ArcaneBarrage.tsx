import Analyzer from 'parser/core/Analyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  GetRelatedEvents,
  GetRelatedEvent,
  EventType,
  ApplyDebuffEvent,
  RemoveDebuffEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import { getManaPercentage, getTargetHealthPercentage } from '../../shared/helpers';
import Enemies from 'parser/shared/modules/Enemies';

const MS_BUFFER = 250;

export default class ArcaneBarrage extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    arcaneChargeTracker: ArcaneChargeTracker,
    enemies: Enemies,
  };

  protected spellUsable!: SpellUsable;
  protected arcaneChargeTracker!: ArcaneChargeTracker;
  protected enemies!: Enemies;

  barrageData: ArcaneBarrageData[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE),
      this.onBarrage,
    );
  }

  onBarrage(event: CastEvent) {
    const activeBuffs: number[] = [];

    // Clearcasting
    if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE, event.timestamp - 10)) {
      activeBuffs.push(SPELLS.CLEARCASTING_ARCANE.id);
    }

    // Arcane Soul
    if (this.selectedCombatant.hasBuff(SPELLS.ARCANE_SOUL_BUFF, event.timestamp - 10)) {
      activeBuffs.push(SPELLS.ARCANE_SOUL_BUFF.id);
    }

    // Overpowered Missiles
    if (this.selectedCombatant.hasBuff(SPELLS.OVERPOWERED_MISSILES_BUFF)) {
      activeBuffs.push(SPELLS.OVERPOWERED_MISSILES_BUFF.id);
    }

    // Touch of the Magi (Debuff)
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF)) {
      activeBuffs.push(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id);
    }

    //Arcane Surge buff
    if (this.selectedCombatant.hasBuff(SPELLS.ARCANE_SURGE_BUFF)) {
      activeBuffs.push(SPELLS.ARCANE_SURGE_BUFF.id);
    }

    const touchApply: ApplyDebuffEvent | undefined = GetRelatedEvent(event, 'touchDebuff');
    const touchRemove: RemoveDebuffEvent | undefined =
      touchApply && GetRelatedEvent(touchApply, EventType.RemoveDebuff);
    const touchRemaining = touchRemove && touchRemove.timestamp - event.timestamp;

    const surgeApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, 'surgeBuff');
    const surgeRemove: RemoveBuffEvent | undefined =
      surgeApply && GetRelatedEvent(surgeApply, EventType.RemoveBuff);
    const surgeRemaining = surgeRemove && surgeRemove.timestamp - event.timestamp;

    this.barrageData.push({
      cast: event,
      mana: getManaPercentage(event),
      precast: GetRelatedEvent(event, 'precast'),
      charges: this.arcaneChargeTracker.current,
      targetsHit: GetRelatedEvents(event, EventType.Damage).length || 0,
      activeBuffs,
      salvoStacks:
        this.selectedCombatant.getBuff(SPELLS.ARCANE_SALVO_BUFF, event.timestamp - 10)?.stacks || 0,
      arcaneOrbAvail: this.spellUsable.isAvailable(SPELLS.ARCANE_ORB.id),
      touchCD: this.spellUsable.cooldownRemaining(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id),
      touchRemaining,
      surgeRemaining,
      touchApply,
      barrageBefore:
        touchApply &&
        event.timestamp < touchApply.timestamp &&
        touchApply.timestamp - event.timestamp < MS_BUFFER
          ? true
          : false,
      barrageAfter:
        touchApply &&
        event.timestamp > touchApply.timestamp &&
        event.timestamp - touchApply.timestamp < MS_BUFFER
          ? true
          : false,
      health: getTargetHealthPercentage(event),
    });

    this.arcaneChargeTracker.clearCharges(event);
  }
}

export interface ArcaneBarrageData {
  cast: CastEvent;
  mana?: number;
  precast?: CastEvent;
  charges: number;
  targetsHit: number;
  activeBuffs: number[];
  salvoStacks: number;
  arcaneOrbAvail: boolean;
  touchCD: number;
  touchRemaining?: number;
  surgeRemaining?: number;
  touchApply?: ApplyDebuffEvent;
  barrageBefore: boolean;
  barrageAfter: boolean;
  health?: number;
}
