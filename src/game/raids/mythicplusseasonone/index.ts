import type { Raid } from 'game/raids';
import { StoneVault } from './StoneVault';
import { Siege } from './Siege';
import { NecroticWake } from './NecroticWake';
import { Mists } from './Mists';
import { GrimBatol } from './GrimBatol';
import { Dawnbreaker } from './Dawnbreaker';
import { CityOfThreads } from './CityOfThreads';
import { AraKara } from './AraKara';
import background from './backgrounds/Season1.jpg';

export default {
  name: 'Mythic+ Season 1',
  background,
  bosses: {
    AraKara,
    CityOfThreads,
    Dawnbreaker,
    GrimBatol,
    Mists,
    NecroticWake,
    Siege,
    StoneVault,
  },
} satisfies Raid;
