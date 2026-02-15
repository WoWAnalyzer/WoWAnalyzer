import { Zone } from 'game/ZONES';
import { msv, hof, toes } from 'game/raids/mop_msv_hof_toes';
import tot from 'game/raids/throne_of_thunder';

const ZONES: Zone[] = [
  {
    id: 1038,
    name: 'MSV',
    frozen: false,
    encounters: [
      msv.bosses.TheStoneGuard,
      msv.bosses.FengTheAccursed,
      msv.bosses.GarajalTheSpiritbinder,
      msv.bosses.TheSpiritKings,
      msv.bosses.Elegon,
      msv.bosses.WillOfTheEmperor,
    ],
  },
  {
    id: 1040,
    // WCL is using a combined zone for these raids
    name: 'HoF / ToES',
    frozen: false,
    encounters: [
      hof.bosses.ImperialVizierZorlok,
      hof.bosses.BladeLordTayak,
      hof.bosses.Garalon,
      hof.bosses.WindLordMeljarak,
      hof.bosses.AmberShaperUnsok,
      hof.bosses.GrandEmpressShekzeer,
      toes.bosses.ProtectorsOfTheEndless,
      toes.bosses.Tsulong,
      toes.bosses.LeiShi,
      toes.bosses.ShaOfFear,
    ],
  },
  {
    id: 1046,
    name: 'Throne of Thunder',
    frozen: false,
    encounters: Object.values(tot.bosses),
  },
];

export default ZONES;
