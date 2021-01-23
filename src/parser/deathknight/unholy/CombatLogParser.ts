import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/modules/Channeling';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FesteringStrikeEfficiency from './modules/spells/FesteringStrikeEfficiency';
import Checklist from './modules/features/checklist/Module';
import ScourgeStrikeEfficiency from './modules/spells/ScourgeStrikeEfficiency';
import Apocalypse from './modules/spells/Apocalypse';
import VirulentPlagueEfficiency from './modules/spells/VirulentPlagueEfficiency';
import WoundTracker from './modules/features/WoundTracker';
import SpellUsable from './modules/core/SpellUsable'

import SoulReaper from './modules/talents/SoulReaper';
import ArmyOfTheDamned from './modules/talents/ArmyOfTheDamned';

import RunicPowerDetails from './modules/runicpower/RunicPowerDetails';
import RunicPowerTracker from './modules/runicpower/RunicPowerTracker';

import RuneTracker from './modules/features/RuneTracker';
import RuneDetails from '../shared/RuneDetails';

// Runes
import RuneOfTheFallenCrusader from '../shared/runeforges/RuneOfTheFallenCrusader';
import RuneOfHysteria from '../shared/runeforges/RuneOfHysteria';

// Legendaries
import Superstrain from '../shared/items/Superstrain';

// Covenants
import SwarmingMist from '../shared/covenants/SwarmingMist';
import ConvocationOfTheDead from './modules/spells/conduits/ConvocationOfTheDead';


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
