import { RuneDetails, RuneOfTheFallenCrusader } from 'analysis/retail/deathknight/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import UnholyRuneForgeChecker from './modules/features/RuneForgeChecker';
import RuneTracker from './modules/features/RuneTracker';
import SuddenDoom from './modules/features/SuddenDoom';
import WoundTracker from './modules/features/WoundTracker';
import RunicPowerDetails from './modules/runicpower/RunicPowerDetails';
import RunicPowerTracker from './modules/runicpower/RunicPowerTracker';
import Apocalypse from './modules/talents/Apocalypse';
import FesteringStrikeEfficiency from './modules/talents/FesteringStrikeEfficiency';
import ScourgeStrikeEfficiency from './modules/talents/ScourgeStrikeEfficiency';
import VirulentPlagueEfficiency from './modules/abilities/VirulentPlagueEfficiency';
import SoulReaper from '../shared/talents/SoulReaper';
import CommanderOfTheDead from './modules/talents/CommanderOfTheDead';
import SummonGargoyleBuffs from './modules/talents/SummonGargoyleBuffs';
import PlagueBringer from './modules/talents/PlagueBringer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilities: Abilities,
    buffs: Buffs,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    channeling: Channeling,

    // Features
    checklist: Checklist,
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

    //RuneTracker
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,

    // Runes
    runeOfTheFallenCrusader: RuneOfTheFallenCrusader,

    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
