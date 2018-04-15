import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import VirulentPlagueUptime from './Modules/Features/VirulentPlagueUptime';
import FesteringStrike from './Modules/Features/FesteringStrike';
import Checklist from './Modules/Features/Checklist';
import ScourgeStrikeEfficiency from './Modules/Features/ScourgeStrikeEfficiency';
import ClawingShadowsEfficiency from './Modules/Features/ClawingShadowsEfficiency';
import RpPoolingDA from './Modules/Features/RpPoolingDA';
import Apocalypse from './Modules/Features/Apocalypse';
import DarkTransformationAndWounds from './Modules/Features/DarkTransformationAndWounds';
import VirulentPlagueEfficiency from './Modules/Features/VirulentPlagueEfficiency';

import RunicPowerDetails from './Modules/RunicPower/RunicPowerDetails';
import RunicPowerTracker from './Modules/RunicPower/RunicPowerTracker';

import DarkArbiter from './Modules/Talents/DarkArbiter';
import UnholyFrenzy from './Modules/Talents/UnholyFrenzy';

import RuneTracker from './Modules/Features/RuneTracker';
import RuneDetails from '../Shared/RuneDetails';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    virulentPlagueUptime: VirulentPlagueUptime,
    festeringStrike: FesteringStrike,
    checklist: Checklist,
    scourgeStrikeEfficiency: ScourgeStrikeEfficiency,
    clawingShadowsEfficiency: ClawingShadowsEfficiency,
    rpPoolingDa: RpPoolingDA,
    apocalypse: Apocalypse,
    darkTransformationAndWounds: DarkTransformationAndWounds,
    virulentPlagueEfficiency: VirulentPlagueEfficiency,

    // RunicPower
    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,

    // talents
    darkArbiter: DarkArbiter,
    unholyFrenzy: UnholyFrenzy,

    //RuneTracker
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,
  };
}

export default CombatLogParser;
	
