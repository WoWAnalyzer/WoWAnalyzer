import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Enrage from './modules/buffdebuff/Enrage';
import Haste from './modules/core/Haste';
import RageDetails from './modules/core/RageDetails';
import RageGraph from './modules/core/RageGraph';
import RageTracker from './modules/core/RageTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';
import EnrageNormalizer from './modules/normalizers/Enrage';
import RecklessAbandonNormalizer from './modules/normalizers/RecklessAbandon';
import MissedRampage from './modules/spells/MissedRampage';
import Recklessness from './modules/spells/Recklessness';
import WhirlWind from './modules/spells/Whirlwind';
import AngerManagement from './modules/talents/AngerManagement';
import SuddenDeath from './modules/talents/SuddenDeath';
import Warpaint from './modules/talents/Warpaint';
import SpellReflection from '../shared/modules/talents/SpellReflection';
import WindfuryLinkNormalizer from '../shared/modules/normalizers/WindfuryLinkNormalizer';
import ElysianMight from '../shared/modules/talents/ElysianMight';
import ImpendingVictory from '../shared/modules/talents/ImpendingVictory';
import SpearOfBastion from '../shared/modules/talents/SpearOfBastion';
import HackAndSlash from './modules/talents/HackAndSlash';
import RageNormalizer from './modules/normalizers/RageNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizer
    windfuryNormalizer: WindfuryLinkNormalizer,
    rageNormalizer: RageNormalizer,
    recklessAbandonNormalizer: RecklessAbandonNormalizer,
    enrageNormalizer: EnrageNormalizer,

    // Core
    buffs: Buffs,
    haste: Haste,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,

    rageTracker: RageTracker,
    rageGraph: RageGraph,
    rageDetails: RageDetails,
    whirlWind: WhirlWind,

    enrageUptime: Enrage,

    missedRampage: MissedRampage,
    recklessness: Recklessness,

    //talents
    angerManagement: AngerManagement,
    suddenDeath: SuddenDeath,
    warpaint: Warpaint,
    spearofBastion: SpearOfBastion,
    spellReflection: SpellReflection,
    impendingVictory: ImpendingVictory,
    hackAndSlash: HackAndSlash,
    elysianMight: ElysianMight,
  };
}

export default CombatLogParser;
