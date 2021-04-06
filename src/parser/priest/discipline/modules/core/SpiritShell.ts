import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';
import Events, {
  Event,
  AbsorbedEvent,
  RemoveBuffEvent,
  DamageEvent,
  EventType,
  HealEvent,
} from 'parser/core/Events';

import EventEmitter from 'parser/core/modules/EventEmitter';
import Enemies from 'parser/shared/modules/Enemies';
import StatTracker from 'parser/shared/modules/StatTracker';
import {
  ATONEMENT_COEFFICIENT,
  ATONEMENT_SOURCE_FILTER,
  SPIRIT_SHELL_COEFFICIENT,
} from '../../constants';
import Exaltation from '../shadowlands/conduits/Exaltation';
import Atonement from '../spells/Atonement';
import SinsOfTheMany from '../spells/SinsOfTheMany';

const isWithinDelta = (d: number) => (n1: number, n2: number) => Math.abs(n2 - n1) <= d;

/**
 * Damage buffs for Spirit Shell
 */
const CHAOS_BRAND_VALUE = 1.05;
const SCHISM_VALUE = 1.25;

/**
 * Setup for custom events
 * Instead of adding Spirit Shell support directly into every module, we route it through the AtonementAnalyzer module
 */
export const SpiritShellApplied = new EventFilter(EventType.SpiritShell);

export interface SpiritShellEvent extends Event<EventType.SpiritShell> {
  sourceEvent: DamageEvent | HealEvent | AbsorbedEvent;
  amount: number;
  overheal?: number;
  targetID: number;
}

export default class SpiritShell extends Analyzer {
  protected statTracker!: StatTracker;
  protected enemies!: Enemies;
  protected atonement!: Atonement;
  protected exaltation!: Exaltation;
  protected sinsOfTheMany!: SinsOfTheMany;
  protected eventEmitter!: EventEmitter;

  static dependencies = {
    statTracker: StatTracker,
    enemies: Enemies,
    atonement: Atonement,
    exaltation: Exaltation,
    sinsOfTheMany: SinsOfTheMany,
    eventEmitter: EventEmitter,
  };

  private chaosBrandMap: Map<number, Boolean> = new Map();
  private shellTotalMap: Map<number, number> = new Map();
  private shellExpiryMap: Map<number, number> = new Map();
  private shellCurrentMap: Map<number, number> = new Map();

  constructor(options: Options) {
    super(options);

    // Atonement Damage Events
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(ATONEMENT_SOURCE_FILTER),
      this.handleChaosBrandSet,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(ATONEMENT_SOURCE_FILTER),
      this.handleDamage,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.handlePetDamage);

