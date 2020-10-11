import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import VirulentPlagueUptime from './modules/features/VirulentPlagueUptime';
import FesteringStrike from './modules/features/FesteringStrike';
import Checklist from './modules/features/checklist/Module';
import ScourgeStrikeEfficiency from './modules/features/ScourgeStrikeEfficiency';
import Apocalypse from './modules/features/Apocalypse';
import VirulentPlagueEfficiency from './modules/features/VirulentPlagueEfficiency';


import RunicPowerDetails from './modules/runicpower/RunicPowerDetails';
import RunicPowerTracker from './modules/runicpower/RunicPowerTracker';

import RuneTracker from './modules/features/RuneTracker';
import RuneDetails from '../shared/RuneDetails';

//Azerite Traits
import BoneSpikeGraveyard from '../shared/spells/azeritetraits/BoneSpikeGraveyard';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    virulentPlagueUptime: VirulentPlagueUptime,
    festeringStrike: FesteringStrike,
    checklist: Checklist,
    scourgeStrikeEfficiency: ScourgeStrikeEfficiency,
  	apocalypse: Apocalypse,
	  virulentPlagueEfficiency: VirulentPlagueEfficiency,

    // RunicPower
    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,

    // talents

    //RuneTracker
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,

    //AzeriteTraits
    boneSpikeGraveyard: BoneSpikeGraveyard,
  };
}

export default CombatLogParser;
