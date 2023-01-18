import {
  RuneDetails,
  RuneOfTheFallenCrusader,
  RuneOfHysteria,
} from 'analysis/retail/deathknight/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

import SpellUsable from './modules/core/SpellUsable';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import UnholyRuneForgeChecker from './modules/features/RuneForgeChecker';
import RuneTracker from './modules/features/RuneTracker';
import SuddenDoom from './modules/features/SuddenDoom';
import WoundTracker from './modules/features/WoundTracker';
import RunicPowerDetails from './modules/runicpower/RunicPowerDetails';
import RunicPowerTracker from './modules/runicpower/RunicPowerTracker';
import Apocalypse from './modules/spells/Apocalypse';
import FesteringStrikeEfficiency from './modules/spells/FesteringStrikeEfficiency';
import ScourgeStrikeEfficiency from './modules/spells/ScourgeStrikeEfficiency';
import VirulentPlagueEfficiency from './modules/spells/VirulentPlagueEfficiency';
import ArmyOfTheDamned from './modules/talents/ArmyOfTheDamned';
import SoulReaper from './modules/talents/SoulReaper';
import CommanderOfTheDead from './modules/talents/CommanderOfTheDead';

// Covenants

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    channeling: Channeling,

    // Features
    festeringStrikeEfficiency: FesteringStrikeEfficiency,
    checklist: Checklist,
    scourgeStrikeEfficiency: ScourgeStrikeEfficiency,
    apocalypse: Apocalypse,
    virulentPlagueEfficiency: VirulentPlagueEfficiency,
    woundTracker: WoundTracker,
    spellUsable: SpellUsable,
    suddenDoom: SuddenDoom,
    unholyRuneForge: UnholyRuneForgeChecker,

    // Talents
    soulReaper: SoulReaper,
    armyOfTheDamned: ArmyOfTheDamned,
    commanderOfTheDead: CommanderOfTheDead,

    // RunicPower
    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,

    //RuneTracker
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,

    // Runes
    runeOfTheFallenCrusader: RuneOfTheFallenCrusader,
    runeOfHysteria: RuneOfHysteria,

    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
