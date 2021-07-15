/*
 * Several utilities for parsing combatantinfo events, intended for use by functional analyzers.
 * The combatantinfo API is not frozen by WCL, and so is subject to change,
 * as such all access of the event should be through these utilities instead of direct.
 */
import { CombatantInfoEvent, Item } from 'parser/core/Events';

/** Returns true iff the given combatant has the talent with the given spellId */
export function hasTalent(combatantInfo: CombatantInfoEvent, spellId: number): boolean {
  return combatantInfo.talents.find((talent) => talent.id === spellId) !== undefined;
}

/** Returns the item on the given combatant with the given itemId, or undefined if not present */
export function getItem(combatantInfo: CombatantInfoEvent, itemId: number): Item | undefined {
  return combatantInfo.gear.find((item) => item.id === itemId);
}

/** Returns true iff the given combatant has the item with the given itemId */
export function hasItem(combatantInfo: CombatantInfoEvent, itemId: number): boolean {
  return getItem(combatantInfo, itemId) !== undefined;
}

/** Returns true iff the given combatant has the legendary with the given bonusId
 * (this will only find crafted legendaries which are applied to existing items) */
export function hasLegendaryByBonusId(combatantInfo: CombatantInfoEvent, bonusId: number): boolean {
  return (
    combatantInfo.gear.find(
      (item) =>
        (Array.isArray(item.bonusIDs) && item.bonusIDs.includes(bonusId)) ||
        item.bonusIDs === bonusId,
    ) !== undefined
  );
}

/** Returns true iff the given combatant has the covenant with the given covenantId */
export function hasCovenant(combatantInfo: CombatantInfoEvent, covenantId: number): boolean {
  return combatantInfo.covenantID === covenantId;
}

export function hasConduit(combatantInfo: CombatantInfoEvent, spellId: number): boolean {
  return false; // TODO - beaware of existing modification of conduits with ilevel / rank stuff
}

export function getConduitRank(combatantInfo: CombatantInfoEvent, spellId: number): number {
  return 0; // TODO - beaware of existing modification of conduits with ilevel / rank stuff
}
