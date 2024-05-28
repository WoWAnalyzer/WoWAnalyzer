import { Raid } from 'game/raids';
import ConclaveOfWind from './ConclaveOfWind';
import AlAkir from './AlAkir';
import Omnotron from './Omnotron';
import Magmaw from './Magmaw';
import Atramedes from './Atramedes';
import Chimaeron from './Chimaeron';
import Maloriak from './Maloriak';
import Nefarian from './Nefarian';
import HalfusWyrmbreaker from './HalfusWyrmbreaker';
import TheralionValiona from './TheralionValiona';
import AscendantCouncil from './AscendantCouncil';
import Chogall from './Chogall';
import Sinestra from './Sinestra';

export const bot = {
  name: 'Bastion of Twilight',
  bosses: {
    HalfusWyrmbreaker,
    TheralionValiona,
    AscendantCouncil,
    Chogall,
    Sinestra,
  },
} satisfies Raid;

export const bwd = {
  name: 'Blackwing Descent',
  bosses: {
    Omnotron,
    Magmaw,
    Atramedes,
    Chimaeron,
    Maloriak,
    Nefarian,
  },
} satisfies Raid;

export const totfw = {
  name: 'Throne of the Four Winds',
  bosses: {
    ConclaveOfWind,
    AlAkir,
  },
} satisfies Raid;
