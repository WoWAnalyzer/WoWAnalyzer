import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/modules/Channeling';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import {
  RuneDetails,
  RuneOfTheFallenCrusader,
  RuneOfHysteria,
  Superstrain,
  SwarmingMist,
} from '@wowanalyzer/deathknight';

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
import ConvocationOfTheDead from './modules/spells/conduits/ConvocationOfTheDead';
import FesteringStrikeEfficiency from './modules/spells/FesteringStrikeEfficiency';
import ScourgeStrikeEfficiency from './modules/spells/ScourgeStrikeEfficiency';
import VirulentPlagueEfficiency from './modules/spells/VirulentPlagueEfficiency';
import ArmyOfTheDamned from './modules/talents/ArmyOfTheDamned';
import SoulReaper from './modules/talents/SoulReaper';

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

    // RunicPower
    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,

    //RuneTracker
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,

    // Runes
    runeOfTheFallenCrusader: RuneOfTheFallenCrusader,
    runeOfHysteria: RuneOfHysteria,

    // Legendaries
    superStrain: Superstrain,

    // Covenants
    swarmingMist: SwarmingMist,
    convocationOfTheDead: ConvocationOfTheDead,

    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
