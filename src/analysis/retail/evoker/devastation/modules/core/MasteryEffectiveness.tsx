import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';

type MasteryEvent = {
  sourceEvent: HealEvent | AbsorbedEvent;
  effectiveHealing: number;
  rawMasteryGain: number;
  maxPotentialRawMasteryHealing: number;
};

class MasteryEffectiveness extends Analyzer {
  static dependencies = {
    combatant: Combatants,
    statTracker: StatTracker,
  };

  protected combatants!: Combatants;
  protected statTracker!: StatTracker;

  rawMasteryEffectivenessSum = 0;
  rawMasteryEffectivenessCount = 0;
  /**
   * @return {number} The mastery effectiveness based solely on your range to the target being healed. Health levels and healing amounts are not included. This means if you do 999 tiny heals and 1 big one, it still takes the average range-based mastery effectiveness of the 1000 heals.
   */
  get averageRawMasteryEffectiveness(): number {
    return this.rawMasteryEffectivenessSum / this.rawMasteryEffectivenessCount;
  }

  /**
   * @type {number} The total amount of healing done by just the mastery gain. Precisely calculated for every spell.
   */
  totalMasteryHealingDone: number = 0;

  masteryHealEvents: MasteryEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorbedByPlayer);
  }

  isTargetHealthierThanPlayer(playerHealth: number, targetHealth: number): boolean {
    return playerHealth > targetHealth;
  }

  onHeal(event: HealEvent) {
    return;
  }
  onCast(event: CastEvent) {
    return;
  }
  onAbsorbedByPlayer(event: AbsorbedEvent) {
    return;
  }
}

export default MasteryEffectiveness;
