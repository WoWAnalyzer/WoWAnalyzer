import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';

import FlamestrikeNormalizer from './normalizers/Flamestrike';
import Scorch from './normalizers/Scorch';
import PyroclasmBuff from './normalizers/PyroclasmBuff';

import Checklist from './modules/Checklist/Module';

import AlwaysBeCasting from './modules/Features/AlwaysBeCasting';
import Abilities from './modules/Features/Abilities';
import CooldownThroughputTracker from './modules/Features/CooldownThroughputTracker';
import CancelledCasts from '../shared/modules/features/CancelledCasts';

import MirrorImage from '../shared/modules/features/MirrorImage';
import ArcaneIntellect from '../shared/modules/features/ArcaneIntellect';
import RuneOfPower from '../shared/modules/features/RuneOfPower';
import Kindling from './modules/Features/Kindling';
import HotStreak from './modules/Features/HotStreak';
import CombustionFirestarter from './modules/Features/CombustionFirestarter';
import CombustionCharges from './modules/Features/CombustionCharges';
import CombustionSpellUsage from './modules/Features/CombustionSpellUsage';
import CombustionPyroclasm from './modules/Features/CombustionPyroclasm';
import HeatingUp from './modules/Features/HeatingUp';
import Pyroclasm from './modules/Features/Pyroclasm';
import SearingTouch from './modules/Features/SearingTouch';

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
