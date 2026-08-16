import type { Raid } from 'game/raids';
import background from './backgrounds/VenomousAbyss.jpg';
import TheCoiledAltar from './TheCoiledAltar';
import NekzaliTheSoulcoiler from './NekzaliTheSoulcoiler';
import LostExplorers from './LostExplorers';
import Sszorak from './Sszorak';
import EntombedSentinels from './EntombedSentinels';
import VashnikTheMalignant from './VashnikTheMalignant';
import TwinFangs from './TwinFangs';
import UlaTek from './UlaTek';

export default {
  name: 'Venomous Abyss',
  background,
  bosses: {
    TheCoiledAltar,
    NekzaliTheSoulcoiler,
    LostExplorers,
    Sszorak,
    EntombedSentinels,
    VashnikTheMalignant,
    TwinFangs,
    UlaTek,
  },
} satisfies Raid;
