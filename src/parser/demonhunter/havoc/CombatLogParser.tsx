import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import EyeBeamNormalizer from './normalizers/EyeBeam';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
import Buffs from './modules/Buffs';

import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Abilities from './modules/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';

import Checklist from './modules/features/Checklist/Module';

// Spells
import DemonBite from './modules/spells/DemonBite';
import MetaBuffUptime from './modules/spells/MetaBuffUptime';
import BladeDance from './modules/spells/BladeDance'

// Talents
import Momentum from './modules/talents/Momentum';
import Felblade from './modules/talents/Felblade';
import DemonicAppetite from './modules/talents/DemonicAppetite';
import BlindFury from './modules/talents/BlindFury';
import DemonBlades from './modules/talents/DemonBlades';
import ImmolationAura from './modules/talents/ImmolationAura';
import TrailofRuin from './modules/talents/TrailofRuin';
import FelBarrage from './modules/talents/FelBarrage';
import Netherwalk from './modules/talents/Netherwalk';
import FelEruption from './modules/talents/FelEruption';
import MasterOfTheGlaives from './modules/talents/MasterOfTheGlaives';
import EssenceBreak from './modules/talents/EssenceBreak';
import CycleOfHatred from './modules/talents/CycleOfHatred';
import Demonic from './modules/talents/Demonic';
import GlaiveTempest from './modules/talents/GlaiveTempest';

//Resources
import FuryDetails from './modules/resourcetracker/FuryDetails';
import FuryTracker from './modules/resourcetracker/FuryTracker';

//Legendaries
import CollectiveAnguish from './modules/shadowlands/legendaries/CollectiveAnguish';
import ChaosTheory from './modules/shadowlands/legendaries/ChaosTheory';

//Covenants
import SinfulBrand from "../shared/modules/spells/covenants/SinfulBrand"
import TheHunt from '../shared/modules/spells/covenants/TheHunt';
import ElysianDecree from "../shared/modules/spells/covenants/ElysianDecree";

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    channeling: Channeling,
    buffs: Buffs,

    globalCooldown: GlobalCooldown,

    //Normalizer
    eyeBeamNormalizer: EyeBeamNormalizer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,

    // Spells
    demonBite: DemonBite,
    metaBuffUptime: MetaBuffUptime,
    bladeDance: BladeDance,

    //Talents
    felblade: Felblade,
    demonicAppetite: DemonicAppetite,
    blindFury: BlindFury,
    demonBlades: DemonBlades,
    immolationAura: ImmolationAura,
    trailofRuin: TrailofRuin,
    felBarrage: FelBarrage,
    momentum: Momentum,
    netherwalk: Netherwalk,
    felEruption: FelEruption,
    masterOfTheGlaives: MasterOfTheGlaives,
    essenceBreak: EssenceBreak,
    cycleOfHatred: CycleOfHatred,
    demonic: Demonic,
    glaiveTempest:GlaiveTempest,

    //Resources
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
    
    //Legendaries
    collectiveAnguish: CollectiveAnguish,
    chaosTheory: ChaosTheory,

    //Covenants
    sinfulBrand: SinfulBrand,
    theHunt: TheHunt,
    elysianDecree: ElysianDecree,
  };
}

export default CombatLogParser;
