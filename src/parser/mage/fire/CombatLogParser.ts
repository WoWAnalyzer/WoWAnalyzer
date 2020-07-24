import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import FlamestrikeNormalizer from './normalizers/Flamestrike';
import Scorch from './normalizers/Scorch';
import PyroclasmBuff from './normalizers/PyroclasmBuff';

import Checklist from './modules/Checklist/Module';
import Buffs from './modules/features/Buffs';

import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Abilities from './modules/features/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import CancelledCasts from '../shared/modules/features/CancelledCasts';

import BlasterMaster from './modules/traits/BlasterMaster';

import MirrorImage from '../shared/modules/features/MirrorImage';
import ArcaneIntellect from '../shared/modules/features/ArcaneIntellect';
import RuneOfPower from '../shared/modules/features/RuneOfPower';
import Kindling from './modules/features/Kindling';
import HotStreak from './modules/features/HotStreak';
import HotStreakPreCasts from './modules/features/HotStreakPreCasts';
import HotStreakWastedCrits from './modules/features/HotStreakWastedCrits';
import CombustionFirestarter from './modules/features/CombustionFirestarter';
import CombustionCharges from './modules/features/CombustionCharges';
import CombustionSpellUsage from './modules/features/CombustionSpellUsage';
import HeatingUp from './modules/features/HeatingUp';
import Pyroclasm from './modules/features/Pyroclasm';
import SearingTouch from './modules/features/SearingTouch';
import Meteor from './modules/features/Meteor';
import MeteorRune from './modules/features/MeteorRune';
import MeteorCombustion from './modules/features/MeteorCombustion';

import HyperthreadWristwraps from './modules/items/HyperthreadWristwraps';

import LucidDreams from './modules/items/LucidDreams';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    FlameStrikeNormalizer: FlamestrikeNormalizer,
    scorch: Scorch,
    pyroclasmBuff: PyroclasmBuff,

    //Checklist
    checklist: Checklist,
    buffs: Buffs,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    cancelledCasts: CancelledCasts,
    hotStreak: HotStreak,
    hotStreakPreCasts: HotStreakPreCasts,
    hotStreakWastedCrits: HotStreakWastedCrits,
    combustionFirestarter: CombustionFirestarter,
    combustionCharges: CombustionCharges,
    combustionSpellUsage: CombustionSpellUsage,
    heatingUp: HeatingUp,
    pyroclasm: Pyroclasm,
    searingTouch: SearingTouch,

    //Traits
    blasterMaster: BlasterMaster,

    // Talents
    mirrorImage: MirrorImage,
    arcaneIntellect: ArcaneIntellect,
    runeOfPower: [RuneOfPower, { showStatistic: false, showSuggestion: false }] as const,
    kindling: Kindling,
    meteor: Meteor,
    meteorRune: MeteorRune,
    meteorCombustion: MeteorCombustion,

    // Items
    hyperthreadWristwraps: HyperthreadWristwraps,

    // Essences
    lucidDreams: LucidDreams,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
