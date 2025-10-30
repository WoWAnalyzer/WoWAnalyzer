import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/mage';

/**
 * Tracks damage contributions during Combustion windows
 */
export default class CombustionDamageTracker extends Analyzer {
  private damageBySpell = new Map<number, number>();
  private totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    // Only track damage during Combustion
    if (!this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id)) {
      return;
    }

    const spellId = event.ability.guid;
    const amount = event.amount + (event.absorbed || 0);

    // Add to spell total
    const current = this.damageBySpell.get(spellId) || 0;
    this.damageBySpell.set(spellId, current + amount);

    // Add to overall total
    this.totalDamage += amount;
  }

  /**
   * Get damage contribution for a specific spell ID
   * @param spellId The spell ID to get damage for, or -1 for total damage
   * @returns The damage amount
   */
  getDamageForSpell(spellId: number): number {
    if (spellId === -1) {
      return this.totalDamage;
    }
    return this.damageBySpell.get(spellId) || 0;
  }

  /**
   * Get total damage from all tracked spells
   */
  getTotalDamage(): number {
    return this.totalDamage;
  }

  /**
   * Get damage percentage for a specific spell
   */
  getDamagePercentage(spellId: number): number {
    if (this.totalDamage === 0) {
      return 0;
    }
    return this.getDamageForSpell(spellId) / this.totalDamage;
  }
}
