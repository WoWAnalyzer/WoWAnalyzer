import CoreCombatLogParser from 'parser/core/CombatLogParser';

import WindfuryLinkNormalizer from 'parser/shared/normalizers/WindfuryLinkNormalizer';
import ChampionsMight from '../shared/modules/talents/ChampionsMight';
import ChampionsSpear from '../shared/modules/talents/ChampionsSpear';
import Abilities from './modules/Abilities';
import Enrage from './modules/buffdebuff/Enrage';
import Haste from './modules/core/Haste';
import RageDetails from './modules/core/RageDetails';
import RageGraph from './modules/core/RageGraph';
import RageTracker from './modules/core/RageTracker';
import DF3Fury2pc from './modules/dragonflight/DF3Fury2pc';
import DF3Fury4Pc from './modules/dragonflight/DF3Fury4pc';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';
import EnrageBeforeBloodthirst from './modules/normalizers/EnrageBeforeBloodthirst';
import EnrageRefreshNormalizer from './modules/normalizers/EnrageRefresh';
import GenerateRageEventsNormalizer from './modules/normalizers/RageNormalizers/GenerateRageEventsNormalizer';
import RageAttributeNormalizer from './modules/normalizers/RageNormalizers/RageAttributeNormalizer';
import RageGainNormalizer from './modules/normalizers/RageNormalizers/RageGainNormalizer';
import MissedRampage from './modules/spells/MissedRampage';
import Recklessness from './modules/spells/Recklessness';
import WhirlWind from './modules/spells/Whirlwind';
import AngerManagement from './modules/talents/AngerManagement';
import SuddenDeath from './modules/talents/SuddenDeath';
import Warpaint from './modules/talents/Warpaint';
import SpellReflection from '../shared/modules/talents/SpellReflection';
import ImpendingVictory from '../shared/modules/talents/ImpendingVictory';
import HackAndSlash from './modules/talents/HackAndSlash';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizer
    windfuryNormalizer: WindfuryLinkNormalizer,

    rageGainNormalizer: RageGainNormalizer,
    generateRageEventsNormalizer: GenerateRageEventsNormalizer,
    rageAttributeNormalizer: RageAttributeNormalizer,

    enrageRefreshNormalizer: EnrageRefreshNormalizer,
    enrageBeforeBloodthirst: EnrageBeforeBloodthirst,

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
    championsSpear: ChampionsSpear,
    spellReflection: SpellReflection,
    impendingVictory: ImpendingVictory,
    hackAndSlash: HackAndSlash,
    championsMight: ChampionsMight,

    df3Fury2pc: DF3Fury2pc,
    df3Fury4pc: DF3Fury4Pc,
  };
}

export default CombatLogParser;
