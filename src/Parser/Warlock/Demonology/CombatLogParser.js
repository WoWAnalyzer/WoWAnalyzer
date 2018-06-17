import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Felstorm from './Modules/Features/Felstorm';
import SpellUsable from './Modules/Features/SpellUsable';
import Checklist from './Modules/Features/Checklist';

import DoomUptime from './Modules/Features/DoomUptime';

import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';
import DemoPets from './Modules/WarlockCore/Pets';

import DemonicCalling from './Modules/Talents/DemonicCalling';
import GrimoireFelguard from './Modules/Talents/GrimoireFelguard';

import RecurrentRitual from './Modules/Items/Legendaries/RecurrentRitual';
import SindoreiSpite from '../Shared/Modules/Items/SindoreiSpite';
import KazzaksFinalCurse from './Modules/Items/Legendaries/KazzaksFinalCurse';
import TheMasterHarvester from '../Shared/Modules/Items/TheMasterHarvester';
import SoulOfTheNetherlord from './Modules/Items/Legendaries/SoulOfTheNetherlord';

import T20_2set from './Modules/Items/T20_2set';
import T20_4set from './Modules/Items/T20_4set';


class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    felstorm: Felstorm,
    spellUsable: SpellUsable,
    checklist: Checklist,

    // DoTs
    doomUptime: DoomUptime,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    demoPets: DemoPets,

    // Talents
    demonicCalling: DemonicCalling,
    grimoireFelguard: GrimoireFelguard,

    // Legendaries
    recurrentRitual: RecurrentRitual,
    sindoreiSpite: SindoreiSpite,
    kazzaksFinalCurse: KazzaksFinalCurse,
    masterHarvester: TheMasterHarvester,
    soulOfTheNetherlord: SoulOfTheNetherlord,

    // Items
    t20_2set: T20_2set,
    t20_4set: T20_4set,
  };
}

export default CombatLogParser;
