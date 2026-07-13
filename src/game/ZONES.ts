// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from Midnight (showing older logs wouldn't make sense)
import type { Boss } from 'game/raids';

import MythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import VSDRMQD from 'game/raids/vs_dr_mqd';
import Sporefall from 'game/raids/sporefall';

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
    id: 47,
    name: 'Mythic+ Season 1',
    frozen: false,
    useBetaTooltips: false,
    encounters: Object.values(MythicPlusSeasonOne.bosses),
  },
  {
    id: 46,
    name: 'Voidspire / Dreamrift / MQD',
    frozen: false,
    useBetaTooltips: false,
    encounters: Object.values(VSDRMQD.bosses),
    partition: 3,
  },
  {
    id: 50,
    name: 'Sporefall',
    frozen: false,
    useBetaTooltips: false,
    encounters: Object.values(Sporefall.bosses),
  },
];

export default ZONES;
