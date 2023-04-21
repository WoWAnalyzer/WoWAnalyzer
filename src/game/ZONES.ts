// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from Dragonflight (showing older logs wouldn't make sense)
import mythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import vaultOfTheIncarnates from 'game/raids/vaultoftheincarnates';
import aberrus from 'game/raids/aberrus';

// TODO: Refactor this (it's kind of strange and feels misplaced)

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
    id: 31,
    name: 'Vault of the Incarnates',
    frozen: false,
    encounters: [
      vaultOfTheIncarnates.bosses.Eranog,
      vaultOfTheIncarnates.bosses.Terros,
      vaultOfTheIncarnates.bosses.PrimalCouncil,
      vaultOfTheIncarnates.bosses.Sennarth,
      vaultOfTheIncarnates.bosses.Dathea,
      vaultOfTheIncarnates.bosses.KurogGrimtotem,
      vaultOfTheIncarnates.bosses.BroodkeeperDiurna,
      vaultOfTheIncarnates.bosses.Raszageth,
    ],
  },
  {
    id: 32,
    name: 'Mythic+ Season 1',
    frozen: false,
    encounters: [
      mythicPlusSeasonOne.bosses.AlgetharAcademy,
      mythicPlusSeasonOne.bosses.AzureVault,
      mythicPlusSeasonOne.bosses.CourtOfStars,
      mythicPlusSeasonOne.bosses.HallsOfValor,
      mythicPlusSeasonOne.bosses.NokhudOffensive,
      mythicPlusSeasonOne.bosses.RubyLifePools,
      mythicPlusSeasonOne.bosses.ShadowmoonBurialGrounds,
      mythicPlusSeasonOne.bosses.TempleOfTheJadeSerpent,
    ],
  },
  {
    id: 33,
    name: 'Aberrus',
    frozen: false,
    encounters: [
      aberrus.bosses.Kazarra,
      aberrus.bosses.AmalgamationChamber,
      aberrus.bosses.ForgottenExperiments,
      aberrus.bosses.AssaultOfTheZaqali,
      aberrus.bosses.Rashok,
      aberrus.bosses.Zskarn,
      aberrus.bosses.Magmorax,
      aberrus.bosses.EchoOfNeltharion,
      aberrus.bosses.Sarkareth,
    ],
    usePtrTooltips: true, // TODO: Mark this as false once Aberrus goes live
  },
  {
    id: 34,
    name: 'Mythic+ Season 2',
    frozen: false,
    encounters: [],
    usePtrTooltips: true, // TODO: Mark this as false once Aberrus goes live
  },
];

export default ZONES;
