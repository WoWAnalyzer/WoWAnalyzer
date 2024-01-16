import ulduar from 'game/raids/ulduar';
import togc from 'game/raids/trialofthegrandcrusader';
import icc from 'game/raids/icc';
import rs from 'game/raids/rubysanctum';
import { Zone } from 'game/ZONES';

const ZONES: Zone[] = [
  {
    id: 1017,
    name: 'Ulduar',
    frozen: false,
    encounters: [
      ulduar.bosses.FlameLeviathan,
      ulduar.bosses.Ignis,
      ulduar.bosses.Razorscale,
      ulduar.bosses.XT002,
      ulduar.bosses.IronCouncil,
      ulduar.bosses.Kologarn,
      ulduar.bosses.Auriaya,
      ulduar.bosses.Hodir,
      ulduar.bosses.Thorim,
      ulduar.bosses.Freya,
      ulduar.bosses.Mimiron,
      ulduar.bosses.GeneralVezax,
      ulduar.bosses.YoggSaron,
      ulduar.bosses.Algalon,
    ],
  },
  {
    id: 1018,
    name: 'Trial of the Grand Crusader',
    frozen: false,
    encounters: [
      togc.bosses.NorthrendBeasts,
      togc.bosses.LordJaraxxus,
      togc.bosses.FactionChampions,
      togc.bosses.ValkyrTwins,
      togc.bosses.Anubarak,
    ],
  },
  {
    id: 1020,
    name: 'Icecrown Citadel',
    encounters: [
      icc.bosses.Marrowgar,
      icc.bosses.Deathwhisper,
      icc.bosses.Gunship,
      icc.bosses.Saurfang,
      icc.bosses.Festergut,
      icc.bosses.Rotface,
      icc.bosses.Putricide,
      icc.bosses.BloodCouncil,
      icc.bosses.BloodQueen,
      icc.bosses.Dreamwalker,
      icc.bosses.Sindragosa,
      icc.bosses.LichKing,
    ],
  },
  {
    id: 1021,
    name: 'Ruby Sanctum',
    encounters: [rs.bosses.Halion],
  },
];

export default ZONES;
