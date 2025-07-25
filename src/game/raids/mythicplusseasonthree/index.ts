import { type Raid } from '../index';
import { AraKara } from './AraKara';
import { Dawnbreaker } from './Dawnbreaker';
import EcoDomeAldani from './EcoDomeAldani';
import HallsOfAtonement from './HallsOfAtonement';
import OperationFloodgate from './OperationFloodgate';
import PrioryOfTheSacredFlame from './PrioryOfTheSacredFlame';
import TazaveshGambit from './TazaveshGambit';
import TazaveshStreets from './TazaveshStreets';
import background from './backgrounds/EcoDomeAldani.jpg';

export default {
  name: 'Mythic+ Season 3',
  background,
  bosses: {
    EcoDomeAldani,
    AraKara,
    OperationFloodgate,
    PrioryOfTheSacredFlame,
    Dawnbreaker,
    TazaveshGambit,
    TazaveshStreets,
    HallsOfAtonement,
  },
} satisfies Raid;
