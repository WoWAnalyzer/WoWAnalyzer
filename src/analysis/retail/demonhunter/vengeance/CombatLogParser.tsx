import {
  ElysianDecree,
  FelDefender,
  FodderToTheFlame,
  GrowingInferno,
  RepeatDecree,
  SinfulBrand,
  TheHunt,
} from 'analysis/retail/demonhunter/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import MitigationCheck from './modules/features/MitigationCheck';
import SoulFragmentsTracker from './modules/features/SoulFragmentsTracker';
import FuryDetails from './modules/fury/FuryDetails';
import FuryTracker from './modules/fury/FuryTracker';
import ShatteredRestoration from './modules/shadowlands/conduits/ShatteredRestoration';
import BlindFaith from './modules/shadowlands/legendaries/BlindFaith';
import FierySoul from './modules/shadowlands/legendaries/FierySoul';
import DemonSpikes from './modules/spells/DemonSpikes';
import ImmolationAura from './modules/spells/ImmolationAura';
import InfernalStrike from './modules/spells/InfernalStrike';
import ShearFracture from './modules/spells/ShearFracture';
import SigilOfFlame from './modules/spells/SigilOfFlame';
import SoulCleaveSoulsConsumed from './modules/spells/SoulCleaveSoulsConsumed';
import SoulFragmentsConsume from './modules/statistics/SoulFragmentsConsume';
import SoulsOvercap from './modules/statistics/SoulsOvercap';
import AgonizingFlames from './modules/talents/AgonizingFlames';
import BurningAlive from './modules/talents/BurningAlive';
import FeastOfSouls from './modules/talents/FeastOfSouls';
import FeedTheDemon from './modules/talents/FeedTheDemon';
import SoulBarrier from './modules/talents/SoulBarrier';
import SpiritBombFrailtyDebuff from './modules/talents/SpiritBombFrailtyDebuff';
import SpiritBombSoulsConsume from './modules/talents/SpiritBombSoulsConsume';
import VoidReaverDebuff from './modules/talents/VoidReaverDebuff';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    mitigationCheck: MitigationCheck,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    soulFragmentsTracker: SoulFragmentsTracker,
    checklist: Checklist,

    // Resource Tracker
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,

    // Talents
    SpiritBombFrailtyDebuff: SpiritBombFrailtyDebuff,
    soulBarrier: SoulBarrier,
    spiritBombSoulsConsume: SpiritBombSoulsConsume,
    feedTheDemon: FeedTheDemon,
    burningAlive: BurningAlive,
    feastOfSouls: FeastOfSouls,
    agonizingFlames: AgonizingFlames,
    shearFracture: ShearFracture,

    // Spell
    immolationAura: ImmolationAura,
    demonSpikes: DemonSpikes,
    sigilOfFlame: SigilOfFlame,
    soulCleaveSoulsConsumed: SoulCleaveSoulsConsumed,
    voidReaverDebuff: VoidReaverDebuff,
    infernalStrike: InfernalStrike,

    // Stats
    soulsOvercap: SoulsOvercap,
    soulFragmentsConsume: SoulFragmentsConsume,

    // Covenants
    sinfulBrand: SinfulBrand,
    theHunt: TheHunt,
    elysianDecree: ElysianDecree,
    fodderToTheFlame: FodderToTheFlame,

    // Conduits
    felDefender: FelDefender,
    shatteredRestoration: ShatteredRestoration,

    // Legendaries
    fierySoul: FierySoul,
    blindFaith: BlindFaith,
    growingInferno: GrowingInferno,
    repeatDecree: RepeatDecree,
  };
}

export default CombatLogParser;
