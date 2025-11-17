// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from The War Within (showing older logs wouldn't make sense)
import mythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import nerubarPalace from 'game/raids/nerubarpalace';
import type { Boss } from 'game/raids';
import undermine from 'game/raids/undermine';
import mythicPlusSeasonTwo from 'game/raids/mythicplusseasontwo';
import manaforgeOmega from 'game/raids/manaforge-omega';
import mythicPlusSeasonThree from 'game/raids/mythicplusseasonthree';

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
    frozen: true,
    encounters: [...Object.values(nerubarPalace.bosses)],
  },
  {
    id: 39,
    name: 'Mythic+ Season 1',
    frozen: true,
    encounters: [...Object.values(mythicPlusSeasonOne.bosses)],
  },
  {
    id: 42,
    name: 'Liberation of Undermine',
    frozen: true,
    encounters: [...Object.values(undermine.bosses)],
  },
  {
    id: 43,
    name: 'Mythic+ Season 2',
    frozen: true,
    encounters: [...Object.values(mythicPlusSeasonTwo.bosses)],
  },
  {
    id: 44,
    name: 'Manaforge Omega',
    frozen: false,
    encounters: [...Object.values(manaforgeOmega.bosses)],
  },
  {
    id: 45,
    name: 'Mythic+ Season 3',
    frozen: false,
    encounters: [...Object.values(mythicPlusSeasonThree.bosses)],
  },
];

export default ZONES;
