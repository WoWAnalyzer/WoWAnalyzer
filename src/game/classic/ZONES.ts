import { Zone } from 'game/ZONES';
import { bwd, bot, totfw } from 'game/raids/cata_bwd_bot_totfw';
import firelands from 'game/raids/cata_firelands';

const ZONES: Zone[] = [
  {
    id: 1023,
    // WCL is using a combined zone for these raids
    name: 'TotFW / BWD / BoT',
    frozen: false,
    encounters: [
      totfw.bosses.ConclaveOfWind,
      totfw.bosses.AlAkir,
      bwd.bosses.Omnotron,
      bwd.bosses.Magmaw,
      bwd.bosses.Atramedes,
      bwd.bosses.Chimaeron,
      bwd.bosses.Maloriak,
      bwd.bosses.Nefarian,
      bot.bosses.HalfusWyrmbreaker,
      bot.bosses.TheralionValiona,
      bot.bosses.AscendantCouncil,
      bot.bosses.Chogall,
      bot.bosses.Sinestra,
    ],
  },
  {
    id: 1027,
    name: 'Firelands',
    frozen: false,
    encounters: [
      firelands.bosses.Alysrazor,
      firelands.bosses.Baleroc,
      firelands.bosses.Bethtilac,
      firelands.bosses.LordRhyolith,
      firelands.bosses.MajordomoStaghelm,
      firelands.bosses.Ragnaros,
      firelands.bosses.Shannox,
    ],
  },
];

export default ZONES;
