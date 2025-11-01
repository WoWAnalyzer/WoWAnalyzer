import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/mage';
import SPELLS from 'common/SPELLS';

/**
 * Tracks damage contributions during Combustion windows
 */
export default class CombustionDamageTracker extends Analyzer {
  private damageBySpell = new Map<number, number>();
  private totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onArcanePhoenixDamage);
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

  onArcanePhoenixDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id)) {
      return;
    }

    const amount = event.amount + (event.absorbed || 0);

    const current = this.damageBySpell.get(SPELLS.ARCANE_PHOENIX_DAMAGE.id) || 0;
    this.damageBySpell.set(SPELLS.ARCANE_PHOENIX_DAMAGE.id, current + amount);

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
