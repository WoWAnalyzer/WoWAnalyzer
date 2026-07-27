// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from Midnight (showing older logs wouldn't make sense)
import type { Boss } from 'game/raids';

import MythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import MythicPlusSeasonTwo from 'game/raids/mythicplusseasontwo';
import VenomousAbyss from 'game/raids/venomous_abyss';
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

const MYTHIC_PLUS_SEASON_ONE_ZONE: Zone = {
  id: 47,
  name: 'Mythic+ Season 1',
  frozen: false,
  useBetaTooltips: false,
  encounters: Object.values(MythicPlusSeasonOne.bosses),
};

export const VENOMOUS_ABYSS_ZONE: Zone = {
  id: 53,
  name: 'Venomous Abyss',
  frozen: false,
  useBetaTooltips: false,
  encounters: Object.values(VenomousAbyss.bosses),
};

const MYTHIC_PLUS_SEASON_TWO_ZONE: Zone = {
  id: 55,
  name: 'Mythic+ Season 2',
  frozen: false,
  useBetaTooltips: false,
  encounters: Object.values(MythicPlusSeasonTwo.bosses),
};

const VSDRMQD_ZONE: Zone = {
  id: 46,
  name: 'Voidspire / Dreamrift / MQD',
  frozen: false,
  useBetaTooltips: false,
  encounters: Object.values(VSDRMQD.bosses),
};

const SPOREFALL_ZONE: Zone = {
  id: 50,
  name: 'Sporefall',
  frozen: false,
  useBetaTooltips: false,
  encounters: Object.values(Sporefall.bosses),
};

const ZONES: Zone[] = [
  MYTHIC_PLUS_SEASON_ONE_ZONE,
  VENOMOUS_ABYSS_ZONE,
  MYTHIC_PLUS_SEASON_TWO_ZONE,
  VSDRMQD_ZONE,
  SPOREFALL_ZONE
];

export default ZONES;
