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

  // TODO accurate cooldownRemaining not possible from events alone - find a way around this?

  /** Gets the most recent UpdateSpellUsableEvent for this spell before the given timestamp,
   *  or undefined if there is no such event */
  private _getMostRecentUpdateSpellUsableBeforeTimestamp(
    spellId: number,
    timestamp: number,
  ): UpdateSpellUsableEvent | undefined {
    const history = this.spellHistory.historyBySpellId[spellId];
    if (!history) {
      return undefined;
    }

    // all the UpdateSpellUsable events for this spell, in time order
    const usuHistory = history.filter(
      (event): event is UpdateSpellUsableEvent => event.type === EventType.UpdateSpellUsable,
    );
    if (usuHistory.length === 0) {
      return undefined;
    }

    // get index of the first UpdateSpellUsable event *after* the given timestamp
    const firstIndexAfter = usuHistory.findIndex((event) => event.timestamp > timestamp);
    if (firstIndexAfter === -1) {
      // all events are before, therefore the last event is the most recent before
      return usuHistory[usuHistory.length - 1];
    } else if (firstIndexAfter === 0) {
      // all events are after, therefore there are no events before
      return undefined;
    } else {
      // the event one before this index is 'the most recent before'
      return usuHistory[firstIndexAfter - 1];
    }
  }
}

export default CooldownHistory;
