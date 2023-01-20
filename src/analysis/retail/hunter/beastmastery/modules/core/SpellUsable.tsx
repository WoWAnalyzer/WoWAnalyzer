import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import HIT_TYPES from 'game/HIT_TYPES';
import { TIERS } from 'game/TIERS';
import { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, {
  AbilityEvent,
  AnyEvent,
  CastEvent,
  DamageEvent,
  EventType,
} from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForBarbedShotReset: AnyEvent | null = null;
  lastPotentialTriggerForKillCommandReset: AnyEvent | null = null;
  private _has4pc: boolean = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTO_SHOT), this.onDamage);
    this._has4pc = this.selectedCombatant.has4PieceByTier(TIERS.T29);
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.AUTO_SHOT.id && event.hitType === HIT_TYPES.CRIT) {
      this.lastPotentialTriggerForBarbedShotReset = event;
    }
    if (spellId === TALENTS.KILL_COMMAND_SHARED_TALENT.id && this._has4pc) {
      this.lastPotentialTriggerForBarbedShotReset = event;
    }
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === TALENTS.BARBED_SHOT_TALENT.id) {
      this.lastPotentialTriggerForBarbedShotReset = null;
      if (this.selectedCombatant.hasTalent(TALENTS.WAR_ORDERS_TALENT)) {
        this.lastPotentialTriggerForKillCommandReset = event;
      }
    }
    super.onCast(event);
  }

  beginCooldown(triggerEvent: AbilityEvent<any>, _spellId: number) {
    if (triggerEvent.type === EventType.FreeCast) {
      //Ignore FreeCast events as they are events that have been modified or fabricated
      //They indicate that a different spell caused it to cast
      return;
    }
    const spellId = triggerEvent.ability.guid;
    if (spellId === TALENTS.BARBED_SHOT_TALENT.id) {
      if (this.isOnCooldown(spellId) && this.chargesAvailable(spellId) === 0) {
        this.endCooldown(spellId, this.lastPotentialTriggerForBarbedShotReset?.timestamp);
      }
    }
    if (spellId === TALENTS.KILL_COMMAND_SHARED_TALENT.id && this._has4pc) {
      if (this.isOnCooldown(spellId) && this.chargesAvailable(spellId) === 0) {
        this.endCooldown(spellId, this.lastPotentialTriggerForKillCommandReset?.timestamp);
      }
    }

    super.beginCooldown(triggerEvent, spellId);
  }
}

export default SpellUsable;
