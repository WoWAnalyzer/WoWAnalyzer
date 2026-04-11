enum Faction {
  Alliance = 'Alliance',
  Horde = 'Horde',
}

/**
 * WCL combat logs report faction as a numeric id on `CombatantInfoEvent`,
 * where `1` is Alliance and any other value is Horde.
 */
export const factionFromWclId = (id: number): Faction =>
  id === 1 ? Faction.Alliance : Faction.Horde;

export default Faction;
