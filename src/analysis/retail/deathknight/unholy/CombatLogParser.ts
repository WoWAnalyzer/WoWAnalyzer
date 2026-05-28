import { RuneDetails, RuneOfTheFallenCrusader } from 'analysis/retail/deathknight/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';
import { SuddenDoomLinkNormalizer } from './normalizers/SuddenDoomLink';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import AlwaysBeCasting from './modules/core/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/core/CooldownThroughputTracker';
import SpellUsable from './modules/core/SpellUsable';
import UnholyRuneForgeChecker from './modules/features/RuneForgeChecker';
import RuneTracker from './modules/core/RuneTracker';
import SuddenDoom from './modules/talents/SuddenDoom';
import ForbiddenKnowledge from './modules/talents/ForbiddenKnowledge';
import Putrefy from './modules/talents/Putrefy';
import ScourgeStrike from './modules/talents/ScourgeStrike';
import FesteringScythe from './modules/talents/FesteringScythe';
import RunicPowerDetails from './modules/core/RunicPowerDetails';
import RunicPowerTracker from './modules/core/RunicPowerTracker';
import PlagueEfficiency from './modules/features/PlagueEfficiency';
import SoulReaper from './modules/talents/SoulReaper';
import CommanderOfTheDead from './modules/talents/CommanderOfTheDead';
import UnholyAura from './modules/talents/UnholyAura';
import LesserGhoul from './modules/features/LesserGhoul';
import RunicPowerGraph from './modules/core/RunicPowerGraph';
import RuneGraph from './modules/core/RuneGraph';
import Guide from './modules/Guide';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilities: Abilities,
    buffs: Buffs,
    spellUsable: SpellUsable,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    channeling: Channeling,
    suddenDoomLinkNormalizer: SuddenDoomLinkNormalizer,
    scourgeStrike: ScourgeStrike,

    // Features
    plagueEfficiency: PlagueEfficiency,
    lesserGhoul: LesserGhoul,
    unholyRuneForge: UnholyRuneForgeChecker,

    // Talents
    soulReaper: SoulReaper,
    commanderOfTheDead: CommanderOfTheDead,
    suddenDoom: SuddenDoom,
    forbiddenKnowledge: ForbiddenKnowledge,
    unholyAura: UnholyAura,
    putrefy: Putrefy,
    festeringScythe: FesteringScythe,
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
