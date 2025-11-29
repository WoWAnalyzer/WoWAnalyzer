import type { Raid } from 'game/raids';
import { buildBoss } from 'game/raids/builders';
import background from './backgrounds/Season1.jpg';

export default {
  name: 'Mythic+ Season 1',
  background,
  bosses: {
    MagistersTerrace: buildBoss({
      id: 2811,
      name: "Magister's Terrace",
    }),
    MaisaraCaverns: buildBoss({
      id: 2874,
      name: 'Maisara Caverns',
    }),
    NexusPointXenas: buildBoss({
      id: 2915,
      name: 'Nexus Point Xenas',
    }),
    WindrunnerSpire: buildBoss({
      id: 2805,
      name: 'Windrunner Spire',
    }),
    AlgetharAcademy: buildBoss({
      id: 162526,
      name: "Algeth'ar Academy",
    }),
    SeatOfTheTriumvirate: buildBoss({
      id: 411753,
      name: 'The Seat of the Triumvirate',
    }),
    Skyreach: buildBoss({
      id: 111209,
      name: 'Skyreach',
    }),
    PitOfSaron: buildBoss({
      id: 60658,
      name: 'Pit of Saron',
    }),
  },
} satisfies Raid;
