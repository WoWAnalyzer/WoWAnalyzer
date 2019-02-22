import SPECS from 'game/SPECS';
import RACES from 'game/RACES';

// Taken from https://www.wowhead.com/news=288178/battle-for-dazaralor-flashback-bosses-change-your-race-and-racials
export function BOD_HORDE_TO_ALLIANCE(race, spec) {
  const className = spec.className;
  switch (race) {
    case RACES.Orc:
      return RACES.Dwarf;

    case RACES.Troll:
      switch (clazz) {
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
      return clazz === 'Druid' ? RACES.NightElf : RACES.Draenei;

    case RACES.BloodElf:
      return clazz === 'DemonHunter' ? RACES.NightElf : RACES.Human;

    case RACES.Goblin:
      switch (clazz) {
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
