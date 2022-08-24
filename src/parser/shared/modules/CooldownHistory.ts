import Analyzer from 'parser/core/Analyzer';
import { EventType, UpdateSpellUsableEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellHistory from 'parser/shared/modules/SpellHistory';

/**
 * Helper for querying spell cooldown status at previous points in the log
 */
class CooldownHistory extends Analyzer {
  static dependencies = {
    spellHistory: SpellHistory,
    abilities: Abilities,
  };
  protected spellHistory!: SpellHistory;
  protected abilities!: Abilities;

  /**
   * Whether the spell could have been cast at the given timestamp.
   * This is not the opposite of `wasOnCooldown`!
   * A spell with 2 charges, 1 available and 1 on cooldown would be both
   * available and on cooldown at the same time.
   * @param spellId the spell's ID
   * @param timestamp the timestamp to check (must be at or before the current timestamp)
   *   If the cooldown is updated on this timestamp, the results given are for immediately
   *   *after* the update.
   */
  public wasAvailable(spellId: number, timestamp: number): boolean {
    const mostRecent = this._getMostRecentUpdateSpellUsableBeforeTimestamp(spellId, timestamp);
    return !mostRecent ? true : mostRecent.isAvailable;
  }

  /**
   * Whether the spell was cooling down at the given timestamp.
   * This is not the opposite of `wasAvailable`!
   * A spell with 2 charges, 1 available and 1 on cooldown would be both
   * available and on cooldown at the same time.
   * @param spellId the spell's ID
   * @param timestamp the timestamp to check (must be at or before the current timestamp)
   *   If the cooldown is updated on this timestamp, the results given are for immediately
   *   *after* the update.
   */
  public wasOnCooldown(spellId: number, timestamp: number): boolean {
    const mostRecent = this._getMostRecentUpdateSpellUsableBeforeTimestamp(spellId, timestamp);
    return !mostRecent ? false : mostRecent.isOnCooldown;
  }

  /**
   * The number of charges of the spell that were available at the given timestamp.
   * For an available spell without charges, this will always be one.
   * @param spellId the spell's ID
   * @param timestamp the timestamp to check (must be at or before the current timestamp)
   *   If the cooldown is updated on this timestamp, the results given are for immediately
   *   *after* the update.
   */
  public chargesAvailable(spellId: number, timestamp: number): number {
    const mostRecent = this._getMostRecentUpdateSpellUsableBeforeTimestamp(spellId, timestamp);
    return !mostRecent
      ? this.abilities.getAbility(spellId)?.charges || 1
      : mostRecent.chargesAvailable;
  }

  /** Gets the most recent UpdateSpellUsableEvent for this spell before the given timestamp */
  private _getMostRecentUpdateSpellUsableBeforeTimestamp(
    spellId: number,
    timestamp: number,
  ): UpdateSpellUsableEvent | undefined {
    const history = this.spellHistory.historyBySpellId[spellId];
    if (!history) {
      return undefined;
    }
    const usuHistory = history.filter(
      (event): event is UpdateSpellUsableEvent => event.type === EventType.UpdateSpellUsable,
    );
    const mostRecentIndex = usuHistory.findIndex((event) => event.timestamp > timestamp);
    return mostRecentIndex <= 0 ? undefined : usuHistory[mostRecentIndex - 1];
  }
}

export default CooldownHistory;
