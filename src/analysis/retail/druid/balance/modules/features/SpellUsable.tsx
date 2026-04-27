import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbilityEvent, CastEvent, EventType } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { TALENTS_DRUID } from 'common/TALENTS';
import { cdSpell } from 'analysis/retail/druid/balance/constants';
import Spell from 'common/SPELLS/Spell';
import Abilities from '../Abilities';
import Combatant from 'parser/core/Combatant';
import Ability from 'parser/core/modules/Ability';

const DEBUG = true;
const CD_REDUCTION_CAP_IN_MS = 15_000;

/* Override spell usable to handle CD reduction from Control of the Dream.
 * -----------------------------------------------------------------------
 * Control of the Dream :
 * Time elapsed while your major abilities are available to be used or at maximum charges
 * is subtracted from that ability's cooldown after the next time you use it, up to 15 seconds.
 * Affects Force of Nature, Celestial Alignment, and Convoke the Spirits.
 * -----------------------------------------------------------------------
 * No direct events to listen to, therefore we manually track the casts of
 * - Force of Nature
 * - Primary CD (Celestial Alignment or Incarnation)
 * - Convoke the Spirits
 */
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    abilities: Abilities,
  };

  combatant: Combatant;
  primaryCd: Spell;
  forceOfNatureCasts: CastEvent[] = [];
  forceOfNatureLastCdReductionInMs: number = CD_REDUCTION_CAP_IN_MS;
  primaryCdCasts: CastEvent[] = [];
  primaryCdLastCdReductionInMs: number = CD_REDUCTION_CAP_IN_MS;
  convokeTheSpiritsCasts: CastEvent[] = [];
  convokeTheSpiritsLastCdReductionInMs: number = CD_REDUCTION_CAP_IN_MS;

  constructor(options: Options) {
    super(options);

    this.combatant = options.owner.selectedCombatant;
    this.primaryCd = cdSpell(options.owner.selectedCombatant);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.FORCE_OF_NATURE_TALENT),
      this.onForceOfNature,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.primaryCd), this.onPrimaryCd);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT),
      this.onConvokeTheSpirits,
    );
  }

  private onForceOfNature(event: CastEvent) {
    this.forceOfNatureCasts.push(event);
  }

  private onPrimaryCd(event: CastEvent) {
    this.primaryCdCasts.push(event);
  }

  private onConvokeTheSpirits(event: CastEvent) {
    this.convokeTheSpiritsCasts.push(event);
  }

  beginCooldown(triggerEvent: AbilityEvent<EventType>, _spellId: number) {
    const spellId = triggerEvent.ability.guid;

    // Always begin the cooldown
    // and do it BEFORE reducing the cooldown duration (otherwise nothing to reduce)
    super.beginCooldown(triggerEvent, spellId);

    // Without Control of the Dream, there is no CD reduction.
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

    // Ensure now that we can retrieve the Ability
    const ability = this.deps.abilities.getAbility(spellId);
    if (ability === undefined) {
      DEBUG &&
        console.error(
          `[${triggerEvent.timestamp}] Could not retrieve Ability with Id=${spellId}. SpellUsable for Balance Druid cannot be computed.`,
        );
      return;
    }

    // Define these variables to handle all abilities the same way
    let spell: Spell;
    let spellsAlreadyCast: CastEvent[];
    let lastCdReductionInMs: number;
    switch (spellId) {
      case TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id:
        spell = TALENTS_DRUID.FORCE_OF_NATURE_TALENT;
        spellsAlreadyCast = this.forceOfNatureCasts;
        lastCdReductionInMs = this.forceOfNatureLastCdReductionInMs;
        break;
      case this.primaryCd.id:
        spell = this.primaryCd;
        spellsAlreadyCast = this.primaryCdCasts;
        lastCdReductionInMs = this.primaryCdLastCdReductionInMs;
        break;
      case TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id:
        spell = TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT;
        spellsAlreadyCast = this.convokeTheSpiritsCasts;
        lastCdReductionInMs = this.convokeTheSpiritsLastCdReductionInMs;
        break;
      default:
        // Should not happen because of guard clause above.
        DEBUG &&
          console.error(
            `[${triggerEvent.timestamp}] ${spellId} should not be manually tracked by Balance Druid SpellUsable`,
          );
        return;
    }

    // We can discard talents that do not have their max number of charges
    if (this.hasNotMaximumNumberOfCharges(triggerEvent, spellId, spell)) {
      DEBUG &&
        console.info(
          `[${triggerEvent.timestamp}] Cooldown of ${spell.name} is not reduced as it's below max number of charges`,
        );
      return;
    }

    DEBUG &&
      console.info(
        `[${triggerEvent.timestamp}] ${spellsAlreadyCast.length} ${spell.name} already casted`,
      );
    const cooldownReductionInMs = this.getCooldownReductionMs(
      triggerEvent,
      ability,
      spell,
      spellsAlreadyCast,
      lastCdReductionInMs,
    );

    const reductionMsApplied = this.reduceCooldown(
      spellId,
      cooldownReductionInMs,
      triggerEvent.timestamp,
    );

    switch (spellId) {
      case TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id:
        this.forceOfNatureLastCdReductionInMs = reductionMsApplied;
        break;
      case this.primaryCd.id:
        this.primaryCdLastCdReductionInMs = reductionMsApplied;
        break;
      case TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id:
        this.convokeTheSpiritsLastCdReductionInMs = reductionMsApplied;
        break;
    }

    DEBUG &&
      console.info(
        `[${triggerEvent.timestamp}] Reduced cooldown of ${spell.name} by ${reductionMsApplied}ms`,
      );
  }

  private getCooldownReductionMs(
    triggerEvent: AbilityEvent<EventType>,
    ability: Ability,
    spell: Spell,
    spellsAlreadyCast: CastEvent[],
    lastCdReductionInMs: number,
  ) {
    if (spellsAlreadyCast.length === 0) {
      // By default, we assume the ability was off CD for more than 15s pre-combat (15s is the CD reduction cap).
      // We have no way of knowing exactly how long it has been off CD pre-combat, but it should be true most of the time.
      return CD_REDUCTION_CAP_IN_MS;
    } else {
      // Otherwise, we need to compute how long the ability has been off CD since the last time it was cast
      const lastCast = spellsAlreadyCast[spellsAlreadyCast.length - 1];
      const timeElapsedSinceLastCastInMs = triggerEvent.timestamp - lastCast.timestamp;

      // haste = 0 is okay because none of these abilities has a hasted cooldown.
      const spellCooldownInMs = ability?.getCooldown(0) * 1_000;
      DEBUG &&
        console.info(
          `[${triggerEvent.timestamp}] Last cast of ${spell.name} was at ${lastCast.timestamp} (${timeElapsedSinceLastCastInMs}ms ago)`,
        );

      // We reduce the spell CD each time, therefore the previous spell cast may have had a smaller CD.
      const previousSpellCastCooldownInMs = spellCooldownInMs - lastCdReductionInMs;
      DEBUG &&
        console.info(
          `[${triggerEvent.timestamp}] Cooldown of ${spell.name} was ${previousSpellCastCooldownInMs}ms (nominal cooldown of ${spellCooldownInMs} - previous CD reduction of ${lastCdReductionInMs})`,
        );

      const timeElapsedSinceSpellAvailable =
        timeElapsedSinceLastCastInMs - previousSpellCastCooldownInMs;

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
