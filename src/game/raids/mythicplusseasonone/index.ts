import AlgetharAcademy from 'game/raids/mythicplusseasonone/AlgetharAcademy';
import AzureVault from 'game/raids/mythicplusseasonone/AzureVault';
import CourtOfStars from 'game/raids/mythicplusseasonone/CourtOfStars';
import HallsOfValor from 'game/raids/mythicplusseasonone/HallsOfValor';
import NokhudOffensive from 'game/raids/mythicplusseasonone/NokhudOffensive';
import RubyLifePools from 'game/raids/mythicplusseasonone/RubyLifePools';
import ShadowmoonBurialGrounds from 'game/raids/mythicplusseasonone/ShadowmoonBurialGrounds';
import TempleOfTheJadeSerpent from 'game/raids/mythicplusseasonone/TempleOfTheJadeSerpent';
import type { Raid } from 'game/raids';

export default {
  name: 'Mythic+ Season 1',
  background: undefined,
  bosses: {
    AlgetharAcademy,
    AzureVault,
    CourtOfStars,
    HallsOfValor,
    NokhudOffensive,
    RubyLifePools,
    ShadowmoonBurialGrounds,
    TempleOfTheJadeSerpent,
  },
} satisfies Raid;
