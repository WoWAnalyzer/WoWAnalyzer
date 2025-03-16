// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from Dragonflight (showing older logs wouldn't make sense)
import mythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import nerubarPalace from 'game/raids/nerubarpalace';
import type { Boss } from 'game/raids';
import undermine from 'game/raids/undermine';
import mythicPlusSeasonTwo from 'game/raids/mythicplusseasontwo';

export interface Zone {
  id: number;
  name: string;
  frozen?: boolean;
  encounters: Boss[];
  usePtrTooltips?: boolean;
  partition?: number;
}

const ZONES: Zone[] = [
  {
    id: 38,
    name: "Nerub'ar Palace",
    frozen: false,
    encounters: [...Object.values(nerubarPalace.bosses)],
  },
  {
    id: 39,
    name: 'Mythic+ Season 1',
    frozen: false,
    encounters: [...Object.values(mythicPlusSeasonOne.bosses)],
  },
  {
    id: 42,
    name: 'Liberation of Undermine',
    frozen: false,
    encounters: [...Object.values(undermine.bosses)],
  },
  {
    id: 43,
    name: 'Mythic+ Season 2',
    frozen: false,
    encounters: [...Object.values(mythicPlusSeasonTwo.bosses)],
  },
];

export default ZONES;
