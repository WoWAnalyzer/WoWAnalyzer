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
import Starweaver from './modules/spells/Starweaver';
import SunderedFirmament from './modules/spells/SunderedFirmament';
import Eclipse from 'analysis/retail/druid/balance/modules/spells/Eclipse';
import SpenderUsage from 'analysis/retail/druid/balance/modules/features/SpenderUsage';
import NewMoon from 'analysis/retail/druid/balance/modules/spells/NewMoon';
import WildMushroom from 'analysis/retail/druid/balance/modules/spells/WildMushroom';
import CelestialAlignment from 'analysis/retail/druid/balance/modules/spells/CelestialAlignment';
import ControlOfTheDream from 'analysis/retail/druid/shared/spells/ControlOfTheDream';
import CastLinkNormalizer from 'analysis/retail/druid/balance/normalizers/CastLinkNormalizer';
import Lunation from 'analysis/retail/druid/shared/spells/Lunation';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    //Normalizers
    castLinkNormalizer: CastLinkNormalizer,

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
    sunderedFirmament: SunderedFirmament,
    newMoon: NewMoon,
    wildMushroom: WildMushroom,
    celestialAlignment: CelestialAlignment,
    //Hero Talents
    lunation: Lunation,
    controlOfTheDream: ControlOfTheDream,
  };

  static guide = Guide;
}

export default CombatLogParser;
