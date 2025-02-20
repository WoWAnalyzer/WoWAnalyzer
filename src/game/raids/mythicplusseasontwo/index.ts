import { Raid } from '../index';
import CinderbrewMeadery from './CinderbrewMeadery';
import DarkflameCleft from './DarkflameCleft';
import MechagonWorkshop from './MechagonWorkshop';
import Motherlode from './Motherlode';
import OperationFloodgate from './OperationFloodgate';
import PrioryOfTheSacredFlame from './PrioryOfTheSacredFlame';
import Rookery from './Rookery';
import TheaterOfPain from './TheaterOfPain';

export default {
  name: 'Mythic+ Season 2',
  background: OperationFloodgate.background,
  bosses: {
    OperationFloodgate,
    CinderbrewMeadery,
    DarkflameCleft,
    MechagonWorkshop,
    Motherlode,
    PrioryOfTheSacredFlame,
    Rookery,
    TheaterOfPain,
  },
} satisfies Raid;
