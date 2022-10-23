import ActiveDruidForm from 'analysis/retail/druid/shared/core/ActiveDruidForm';
import { AdaptiveSwarmDamageDealer } from 'analysis/retail/druid/shared';
import MainCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/Abilities';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from 'analysis/retail/druid/balance/modules/core/Buffs';
import CancelledCasts from './modules/features/CancelledCasts';
import Checklist from './modules/checklist/Module';
import ConvokeSpiritsBalance from 'analysis/retail/druid/balance/modules/spells/ConvokeSpiritsBalance';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import DotUptimes from './modules/features/DotUptimes';
import EarlyDotRefreshes from './modules/features/EarlyDotRefreshes';
import EarlyDotRefreshesInstants from './modules/features/EarlyDotRefreshesInstants';
import FillerUsage from './modules/features/FillerUsage';
import MoonfireUptime from 'analysis/retail/druid/balance/modules/spells/MoonfireUptime';
import Starsurge from 'analysis/retail/druid/balance/modules/spells/Starsurge';
import SunfireUptime from 'analysis/retail/druid/balance/modules/spells/SunfireUptime';
import AstralPowerDetails from 'analysis/retail/druid/balance/modules/features/AstralPowerDetails';
import AstralPowerTracker from 'analysis/retail/druid/balance/modules/features/AstralPowerTracker';
import SoulOfTheForest from 'analysis/retail/druid/balance/modules/spells/SoulOfTheForest';
import Starlord from 'analysis/retail/druid/balance/modules/spells/Starlord';
import StellarFlareUptime from 'analysis/retail/druid/balance/modules/spells/StellarFlareUptime';
import TwinMoons from 'analysis/retail/druid/balance/modules/spells/TwinMoons';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    globalCooldown: GlobalCooldown,

    //Core
    activeDruidForm: ActiveDruidForm,

    //Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    channeling: Channeling,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    fillerUsage: FillerUsage,
    starsurge: Starsurge,
    earlyDotRefreshes: EarlyDotRefreshes,
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,
    buffs: Buffs,
    dotUptimes: DotUptimes,
    //Talents
    stellarFlareUptime: StellarFlareUptime,
    twinMoons: TwinMoons,
    starlord: Starlord,
    soulOfTheForest: SoulOfTheForest,
    //Covenants
    convokeSpiritsBalance: ConvokeSpiritsBalance,
    adaptiveSwarm: AdaptiveSwarmDamageDealer,

    //Resources
    astralPowerTracker: AstralPowerTracker,
    astralPowerDetails: AstralPowerDetails,
  };
}

export default CombatLogParser;
