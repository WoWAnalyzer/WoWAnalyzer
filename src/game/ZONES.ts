// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from Midnight (showing older logs wouldn't make sense)
import type { Boss } from 'game/raids';

import MythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import VSDRMQD from 'game/raids/vs_dr_mqd';

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
    id: 48, // TODO (@emallson): the release zone is 46
    name: 'Voidspire / Dreamrift / MQD',
    frozen: false,
    useBetaTooltips: true,
    encounters: Object.values(VSDRMQD.bosses),
  },
  {
    id: 49, // TODO (@emallson): the release zone is 47
    name: 'Mythic+ Season 1',
    frozen: false,
    useBetaTooltips: true,
    encounters: Object.values(MythicPlusSeasonOne.bosses),
  },
];

export default ZONES;
