import type { Raid } from 'game/raids';
import { buildBoss } from 'game/raids/builders';
import WindrunnerSpire from './backgrounds/WindrunnerSpire.jpg';
import Skyreach from './backgrounds/Skyreach.jpg';
import SeatOfTheTriumvirate from './backgrounds/SeatOfTheTriumvirate.jpg';
import PitOfSaron from './backgrounds/PitOfSaron.jpg';
import NexusPointXenas from './backgrounds/NexusPointXenas.jpg';
import MaisaraCaverns from './backgrounds/MaisaraCaverns.jpg';
import MagistersTerrace from './backgrounds/MagistersTerrace.jpg';
import AlgetharAcademy from './backgrounds/AlgetharAcademy.jpg';

export default {
  name: 'Mythic+ Season 1',
  background: NexusPointXenas,
  bosses: {
    MagistersTerrace: buildBoss({
      id: 12811,
      name: "Magister's Terrace",
      background: MagistersTerrace,
    }),
    MaisaraCaverns: buildBoss({
      id: 12874,
      name: 'Maisara Caverns',
      background: MaisaraCaverns,
    }),
    NexusPointXenas: buildBoss({
      id: 12915,
      name: 'Nexus Point Xenas',
      background: NexusPointXenas,
    }),
    WindrunnerSpire: buildBoss({
      id: 12805,
      name: 'Windrunner Spire',
      background: WindrunnerSpire,
    }),
    AlgetharAcademy: buildBoss({
      id: 112526,
      name: "Algeth'ar Academy",
      background: AlgetharAcademy,
    }),
    SeatOfTheTriumvirate: buildBoss({
      id: 361753,
      name: 'The Seat of the Triumvirate',
      background: SeatOfTheTriumvirate,
    }),
    Skyreach: buildBoss({
      id: 61209,
      name: 'Skyreach',
      background: Skyreach,
    }),
    PitOfSaron: buildBoss({
      id: 10658,
      name: 'Pit of Saron',
      background: PitOfSaron,
    }),
  },
} satisfies Raid;
