import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import VirulentPlagueUptime from './modules/features/VirulentPlagueUptime';
import FesteringStrikeEfficiency from './modules/features/FesteringStrikeEfficiency';
import Checklist from './modules/features/checklist/Module';
import ScourgeStrikeEfficiency from './modules/features/ScourgeStrikeEfficiency';
import Apocalypse from './modules/features/Apocalypse';
import VirulentPlagueEfficiency from './modules/features/VirulentPlagueEfficiency';
import WoundTracker from './modules/features/WoundTracker';

import RunicPowerDetails from './modules/runicpower/RunicPowerDetails';
import RunicPowerTracker from './modules/runicpower/RunicPowerTracker';

import RuneTracker from './modules/features/RuneTracker';
import RuneDetails from '../shared/RuneDetails';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    virulentPlagueUptime: VirulentPlagueUptime,
    festeringStrikeEfficiency: FesteringStrikeEfficiency,
    checklist: Checklist,
    scourgeStrikeEfficiency: ScourgeStrikeEfficiency,
  	apocalypse: Apocalypse,
    virulentPlagueEfficiency: VirulentPlagueEfficiency,
    woundTracker: WoundTracker,

    // RunicPower
    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,

    //RuneTracker
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,
  };
}

export default CombatLogParser;
