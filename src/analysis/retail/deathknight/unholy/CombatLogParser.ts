import { RuneDetails, RuneOfTheFallenCrusader } from 'analysis/retail/deathknight/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';
import {
  SuddenDoomLinkNormalizer,
  SuddenDoomStackLinkNormalizer,
} from './normalizers/SuddenDoomLink';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import AlwaysBeCasting from './modules/core/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/core/CooldownThroughputTracker';
import UnholyRuneForgeChecker from './modules/features/RuneForgeChecker';
import RuneTracker from './modules/core/RuneTracker';
import SuddenDoom from './modules/talents/SuddenDoom';
import ForbiddenKnowledge from './modules/talents/ForbiddenKnowledge';
import RunicPowerDetails from './modules/core/RunicPowerDetails';
import RunicPowerTracker from './modules/core/RunicPowerTracker';
import PlagueEfficiency from './modules/features/PlagueEfficiency';
import SoulReaper from '../shared/talents/SoulReaper';
import CommanderOfTheDead from './modules/talents/CommanderOfTheDead';
import LesserGhoul from './modules/features/LesserGhoul';
import RunicPowerGraph from './modules/core/RunicPowerGraph';
import RuneGraph from './modules/core/RuneGraph';
import Guide from './modules/Guide';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilities: Abilities,
    buffs: Buffs,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    channeling: Channeling,
    suddenDoomLinkNormalizer: SuddenDoomLinkNormalizer,
    suddenDoomStackLinkNormalizer: SuddenDoomStackLinkNormalizer,

    // Features
    plagueEfficiency: PlagueEfficiency,
    lesserGhoul: LesserGhoul,
    unholyRuneForge: UnholyRuneForgeChecker,

    // Talents
    soulReaper: SoulReaper,
    commanderOfTheDead: CommanderOfTheDead,
    suddenDoom: SuddenDoom,
    forbiddenKnowledge: ForbiddenKnowledge,

    // RunicPower
    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,
    runicPowerGraph: RunicPowerGraph,

    //RuneTracker
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,
    runeGraph: RuneGraph,

    // Runes
    runeOfTheFallenCrusader: RuneOfTheFallenCrusader,

    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