    // Spirit Shell buff events
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SPIRIT_SHELL_BUFF),
      this.handleSpiritShellExpiration,
    );

    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.SPIRIT_SHELL_BUFF),
      this.absorbHandler,
    );
  }

  /**
   * Returns the current effective cap for Spirit Shell
   */
  get spiritShellCap() {
    return this.statTracker.currentIntellectRating * 11;
  }

  /**
   * Determines if a damage event is being buffed by the Chaos Brand (magic damage) debuff on the
   * target enemy, and if so flags them as having the debuff.
   *
   * This is necessary as the enemy tracker does not track that for the priest.
   * @param event A damage event
   */
  private handleChaosBrandSet(event: DamageEvent): void {
    if (this.chaosBrandMap.has(event.targetID)) return;

    const critMultiplier = event.hitType === 2 ? 2 : 1;
    const { unmitigatedAmount, amount, overkill } = event;
    const generalMultiplier =
      (amount + (overkill || 0)) / (unmitigatedAmount || 1) / critMultiplier;

    if (isWithinDelta(0.05)(generalMultiplier, CHAOS_BRAND_VALUE)) {
      this.chaosBrandMap.set(event.targetID, true);
    }
  }

  /**
   * Estimates the damage multiplier that will be counted towards Atonement or Spirit Shell values
   * i.e most things that aren't buffs such as Reorigination Array on Ghuun
   * @param hasChaosBrand If the target has the Chaos Brand debuff
   * @param hasSchism If the target has the Schism debuff
   * @param hasSins If the player has Sins of the Many
   */
  private estimatedDamageMultiplier(
    hasChaosBrand: Boolean,
    hasSchism: Boolean,
    hasSins: Boolean,
  ): number {
    const cbMultiplier = hasChaosBrand ? CHAOS_BRAND_VALUE : 1;
    const schismMultiplier = hasSchism ? SCHISM_VALUE : 1;
    const sinsMultiplier = hasSins ? this.sinsOfTheMany.currentBonus + 1 : 1;

    return 1 * cbMultiplier * schismMultiplier * sinsMultiplier;
  }

  /**
   * Gets the estimated value for a Spirit Shell absorb by considering a given damage number
   * and the statistics that are used to map it to an absorb amount
   *
   * Note: Versatility is intentionally ignored here as it is baked into the unmitigatedDamage
   * @param damageEstimate An estimated damage value, after Discipline specific modifiers such as Schism
   * @param mastery The mastery percentage, expressed as a decimal - e.g. 0.15
   * @param crit The crit percentage, expressed as a decimal - e.g. 0.10
   */
  private getEstimatedSpiritShellValue(
    damageEstimate: number,
    mastery: number,
    crit: number,
  ): number {
    const masteryMultiplier = 1 + mastery;
    const critMultiplier = 1 + crit;
    const exaltationBuff = this.exaltation.conduitIncrease + 1;

    return (
      damageEstimate *
      masteryMultiplier *
      critMultiplier *
      ATONEMENT_COEFFICIENT *
      SPIRIT_SHELL_COEFFICIENT *
      exaltationBuff
    );
  }

  /**
   * Calculates the estimated value of a Spirit Shell absorb from a damage event
   * @param event A damage event
   */
  private getEstimatedSpiritShellValueForEvent(event: DamageEvent): number {
    const hasSchism: Boolean =
      this.enemies.getEntity(event)?.hasBuff(SPELLS.SCHISM_TALENT.id) || false;
    const hasChaosBrand: Boolean = this.chaosBrandMap.get(event.targetID) || false;
    const { currentMasteryPercentage, currentCritPercentage } = this.statTracker;
    const hasSins = this.sinsOfTheMany.active;

    if (!event.unmitigatedAmount) return 0;

    const estimatedDamageValue =
      (event.unmitigatedAmount || 0) *
      this.estimatedDamageMultiplier(hasChaosBrand, hasSchism, hasSins);
    return Math.round(
      this.getEstimatedSpiritShellValue(
        estimatedDamageValue,
        currentMasteryPercentage,
        currentCritPercentage,
      ),
    );
  }

  /**
   * Handles the mapping of damage events to Spirit Shell values, and maintaining the estimates
   * @param event A damage event
   */
  private handleDamage(event: DamageEvent): void {
    // We do not care about this event if Spirit Shell is not active on the priest
    if (!this.selectedCombatant.hasBuff(SPELLS.SPIRIT_SHELL_TALENT.id)) return;

    // Calculate the estimated shield value for this event
    const spiritShellEstimate = this.getEstimatedSpiritShellValueForEvent(event);

    this.attributeSpiritShell(spiritShellEstimate, event);
  }

  /**
   * Handles pet damage contributions to Atonement
   * @param event A damage event from the player's pet
   */
  private handlePetDamage(event: DamageEvent): void {
    // We do not care about this event if Spirit Shell is not active on the priest
    if (!this.selectedCombatant.hasBuff(SPELLS.SPIRIT_SHELL_TALENT.id)) return;

    this.attributeSpiritShell(event.unmitigatedAmount || 0, event);
  }

  /**
   * Handles the attribution
   * @param amount The amount of absorb projected to be added
   * @param target The target to attribute this to
   */
  private attributeSpiritShell(amount: number, sourceEvent: DamageEvent): void {
    // Attribute this estimate to each player's total
    this.atonement.atonementTargets.forEach(({ target }) => {
      const existingShellValue = this.shellTotalMap.get(target) || 0;

      this.shellTotalMap.set(target, existingShellValue + amount);
    });

    // Attribute to the each player's current absorb
    this.atonement.atonementTargets.forEach(({ target }) => {
      const existingAbsorb = this.shellCurrentMap.get(target) || 0;
      const projectedAbsorbValue = existingAbsorb + amount;

      // Over absorb
      if (projectedAbsorbValue > this.spiritShellCap) {
        const effectiveAbsorb = this.spiritShellCap - existingAbsorb;
        const overAbsorb = projectedAbsorbValue - this.spiritShellCap;

        // Emit an event for other modules to use when overhealing
        this.eventEmitter.fabricateEvent(
          this.spiritShellEvent(sourceEvent, amount - overAbsorb, target, overAbsorb),
        );

        this.shellCurrentMap.set(target, this.spiritShellCap);
        return;
      }

      this.eventEmitter.fabricateEvent(this.spiritShellEvent(sourceEvent, amount, target));

      this.shellCurrentMap.set(target, projectedAbsorbValue);
    });
  }

  /**
   * Handles the expiration overheal component of Spirit Shell
   * @param event The buff expiry event for Spirit Shell
   */
  private handleSpiritShellExpiration(event: RemoveBuffEvent) {
    const { absorb } = event; // The amount of 'overheal' from the absorb expiring
    const existingExpiredAbsorbs = this.shellExpiryMap.get(event.targetID) || 0;

    this.shellExpiryMap.set(event.targetID, existingExpiredAbsorbs + (absorb || 0));
  }

  /**
   * Handler for the absorb component of Spirit Shell
   * @param event An absorb event
   */
  private absorbHandler(event: AbsorbedEvent) {
    const { targetID, amount } = event;

    const currentAbsorb = this.shellCurrentMap.get(targetID);

    if (currentAbsorb === undefined) {
      console.log(`Absorb ${targetID} event detected without player being in absorb map??`, event);
      return;
    }

    this.shellCurrentMap.set(targetID, currentAbsorb - amount);
  }

  private spiritShellEvent(
    source: DamageEvent | AbsorbedEvent,
    amount: number,
    targetID: number,
    overheal?: number,
  ): SpiritShellEvent {
    return {
      sourceEvent: source,
      timestamp: source.timestamp,
      type: EventType.SpiritShell,
      amount,
      overheal,
      targetID,
    };
  }
}
