import MainCombatLogParser from 'parser/core/CombatLogParser';

import { AdaptiveSwarmDamageDealer, ConvokeSpirits } from '@wowanalyzer/druid';
import ActiveDruidForm from '@wowanalyzer/druid/src/core/ActiveDruidForm';

import Abilities from './modules/Abilities';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import BalanceOfAllThingsOpener from './modules/features/BalanceOfAllThingsOpener';
import Buffs from './modules/features/Buffs';
import CancelledCasts from './modules/features/CancelledCasts';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import EarlyDotRefreshes from './modules/features/EarlyDotRefreshes';
import EarlyDotRefreshesInstants from './modules/features/EarlyDotRefreshesInstants';
import FillerUsage from './modules/features/FillerUsage';
import MoonfireUptime from './modules/features/MoonfireUptime';
import Starsurge from './modules/features/Starsurge';
import SunfireUptime from './modules/features/SunfireUptime';
import AstralPowerDetails from './modules/resourcetracker/AstralPowerDetails';
import AstralPowerTracker from './modules/resourcetracker/AstralPowerTracker';
import SoulOfTheForest from './modules/talents/SoulOfTheForest';
import Starlord from './modules/talents/Starlord';
import StellarDrift from './modules/talents/StellarDrift';
import StellarFlareUptime from './modules/talents/StellarFlareUptime';
import TwinMoons from './modules/talents/TwinMoons';

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
    balanceOfAllThingsOpener: BalanceOfAllThingsOpener,
    buffs: Buffs,
    //Talents
    stellarFlareUptime: StellarFlareUptime,
    twinMoons: TwinMoons,
    stellarDrift: StellarDrift,
    starlord: Starlord,
    soulOfTheForest: SoulOfTheForest,
    //Covenants
    convokeSpirits: ConvokeSpirits,
    adaptiveSwarm: AdaptiveSwarmDamageDealer,

    //Resources
    astralPowerTracker: AstralPowerTracker,
    astralPowerDetails: AstralPowerDetails,
  };
}

export default CombatLogParser;
