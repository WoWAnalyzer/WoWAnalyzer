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

import WakenersLoyalty from './Modules/Items/Legendaries/WakenersLoyalty';
import RecurrentRitual from './Modules/Items/Legendaries/RecurrentRitual';
import SindoreiSpite from '../Shared/Modules/Items/SindoreiSpite';
import KazzaksFinalCurse from './Modules/Items/Legendaries/KazzaksFinalCurse';
import WilfredRing from './Modules/Items/Legendaries/WilfredRing';
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

    // Legendaries
    wakenersLoyalty: WakenersLoyalty,
    recurrentRitual: RecurrentRitual,
    sindoreiSpite: SindoreiSpite,
    kazzaksFinalCurse: KazzaksFinalCurse,
    wilfredRing: WilfredRing,
    masterHarvester: TheMasterHarvester,
    soulOfTheNetherlord: SoulOfTheNetherlord,

    // Items
    t20_2set: T20_2set,
    t20_4set: T20_4set,
  };
}

export default CombatLogParser;
