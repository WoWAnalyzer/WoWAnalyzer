import type { Raid } from 'game/raids';
import background from './backgrounds/zone.jpg';
import JinRokh from './JinRokh';
import Horridon from './Horridon';
import CouncilOfElders from './CouncilOfElders';
import Tortos from './Tortos';
import Megaera from './Megaera';
import JiKun from './JiKun';
import Durumu from './Durumu';
import Primordius from './Primordius';
import DarkAnimus from './DarkAnimus';
import IronQon from './IronQon';
import TwinEmpyreans from './TwinEmpyreans';
import LeiShen from './LeiShen';
import RaDen from './RaDen';

export default {
  name: 'Throne of Thunder',
  background,
  bosses: {
    JinRokh,
    Horridon,
    CouncilOfElders,
    Tortos,
    Megaera,
    JiKun,
    Durumu,
    Primordius,
    DarkAnimus,
    IronQon,
    TwinEmpyreans,
    LeiShen,
    RaDen,
  },
} satisfies Raid;
