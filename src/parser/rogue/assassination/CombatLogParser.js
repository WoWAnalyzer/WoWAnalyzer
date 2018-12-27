import CoreCombatLogParser from 'parser/core/CombatLogParser';

import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/features/Checklist/Module';
import SpellUsable from '../shared/SpellUsable';

//Normalizers
import GarroteNormalizer from './normalizers/GarroteNormalizer';
import GarroteOpenerNormalizer from './normalizers/GarroteOpenerNormalizer'; 

import ComboPointDetails from '../shared/resources/ComboPointDetails';
import ComboPointTracker from '../shared/resources/ComboPointTracker';
import ComboPoints from './modules/core/ComboPoints';
import EnergyDetails from '../shared/resources/EnergyDetails';
import EnergyTracker from '../shared/resources/EnergyTracker';
import EnergyCapTracker from '../shared/resources/EnergyCapTracker';
import Energy from './modules/core/Energy';
import EnemyHpTracker from '../shared/EnemyHpTracker';
import SpellEnergyCost from '../shared/resources/SpellEnergyCost';

//Spells
import EnvenomUptime from './modules/spells/EnvenomUptime';
import GarroteUptime from './modules/spells/GarroteUptime';
import RuptureUptime from './modules/spells/RuptureUptime';

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

// Traits

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    garroteNormalizer: GarroteNormalizer,
    garroteOpenerNormalizer: GarroteOpenerNormalizer,

    //Trackers
    enemyHpTracker: EnemyHpTracker,

    //Feature
    damageDone: [DamageDone, { showStatistic: true }],
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

    // Traits

    // Racials
    arcaneTorrent: [ArcaneTorrent, {
      gcd: 1000,
    }],
  };
}

export default CombatLogParser;
