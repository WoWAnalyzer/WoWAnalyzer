import { RuneDetails, RuneOfTheFallenCrusader } from 'analysis/retail/deathknight/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import AlwaysBeCasting from './modules/core/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/core/CooldownThroughputTracker';
import UnholyRuneForgeChecker from './modules/features/RuneForgeChecker';
import RuneTracker from './modules/core/RuneTracker';
import SuddenDoom from './modules/talents/SuddenDoom';
import WoundTracker from './modules/features/WoundTracker';
import RunicPowerDetails from './modules/core/RunicPowerDetails';
import RunicPowerTracker from './modules/core/RunicPowerTracker';
import Apocalypse from './modules/talents/Apocalypse';
import FesteringStrikeEfficiency from './modules/spells/FesteringStrikeEfficiency';
import ScourgeStrikeEfficiency from './modules/spells/ScourgeStrikeEfficiency';
import VirulentPlagueEfficiency from './modules/spells/VirulentPlagueEfficiency';
import SoulReaper from '../shared/talents/SoulReaper';
import CommanderOfTheDead from './modules/talents/CommanderOfTheDead';
import SummonGargoyleBuffs from './modules/talents/SummonGargoyleBuffs';
import PlagueBringer from './modules/talents/PlagueBringer';
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

    // Features
    virulentPlagueEfficiency: VirulentPlagueEfficiency,
    woundTracker: WoundTracker,
    suddenDoom: SuddenDoom,
    unholyRuneForge: UnholyRuneForgeChecker,

    // Talents
    apocalypse: Apocalypse,
    soulReaper: SoulReaper,
    festeringStrikeEfficiency: FesteringStrikeEfficiency,
    scourgeStrikeEfficiency: ScourgeStrikeEfficiency,
    commanderOfTheDead: CommanderOfTheDead,
    summonGargoyleBuffs: SummonGargoyleBuffs,
    plagueBringer: PlagueBringer,

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
