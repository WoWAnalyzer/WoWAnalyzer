import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Felstorm from './modules/features/Felstorm';
import Checklist from './modules/features/Checklist/Module';


import SoulShardTracker from './modules/soulshards/SoulShardTracker';
import SoulShardDetails from './modules/soulshards/SoulShardDetails';

import DemoPets from './modules/pets/DemoPets';
import PetTimelineTab from './modules/pets/PetTimelineTab';
import PrepullPetNormalizer from './modules/pets/normalizers/PrepullPetNormalizer';

import PowerSiphonNormalizer from './modules/talents/normalizers/PowerSiphonNormalizer';

import TalentStatisticBox from './modules/talents';
import Dreadlash from './modules/talents/Dreadlash';
import DemonicStrength from './modules/talents/DemonicStrength';
import BilescourgeBombers from './modules/talents/BilescourgeBombers';
import DemonicCalling from './modules/talents/DemonicCalling';
import PowerSiphon from './modules/talents/PowerSiphon';
import Doom from './modules/talents/Doom';
import FromTheShadows from './modules/talents/FromTheShadows';
import SoulStrike from './modules/talents/SoulStrike';
import SummonVilefiend from './modules/talents/SummonVilefiend';
import SoulConduit from './modules/talents/SoulConduit';
import InnerDemons from './modules/talents/InnerDemons';
import GrimoireFelguard from './modules/talents/GrimoireFelguard';
import SacrificedSouls from './modules/talents/SacrificedSouls';
import DemonicConsumption from './modules/talents/DemonicConsumption';
import NetherPortal from './modules/talents/NetherPortal';

import ShadowsBiteForbiddenKnowledgeCore from './modules/azerite/ShadowsBiteForbiddenKnowledgeCore';
import ShadowsBite from './modules/azerite/ShadowsBite';
import ForbiddenKnowledge from './modules/azerite/ForbiddenKnowledge';
import SupremeCommander from './modules/azerite/SupremeCommander';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    felstorm: Felstorm,
    checklist: Checklist,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    demoPets: DemoPets,
    petTimelineTab: PetTimelineTab,
    prepullPetNormalizer: PrepullPetNormalizer,

    // Normalizers
    powerSiphonNormalizer: PowerSiphonNormalizer,

    // Talents
    talents: TalentStatisticBox,
    dreadlash: Dreadlash,
    demonicStrength: DemonicStrength,
    bilescourgeBombers: BilescourgeBombers,
    demonicCalling: DemonicCalling,
    soulConduit: SoulConduit,
    innerDemons: InnerDemons,
    fromTheShadows: FromTheShadows,
    soulStrike: SoulStrike,
    summonVilefiend: SummonVilefiend,
    powerSiphon: PowerSiphon,
    doom: Doom,
    grimoireFelguard: GrimoireFelguard,
    sacrificedSouls: SacrificedSouls,
    demonicConsumption: DemonicConsumption,
    netherPortal: NetherPortal,

    shadowsBiteForbiddenKnowledgeCore: ShadowsBiteForbiddenKnowledgeCore,
    shadowsBite: ShadowsBite,
    forbiddenKnowledge: ForbiddenKnowledge,
    supremeCommander: SupremeCommander,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }],
  };
}

export default CombatLogParser;
