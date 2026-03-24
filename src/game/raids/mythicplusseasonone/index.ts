import type { Raid } from 'game/raids';
import { buildBoss } from 'game/raids/builders';
import background from './backgrounds/Season1.jpg';

export default {
  name: 'Mythic+ Season 1',
  background,
  bosses: {
    MagistersTerrace: buildBoss({
      id: 12811,
      name: "Magister's Terrace",
    }),
    MaisaraCaverns: buildBoss({
      id: 12874,
      name: 'Maisara Caverns',
    }),
    NexusPointXenas: buildBoss({
      id: 12915,
      name: 'Nexus Point Xenas',
    }),
    WindrunnerSpire: buildBoss({
      id: 12805,
      name: 'Windrunner Spire',
    }),
    AlgetharAcademy: buildBoss({
      id: 112526,
      name: "Algeth'ar Academy",
    }),
    SeatOfTheTriumvirate: buildBoss({
      id: 361753,
      name: 'The Seat of the Triumvirate',
    }),
    Skyreach: buildBoss({
      id: 61209,
      name: 'Skyreach',
    }),
    PitOfSaron: buildBoss({
      id: 10658,
      name: 'Pit of Saron',
    }),
  },
} satisfies Raid;
