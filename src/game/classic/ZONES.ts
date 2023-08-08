import ulduar from 'game/raids/ulduar';
import togc from 'game/raids/trialofthegrandcrusader';

interface Encounter {
  id: number;
  name: string;
}

interface Zone {
  id: number;
  name: string;
  frozen?: boolean;
  encounters: Encounter[];
  usePtrTooltips?: boolean;
}

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
];

export default ZONES;
