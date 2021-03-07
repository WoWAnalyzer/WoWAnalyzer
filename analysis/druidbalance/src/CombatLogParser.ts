import MainCombatLogParser from 'parser/core/CombatLogParser';

import { ConvokeSpirits } from '@wowanalyzer/druid';
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
import MoonfireUptime from './modules/features/MoonfireUptime';
import SunfireUptime from './modules/features/SunfireUptime';
import UnempoweredStarfire from './modules/features/UnempoweredStarfire';
import UnempoweredWrath from './modules/features/UnempoweredWrath';
import AstralPowerDetails from './modules/resourcetracker/AstralPowerDetails';
import AstralPowerTracker from './modules/resourcetracker/AstralPowerTracker';
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
    unempoweredStarfire: UnempoweredStarfire,
    unempoweredWrath: UnempoweredWrath,
    earlyDotRefreshes: EarlyDotRefreshes,
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,
    balanceOfAllThingsOpener: BalanceOfAllThingsOpener,
    buffs: Buffs,
    //Talents
    stellarFlareUptime: StellarFlareUptime,
    twinMoons: TwinMoons,
    stellarDrift: StellarDrift,
    starlord: Starlord,

    //Covenants
    convokeSpirits: ConvokeSpirits,

    //Resources
    astralPowerTracker: AstralPowerTracker,
    astralPowerDetails: AstralPowerDetails,
  };
}

export default CombatLogParser;
