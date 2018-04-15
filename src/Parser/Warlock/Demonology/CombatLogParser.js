import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import DoomguardInfernal from './Modules/Features/DoomguardInfernal';
import Felstorm from './Modules/Features/Felstorm';

import Doom from './Modules/Features/DoomUptime';

import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';
import DemoPets from './Modules/WarlockCore/Pets';

import ShadowyInspiration from './Modules/Talents/ShadowyInspiration';
import Shadowflame from './Modules/Talents/Shadowflame';
import DemonicCalling from './Modules/Talents/DemonicCalling';
import ImpendingDoom from './Modules/Talents/ImpendingDoom';
import ImprovedDreadstalkers from './Modules/Talents/ImprovedDreadstalkers';
import Implosion from './Modules/Talents/Implosion';
import HandOfDoom from './Modules/Talents/HandOfDoom';
import SoulHarvest from '../Shared/Modules/Talents/SoulHarvest';
import SoulHarvestTalent from '../Shared/Modules/Talents/SoulHarvestTalent';
import GrimoireOfService from './Modules/Talents/GrimoireOfService';
import GrimoireOfSynergy from './Modules/Talents/GrimoireOfSynergy';
import SummonDarkglare from './Modules/Talents/SummonDarkglare';
import Demonbolt from './Modules/Talents/Demonbolt';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    doomguardInfernal: DoomguardInfernal,
    felstorm: Felstorm,

    // DoTs
    doom: Doom,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    demoPets: DemoPets,

    // Talents
    shadowyInspiration: ShadowyInspiration,
    shadowflame: Shadowflame,
    demonicCalling: DemonicCalling,
    impendingDoom: ImpendingDoom,
    improvedDreadstalkers: ImprovedDreadstalkers,
    implosion: Implosion,
    handOfDoom: HandOfDoom,
    soulHarvest: SoulHarvest,
    soulHarvestTalent: SoulHarvestTalent,
    grimoireOfService: GrimoireOfService,
    grimoireOfSynergy: GrimoireOfSynergy,
    summonDarkglare: SummonDarkglare,
    demonbolt: Demonbolt,
  };
}

export default CombatLogParser;
