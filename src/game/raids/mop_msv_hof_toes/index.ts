import { Raid } from 'game/raids';
import TheStoneGuard from './TheStoneGuard';
import FengTheAccursed from './FengTheAccursed';
import GarajalTheSpiritbinder from './GarajalTheSpiritbinder';
import TheSpiritKings from './TheSpiritKings';
import Elegon from './Elegon';
import WillOfTheEmperor from './WillOfTheEmperor';
import ImperialVizierZorlok from './ImperialVizierZorlok';
import BladeLordTayak from './BladeLordTayak';
import Garalon from './Garalon';
import WindLordMeljarak from './WindLordMeljarak';
import AmberShaperUnsok from './AmberShaperUnsok';
import GrandEmpressShekzeer from './GrandEmpressShekzeer';
import ProtectorsOfTheEndless from './ProtectorsOfTheEndless';
import Tsulong from './Tsulong';
import LeiShi from './LeiShi';
import ShaOfFear from './ShaOfFear';

export const msv = {
  name: "Mogu'shan Vaults",
  bosses: {
    TheStoneGuard,
    FengTheAccursed,
    GarajalTheSpiritbinder,
    TheSpiritKings,
    Elegon,
    WillOfTheEmperor,
  },
} satisfies Raid;

export const hof = {
  name: 'Heart of Fear',
  bosses: {
    ImperialVizierZorlok,
    BladeLordTayak,
    Garalon,
    WindLordMeljarak,
    AmberShaperUnsok,
    GrandEmpressShekzeer,
  },
} satisfies Raid;

export const toes = {
  name: 'Terrace of Endless Spring',
  bosses: {
    ProtectorsOfTheEndless,
    Tsulong,
    LeiShi,
    ShaOfFear,
  },
} satisfies Raid;
