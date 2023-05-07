import SPELLS from 'common/SPELLS/monk';
import TALENTS from 'common/TALENTS/monk';
import { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { AbilityEvent, AnyEvent, DamageEvent, EventType } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

// Override spell usable to handle CD resets on RSK from Teachings of the Monastery
// There is no direct event to observe, so if we detect RSK being used earlier than its CD dictates,
// we assume the most recent Blackout Kick reset the cooldown
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForRskReset: AnyEvent | null = null;
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK),
      this.onBlackoutKick,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK_TOTM),
      this.onBlackoutKick,
    );
  }

  onBlackoutKick(event: DamageEvent) {
    this.lastPotentialTriggerForRskReset = event;
  }

  beginCooldown(triggerEvent: AbilityEvent<any>, _spellId: number) {
    if (triggerEvent.type === EventType.FreeCast) {
      //Ignore FreeCast events as they are events that have been modified or fabricated
      //They indicate that a different spell caused it to cast
      return;
    }
    const spellId = triggerEvent.ability.guid;
    if (spellId === TALENTS.RISING_SUN_KICK_TALENT.id) {
      if (
        this.selectedCombatant.hasTalent(TALENTS.TEACHINGS_OF_THE_MONASTERY_TALENT) &&
        this.isOnCooldown(spellId) &&
        this.chargesAvailable(spellId) === 0 &&
        this.lastPotentialTriggerForRskReset !== null
      ) {
        this.endCooldown(spellId, this.lastPotentialTriggerForRskReset.timestamp);
      }
      this.lastPotentialTriggerForRskReset = null;
    }

    super.beginCooldown(triggerEvent, spellId);
  }
}

export default SpellUsable;
