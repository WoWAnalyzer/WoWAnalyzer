// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from Dragonflight (showing older logs wouldn't make sense)
import mythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import mythicPlusSeasonTwo from 'game/raids/mythicplusseasontwo';
import mythicplusseasonthree from './raids/mythicplusseasonthree';
import vaultOfTheIncarnates from 'game/raids/vaultoftheincarnates';
import aberrus from 'game/raids/aberrus';
import amirdrassil from 'game/raids/amirdrassil';

// TODO: Refactor this (it's kind of strange and feels misplaced)

interface Encounter {
  id: number;
  name: string;
}

export interface Zone {
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
    name: 'Aberrus, the Shadowed Crucible',
    frozen: false,
    encounters: [
      aberrus.bosses.Kazzara,
      aberrus.bosses.AmalgamationChamber,
      aberrus.bosses.ForgottenExperiments,
      aberrus.bosses.AssaultOfTheZaqali,
      aberrus.bosses.Rashok,
      aberrus.bosses.Zskarn,
      aberrus.bosses.Magmorax,
      aberrus.bosses.EchoOfNeltharion,
      aberrus.bosses.Sarkareth,
    ],
    usePtrTooltips: false,
  },
  {
    id: 34,
    name: 'Mythic+ Season 2',
    frozen: false,
    encounters: [
      mythicPlusSeasonTwo.bosses.BrackenhideHollow,
      mythicPlusSeasonTwo.bosses.Freehold,
      mythicPlusSeasonTwo.bosses.HallsOfInfusion,
      mythicPlusSeasonTwo.bosses.NeltharionsLair,
      mythicPlusSeasonTwo.bosses.Neltharus,
      mythicPlusSeasonTwo.bosses.Uldaman,
      mythicPlusSeasonTwo.bosses.Underrot,
      mythicPlusSeasonTwo.bosses.VortexPinnacle,
    ],
    usePtrTooltips: false,
  },
  {
    id: 35,
    name: "Amirdrassil, the Dream's Hope",
    frozen: false,
    encounters: [
      amirdrassil.bosses.Gnarlroot,
      amirdrassil.bosses.Igira,
      amirdrassil.bosses.Volcoross,
      amirdrassil.bosses.CouncilOfDreams,
      amirdrassil.bosses.Larodar,
      amirdrassil.bosses.Nymue,
      amirdrassil.bosses.Smolderon,
      amirdrassil.bosses.Tindral,
      amirdrassil.bosses.Fyrakk,
    ],
    usePtrTooltips: true,
  },
  {
    id: 36,
    name: 'Mythic+ Season 3',
    frozen: false,
    encounters: [
      mythicplusseasonthree.bosses.AtalDazar,
      mythicplusseasonthree.bosses.BlackRookHold,
      mythicplusseasonthree.bosses.DarkheartThicket,
      mythicplusseasonthree.bosses.Everbloom,
      mythicplusseasonthree.bosses.GalakrondsFall,
      mythicplusseasonthree.bosses.MurozondsRise,
      mythicplusseasonthree.bosses.ThroneOfTheTides,
      mythicplusseasonthree.bosses.WaycrestManor,
    ],
    usePtrTooltips: true,
  },
];

export default ZONES;
