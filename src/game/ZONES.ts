// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from Midnight (showing older logs wouldn't make sense)
import type { Boss } from 'game/raids';

export interface Zone {
  id: number;
  name: string;
  frozen?: boolean;
  encounters: Boss[];
  useBetaTooltips?: boolean;
  usePtrTooltips?: boolean;
  partition?: number;
}

const ZONES: Zone[] = [
  {
    id: 46,
    name: 'Voidspire / Dreamrift / MQD',
    frozen: false,
    useBetaTooltips: true,
    encounters: [],
  },
  {
    id: 47,
    name: 'Mythic+ Season 1',
    frozen: false,
    useBetaTooltips: true,
    encounters: [],
  },
];

export default ZONES;
