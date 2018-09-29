import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';

import FlamestrikeNormalizer from './normalizers/Flamestrike';
import Scorch from './normalizers/Scorch';
import PyroclasmBuff from './normalizers/PyroclasmBuff';

import Checklist from './modules/Checklist/Module';

import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Abilities from './modules/features/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import CancelledCasts from '../shared/modules/features/CancelledCasts';

import MirrorImage from '../shared/modules/features/MirrorImage';
import ArcaneIntellect from '../shared/modules/features/ArcaneIntellect';
import RuneOfPower from '../shared/modules/features/RuneOfPower';
import Kindling from './modules/features/Kindling';
import HotStreak from './modules/features/HotStreak';
import CombustionFirestarter from './modules/features/CombustionFirestarter';
import CombustionCharges from './modules/features/CombustionCharges';
import CombustionSpellUsage from './modules/features/CombustionSpellUsage';
import CombustionPyroclasm from './modules/features/CombustionPyroclasm';
import HeatingUp from './modules/features/HeatingUp';
import Pyroclasm from './modules/features/Pyroclasm';
import SearingTouch from './modules/features/SearingTouch';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    FlameStrikeNormalizer: FlamestrikeNormalizer,
    scorch: Scorch,
    pyroclasmBuff: PyroclasmBuff,

    //Checklist
    checklist: Checklist,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    cancelledCasts: CancelledCasts,
    hotStreak: HotStreak,
    combustionFirestarter: CombustionFirestarter,
    combustionCharges: CombustionCharges,
    combustionSpellUsage: CombustionSpellUsage,
    combustionPyroclasm: CombustionPyroclasm,
    heatingUp: HeatingUp,
    pyroclasm: Pyroclasm,
    searingTouch: SearingTouch,

    // Talents
    mirrorImage: MirrorImage,
    arcaneIntellect: ArcaneIntellect,
    runeOfPower: [RuneOfPower, { showStatistic: false, showSuggestion: false }],
    kindling: Kindling,

  };
}

export default CombatLogParser;
