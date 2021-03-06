import {
  ComboPointDetails,
  ComboPointTracker,
  EchoingReprimand,
  EnemyHpTracker,
  EnergyCapTracker,
  EnergyDetails,
  EnergyTracker,
  EssenceOfBloodfang,
  Flagellation,
  InvigoratingShadowdust,
  Sepsis,
  SerratedBoneSpike,
  SpellEnergyCost,
  SpellUsable,
} from '@wowanalyzer/rogue';

import CoreCombatLogParser from 'parser/core/CombatLogParser';

import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/features/Checklist/Module';

//Normalizers
import GarroteNormalizer from './normalizers/GarroteNormalizer';
import GarroteOpenerNormalizer from './normalizers/GarroteOpenerNormalizer';

import ComboPoints from './modules/core/ComboPoints';
import Energy from './modules/core/Energy';

//Spells
import EnvenomUptime from './modules/spells/EnvenomUptime';
import GarroteUptime from './modules/spells/GarroteUptime';
import RuptureUptime from './modules/spells/RuptureUptime';
import EarlyDotRefresh from './modules/spells/EarlyDotRefresh';

import GarroteSnapshot from './modules/features/GarroteSnapshot';
import RuptureSnapshot from './modules/features/RuptureSnapshot';
import CrimsonTempestSnapshot from './modules/features/CrimsonTempestSnapshot';

//Talents
import Blindside from './modules/talents/Blindside';
import ElaboratePlanning from './modules/talents/ElaboratePlanning';
import MasterPoisoner from './modules/talents/MasterPoisoner';
import Nightstalker from './modules/talents/Nightstalker';
import Subterfuge from './modules/talents/Subterfuge';
import MasterAssassin from './modules/talents/MasterAssassin';

// Covenants

// Legendaries
import DashingScoundrel from './modules/spells/shadowlands/legendaries/DashingScoundrel';
import DuskwalkersPatch from './modules/spells/shadowlands/legendaries/DuskwalkersPatch';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    garroteNormalizer: GarroteNormalizer,
    garroteOpenerNormalizer: GarroteOpenerNormalizer,

    //Trackers
    enemyHpTracker: EnemyHpTracker,

    //Feature
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    spellUsable: SpellUsable,

    //Resource
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    comboPoints: ComboPoints,
    energyTracker: EnergyTracker,
    energyCapTracker: EnergyCapTracker,
    energyDetails: EnergyDetails,
    energy: Energy,
    spellEnergyCost: SpellEnergyCost,

    //Core
    envenomUptime: EnvenomUptime,
    garroteUptime: GarroteUptime,
    ruptureUptime: RuptureUptime,
    earlyDotRefresh: EarlyDotRefresh,

    garroteSnapshot: GarroteSnapshot,
    ruptureSnapshot: RuptureSnapshot,
    crimsonTempestSnapshot: CrimsonTempestSnapshot,

    //Casts

    //Talents
    blindside: Blindside,
    elaboratePlanning: ElaboratePlanning,
    masterPoisoner: MasterPoisoner,
    nightstalker: Nightstalker,
    subterfuge: Subterfuge,
    masterAssassin: MasterAssassin,

    // Covenants
    serratedBoneSpike: SerratedBoneSpike,
    echoingReprimand: EchoingReprimand,
    flagellation: Flagellation,
    sepsis: Sepsis,

    // Legendaries
    dashingScoundrel: DashingScoundrel,
    duskwalkersPatch: DuskwalkersPatch,
    essenceOfBloodfang: EssenceOfBloodfang,
    invigoratingShadowdust: InvigoratingShadowdust,

    // Racials
    arcaneTorrent: [ArcaneTorrent, { gcd: 1000 }] as const,
  };
}

export default CombatLogParser;
