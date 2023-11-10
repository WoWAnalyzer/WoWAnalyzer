import ActiveDruidForm from 'analysis/retail/druid/shared/core/ActiveDruidForm';
import MainCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from 'analysis/retail/druid/balance/modules/core/Buffs';
import CancelledCasts from './modules/features/CancelledCasts';
import ConvokeSpiritsBalance from 'analysis/retail/druid/balance/modules/spells/ConvokeSpiritsBalance';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import DotUptimes from './modules/features/DotUptimes';
import EarlyDotRefreshes from './modules/features/EarlyDotRefreshes';
import EarlyDotRefreshesInstants from './modules/features/EarlyDotRefreshesInstants';
import FillerUsage from './modules/features/FillerUsage';
import MoonfireUptime from 'analysis/retail/druid/balance/modules/spells/MoonfireUptime';
import SunfireUptime from 'analysis/retail/druid/balance/modules/spells/SunfireUptime';
import SoulOfTheForest from 'analysis/retail/druid/balance/modules/spells/SoulOfTheForest';
import Starlord from 'analysis/retail/druid/balance/modules/spells/Starlord';
import StellarFlareUptime from 'analysis/retail/druid/balance/modules/spells/StellarFlareUptime';
import TwinMoons from 'analysis/retail/druid/balance/modules/spells/TwinMoons';
import AstralPowerTracker from 'analysis/retail/druid/balance/modules/core/astralpower/AstralPowerTracker';
import AstralPowerDetails from 'analysis/retail/druid/balance/modules/core/astralpower/AstralPowerDetails';
import Guide from 'analysis/retail/druid/balance/Guide';
import AstralPowerGraph from 'analysis/retail/druid/balance/modules/core/astralpower/AstralPowerGraph';
import WaningTwilight from './modules/spells/WaningTwilight';
import GatheringStarstuff from 'analysis/retail/druid/balance/modules/spells/GatheringStarstuff';
import TouchTheCosmos from './modules/spells/TouchTheCosmos';
import Starweaver from './modules/spells/Starweaver';
import FriendOfTheFae from './modules/spells/FriendOfTheFae';
import SunderedFirmament from './modules/spells/SunderedFirmament';
import Eclipse from 'analysis/retail/druid/balance/modules/spells/Eclipse';
import SpenderUsage from 'analysis/retail/druid/balance/modules/features/SpenderUsage';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    //Core
    activeDruidForm: ActiveDruidForm,

    //Resources
    astralPowerTracker: AstralPowerTracker,
    astralPowerDetails: AstralPowerDetails,
    astralPowerGraph: AstralPowerGraph,

    //Features
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    channeling: Channeling,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    fillerUsage: FillerUsage,
    spenderUsage: SpenderUsage,
    earlyDotRefreshes: EarlyDotRefreshes,
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,
    buffs: Buffs,
    dotUptimes: DotUptimes,
    eclipse: Eclipse,
    //Talents
    stellarFlareUptime: StellarFlareUptime,
    twinMoons: TwinMoons,
    starlord: Starlord,
    soulOfTheForest: SoulOfTheForest,
    waningTwilight: WaningTwilight,
    convokeSpiritsBalance: ConvokeSpiritsBalance,
    starweaver: Starweaver,
    firendOfTheFae: FriendOfTheFae,
    sunderedFirmament: SunderedFirmament,
    //Tier set
    gatheringStarstuff: GatheringStarstuff,
    touchTheCosmos: TouchTheCosmos,
  };

  static guide = Guide;
}

export default CombatLogParser;
