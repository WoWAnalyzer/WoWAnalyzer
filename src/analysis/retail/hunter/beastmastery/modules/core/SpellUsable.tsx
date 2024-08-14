import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import HIT_TYPES from 'game/HIT_TYPES';
import { TIERS } from 'game/TIERS';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
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

  private _has2pc: boolean = false;
  private _tierCanResetBarbedShot: boolean = false;
  private _barbedShotResetsFromT29: number = 0;

  get barbedShotResetsFromT29() {
    return this._barbedShotResetsFromT29;
  }

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTO_SHOT),
      this.onAutoShotDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.KILL_COMMAND_SHARED_DAMAGE),
      this.onKillCommandDamage,
    );
    this._has2pc = this.selectedCombatant.has2PieceByTier(TIERS.DF1);
  }

  onAutoShotDamage(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.lastPotentialTriggerForBarbedShotReset = event;
      this._tierCanResetBarbedShot = false;
    }
  }

  onKillCommandDamage(event: DamageEvent) {
    if (this._has2pc) {
      this.lastPotentialTriggerForBarbedShotReset = event;
      this._tierCanResetBarbedShot = true;
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
        if (this._tierCanResetBarbedShot) {
          this._barbedShotResetsFromT29 += 1;
        }
        this.endCooldown(spellId, this.lastPotentialTriggerForBarbedShotReset?.timestamp);
      }
    }
    if (spellId === TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id) {
      if (this.isOnCooldown(spellId) && this.chargesAvailable(spellId) === 0) {
        this.endCooldown(spellId, this.lastPotentialTriggerForKillCommandReset?.timestamp);
      }
    }

    super.beginCooldown(triggerEvent, spellId);
  }
}

export default SpellUsable;
