import RACES from 'game/RACES';

/*
 * Taken from https://www.wowhead.com/news=288178/battle-for-dazaralor-flashback-bosses-change-your-race-and-racials
 *
 * Not happy using the class name strings as a comparator -
 * another option would be to use ids, but would require setting up a
 * constants class for Classes as well, not just Specs
 */
export function BOD_HORDE_TO_ALLIANCE(race, spec) {
  const className = spec.className;
  switch (race) {
    case RACES.Orc:
      return RACES.Dwarf;
    case RACES.Troll:
      switch (className) {
        case 'Shaman':
          return RACES.Draenei;
        case 'Warlock':
          return RACES.Human;
        default:
          return RACES.NightElf;
      }
    case RACES.Undead:
      return RACES.Human;
    case RACES.Tauren:
      return className === 'Druid' ? RACES.NightElf : RACES.Draenei;
    case RACES.BloodElf:
      return className === 'Demon Hunter' ? RACES.NightElf : RACES.Human;
    case RACES.Goblin:
      switch (className) {
        case 'Hunter':
        case 'Shaman':
          return RACES.Dwarf;
        default:
          return RACES.Gnome;
      }
    case RACES.PandarenHorde:
      return RACES.PandarenAlliance;
    default:
      return race;
  }
}

export function BOD_ALLIANCE_TO_HORDE(race, spec) {
  const className = spec.className;
  switch (race) {
    case RACES.Human:
      return className === 'Paladin' ? RACES.BloodElf : RACES.Undead;
    case RACES.NightElf:
      return className === 'Demon Hunter' ? RACES.BloodElf : RACES.Troll;
    case RACES.Dwarf:
      switch (className) {
        case 'Paladin':
          return RACES.Tauren;
        case 'Priest':
          return RACES.Undead;
        default:
          return RACES.Orc;
      }
    case RACES.Draenei:
      return className === 'Mage' ? RACES.Orc : RACES.Tauren;
    case RACES.Gnome:
      return className === 'Monk' ? RACES.BloodElf : RACES.Goblin;
    case RACES.Worgen:
      return RACES.Troll;
    case RACES.PandarenAlliance:
      return RACES.PandarenHorde;
    default:
      return race;
  }
}
