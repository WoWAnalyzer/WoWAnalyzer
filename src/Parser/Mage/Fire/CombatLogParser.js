import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import FlamestrikeNormalizer from './Normalizers/Flamestrike';
import Scorch from './Normalizers/Scorch';
import PyroclasmBuff from './Normalizers/PyroclasmBuff';

import Checklist from './Modules/Checklist/Module';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import CancelledCasts from '../Shared/Modules/Features/CancelledCasts';

import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import ArcaneIntellect from '../Shared/Modules/Features/ArcaneIntellect';
import RuneOfPower from '../Shared/Modules/Features/RuneOfPower';
import Kindling from './Modules/Features/Kindling';
import HotStreak from './Modules/Features/HotStreak';
import CombustionFirestarter from './Modules/Features/CombustionFirestarter';
import CombustionCharges from './Modules/Features/CombustionCharges';
import CombustionSpellUsage from './Modules/Features/CombustionSpellUsage';
import CombustionPyroclasm from './Modules/Features/CombustionPyroclasm';
import HeatingUp from './Modules/Features/HeatingUp';
import Pyroclasm from './Modules/Features/Pyroclasm';
import SearingTouch from './Modules/Features/SearingTouch';

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
