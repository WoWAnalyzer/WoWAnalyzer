import type { Raid } from 'game/raids/index';
import AlgetharAcademy from 'game/raids/mythicplusseasonfour/AlgetharAcademy';
import AzureVault from 'game/raids/mythicplusseasonfour/AzureVault';
import BrackenhideHollow from 'game/raids/mythicplusseasonfour/BrackenhideHollow';
import HallsOfInfusion from 'game/raids/mythicplusseasonfour/HallsOfInfusion';
import Neltharus from 'game/raids/mythicplusseasonfour/Neltharus';
import NokhudOffensive from 'game/raids/mythicplusseasonfour/NokhudOffensive';
import RubyLifePools from 'game/raids/mythicplusseasonfour/RubyLifePools';
import Uldaman from 'game/raids/mythicplusseasonfour/Uldaman';

export default {
  name: 'Mythic+ Season 4',
  background: undefined, // TODO: Set up
  bosses: {
    AlgetharAcademy,
    AzureVault,
    BrackenhideHollow,
    HallsOfInfusion,
    Neltharus,
    NokhudOffensive,
    RubyLifePools,
    Uldaman,
  },
} satisfies Raid;
