import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import {
  ComboPointDetails,
  ComboPointTracker,
  EchoingReprimand,
  EnergyCapTracker,
  EnergyDetails,
  EnergyTracker,
  EssenceOfBloodfang,
  Flagellation,
  InvigoratingShadowdust,
  LashingScars,
  Obedience,
  Reverberation,
  Sepsis,
  StealthAbilityFollowingSepsis,
  SerratedBoneSpike,
  SpellEnergyCost,
  SpellUsable,
  WellPlacedSteel,
} from '@wowanalyzer/rogue';

import Abilities from './modules/Abilities';
import ComboPoints from './modules/core/ComboPoints';
import Energy from './modules/core/Energy';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import CrimsonTempestSnapshot from './modules/features/CrimsonTempestSnapshot';
import GarroteSnapshot from './modules/features/GarroteSnapshot';
import RuptureSnapshot from './modules/features/RuptureSnapshot';
import LethalPoisons from './modules/shadowlands/conduits/LethalPoisons';
import MaimMangle from './modules/shadowlands/conduits/MaimMangle';
import PoisonedKatar from './modules/shadowlands/conduits/PoisonedKatar';
import DashingScoundrel from './modules/shadowlands/legendaries/DashingScoundrel';
import Doomblade from './modules/shadowlands/legendaries/Doomblade';
import DuskwalkersPatch from './modules/shadowlands/legendaries/DuskwalkersPatch';
import Tier28_2pc from './modules/shadowlands/tier28/Tier28_2pc';
import EarlyDotRefresh from './modules/spells/EarlyDotRefresh';
import EnvenomUptime from './modules/spells/EnvenomUptime';
import GarroteUptime from './modules/spells/GarroteUptime';
import RuptureUptime from './modules/spells/RuptureUptime';
import Blindside from './modules/talents/Blindside';
import ElaboratePlanning from './modules/talents/ElaboratePlanning';
import MasterAssassin from './modules/talents/MasterAssassin';
import MasterPoisoner from './modules/talents/MasterPoisoner';
import Nightstalker from './modules/talents/Nightstalker';
import Subterfuge from './modules/talents/Subterfuge';
import GarroteNormalizer from './normalizers/GarroteNormalizer';
import GarroteOpenerNormalizer from './normalizers/GarroteOpenerNormalizer';

//Conduits

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    garroteNormalizer: GarroteNormalizer,
    garroteOpenerNormalizer: GarroteOpenerNormalizer,

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
    stealthAbilityFollowingSepsis: StealthAbilityFollowingSepsis,

    // Conduits
    wellPlacedSteel: WellPlacedSteel,
    lashingScars: LashingScars,
    lethalPoisons: LethalPoisons,
    maimMangle: MaimMangle,
    poisonedKatar: PoisonedKatar,
    reverberation: Reverberation,

    // Legendaries
    dashingScoundrel: DashingScoundrel,
    duskwalkersPatch: DuskwalkersPatch,
    essenceOfBloodfang: EssenceOfBloodfang,
    invigoratingShadowdust: InvigoratingShadowdust,
    doomblade: Doomblade,

    obedience: Obedience,

    tier28_2pc: Tier28_2pc,

    // Racials
    arcaneTorrent: [ArcaneTorrent, { gcd: 1000 }] as const,
  };
}

export default CombatLogParser;
