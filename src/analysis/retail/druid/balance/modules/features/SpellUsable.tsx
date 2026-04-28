import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  EventType,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { TALENTS_DRUID } from 'common/TALENTS';
import { cdSpell } from 'analysis/retail/druid/balance/constants';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';

const DEBUG = false;
// Control of the Dream caps its CD reduction at 15s
const CD_REDUCTION_CAP_IN_MS = 15_000;

/* Override spell usable to handle CD reduction from Control of the Dream.
 * -----------------------------------------------------------------------
 * https://www.wowhead.com/spell=434249/control-of-the-dream (as-of 12.0.5)
 * " Time elapsed while your major abilities are available to be used or at maximum charges
 * is subtracted from that ability's cooldown after the next time you use it, up to 15 seconds.
 * Affects Force of Nature, Celestial Alignment, and Convoke the Spirits. "
 * -----------------------------------------------------------------------
 * No direct events to listen to for this CD reduction, therefore we track the cooldown events of
 * - Force of Nature
 * - Primary CD (Celestial Alignment or Incarnation)
 * - Convoke the Spirits
 * and manually compute the CD reduction and apply it.
 */
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  private readonly combatant: Combatant;
  private readonly primaryCd: Spell;
  private forceOfNatureLastCooldownEnd: number | undefined = undefined;
  private primaryCdLastLastCooldownEnd: number | undefined = undefined;
  private convokeTheSpiritsLastCooldownEnd: number | undefined = undefined;

  constructor(options: Options) {
    super(options);

    this.combatant = options.owner.selectedCombatant;
    this.primaryCd = cdSpell(options.owner.selectedCombatant);

    // Only activate if Control of the Dream talent is taken
    if (!this.combatant.hasTalent(TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT)) {
      return;
    }

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS_DRUID.FORCE_OF_NATURE_TALENT),
      this.onForceOfNature,
    );

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(this.primaryCd),
      this.onPrimaryCd,
    );

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT),
      this.onConvokeTheSpirits,
    );
  }

  private onForceOfNature(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      this.forceOfNatureLastCooldownEnd = event.timestamp;
    }
  }

  private onPrimaryCd(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      this.primaryCdLastLastCooldownEnd = event.timestamp;
    }
  }

  private onConvokeTheSpirits(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      this.convokeTheSpiritsLastCooldownEnd = event.timestamp;
    }
  }

  beginCooldown(triggerEvent: AbilityEvent<EventType>, _spellId: number) {
    const spellId = triggerEvent.ability.guid;

    // Always begin the cooldown
    // and do it BEFORE reducing the cooldown duration (otherwise nothing to reduce)
    super.beginCooldown(triggerEvent, spellId);

    // Without Control of the Dream, there is no CD reduction
    if (!this.combatant.hasTalent(TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT)) {
      return;
    }

    // Only handle these 3 spells are impacted by Control of the Dream :
    // - Force of Nature
    // - Primary CD (Celestial Alignment or Incarnation)
    // - Convoke the Spirits
    if (
      spellId != TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id &&
      spellId != this.primaryCd.id &&
      spellId != TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id
    ) {
      return;
    }

    // Define these variables to handle all abilities the same way
    let spell: Spell;
    let lastCooldownEnd: number | undefined;
    switch (spellId) {
      case TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id:
        spell = TALENTS_DRUID.FORCE_OF_NATURE_TALENT;
        lastCooldownEnd = this.forceOfNatureLastCooldownEnd;
        break;
      case this.primaryCd.id:
        spell = this.primaryCd;
        lastCooldownEnd = this.primaryCdLastLastCooldownEnd;
        break;
      case TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id:
        spell = TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT;
        lastCooldownEnd = this.convokeTheSpiritsLastCooldownEnd;
        break;
      default:
        // Should not happen because of guard clause above.
        DEBUG &&
          console.error(
            `[${triggerEvent.timestamp}] ${spellId} should not be manually tracked by Balance Druid SpellUsable`,
          );
        return;
    }

    // We can discard spells that do not have their max number of charges
    if (this.hasNotMaximumNumberOfCharges(triggerEvent, spellId, spell)) {
      DEBUG &&
        console.info(
          `[${triggerEvent.timestamp}] Cooldown of ${spell.name} is not reduced as it's below max number of charges`,
        );
      return;
    }

    const castInfo = lastCooldownEnd
      ? `previous cooldown ended at ${lastCooldownEnd}`
      : 'CD never ended';
    DEBUG && console.info(`[${triggerEvent.timestamp}] ${spell.name}: ${castInfo}`);
    const cooldownReductionInMs = this.getCooldownReductionMs(triggerEvent, lastCooldownEnd);

    const reductionMsApplied = this.reduceCooldown(
      spellId,
      cooldownReductionInMs,
      triggerEvent.timestamp,
    );

    DEBUG &&
      console.info(
        `[${triggerEvent.timestamp}] Reduced cooldown of ${spell.name} by ${reductionMsApplied}ms`,
      );
  }

  private getCooldownReductionMs(
    triggerEvent: AbilityEvent<EventType>,
    lastCooldownEnd: number | undefined,
  ) {
    if (lastCooldownEnd === undefined) {
      // Assume ability was available for at least the cap duretion (15s) pre-pull.
      // We have no way of knowing exactly how long it was off CD pre-combat,
      // but this is a reasonnable assumption for most pull scenarios.
      return CD_REDUCTION_CAP_IN_MS;
    } else {
      // Otherwise, we need to compute how long the ability has been off CD
      const timeElapsedSinceSpellAvailable = triggerEvent.timestamp - lastCooldownEnd;

      // CD reduction is capped.
      return Math.min(timeElapsedSinceSpellAvailable, CD_REDUCTION_CAP_IN_MS);
    }
  }

  private hasNotMaximumNumberOfCharges(
    triggerEvent: AbilityEvent<EventType>,
    spellId: number,
    spell: Spell,
  ): boolean {
    // Only our primary CD has 2 charges, when the talent Whirling Stars is used.
    if (
      spellId == this.primaryCd.id &&
      this.combatant.hasTalent(TALENTS_DRUID.WHIRLING_STARS_TALENT)
    ) {
      const abilityCharges = this.chargesAvailable(spellId);

      DEBUG &&
        console.info(
          `[${triggerEvent.timestamp}] ${spell.name} has ${abilityCharges} remaining charges.`,
        );

      // If there is 0 charge remaining, it means we had only 1 charge available before the cast.
      // Threfore, the ability did not have its maximum number of charges (2).
      return abilityCharges == 0;
    } else {
      return false;
    }
  }
}

export default SpellUsable;
