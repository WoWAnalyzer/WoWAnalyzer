import SPELLS from 'common/SPELLS/monk';
import TALENTS from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { AbilityEvent, CastEvent, EventType } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

// Override spell usable to handle CD resets on RSK from Teachings of the Monastery
// There is no direct event to observe, so if we detect RSK being used earlier than its CD dictates,
// we assume the most recent Blackout Kick reset the cooldown
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForRskReset: CastEvent | null = null;
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK),
      this.onBlackoutKick,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK_TOTM),
      this.onBlackoutKick,
    );
  }

  onBlackoutKick(event: CastEvent) {
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
        // set the reset time as 1ms AFTER we casted BoK so that the APL / timeline doesn't
        //   think we should have instead cast RSK during that gcd
        this.endCooldown(spellId, this.lastPotentialTriggerForRskReset.timestamp + 1);

        // flag the reset event in the timeline
        this.lastPotentialTriggerForRskReset.meta = this.lastPotentialTriggerForRskReset.meta || {};
        this.lastPotentialTriggerForRskReset.meta.isEnhancedCast = true;
        this.lastPotentialTriggerForRskReset.meta.enhancedCastReason = (
          <>
            This cast reset the cooldown of <SpellLink id={TALENTS.RISING_SUN_KICK_TALENT.id} /> due
            to <SpellLink id={TALENTS.TEACHINGS_OF_THE_MONASTERY_TALENT} />
          </>
        );
      }
      this.lastPotentialTriggerForRskReset = null;
    }

    super.beginCooldown(triggerEvent, spellId);
  }
}

export default SpellUsable;
