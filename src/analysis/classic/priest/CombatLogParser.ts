import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
import ManaTracker from 'parser/classic/modules/resources/ManaTracker';
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';

import lowRankSpells, { whitelist } from './lowRankSpells';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CanceledCasts from './modules/features/CanceledCasts';
import HealingEfficiencyDetails from './modules/features/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HealingEfficiencyTracker';
import Haste from './modules/Haste';
import CircleOfHealing from './modules/spells/CircleOfHealing';
import PrayerOfHealing from './modules/spells/PrayerOfHealing';
import PrayerOfMending from './modules/spells/PrayerOfMending';
import Shadowfiend from './modules/spells/Shadowfiend';
import Rapture from './modules/spells/Rapture';
import Penance from './modules/spells/Penance';
import PenanceNormalizer from './modules/normalizers/PenanceNormalizer';
import PainSuppression from 'analysis/classic/priest/modules/spells/PainSuppression';
import DivineAegis from 'analysis/classic/priest/modules/spells/DivineAegis';
import RenewedHope from 'analysis/classic/priest/modules/spells/RenewedHope';
import SoulWarding from 'analysis/classic/priest/modules/spells/SoulWarding';
import ReflectiveShield from 'analysis/classic/priest/modules/spells/ReflectiveShield';
import ShadowWordPain from 'analysis/classic/priest/modules/spells/ShadowWordPain';
import VampiricTouch from 'analysis/classic/priest/modules/spells/VampiricTouch';
import DevouringPlague from 'analysis/classic/priest/modules/spells/DevouringPlague';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Normalizers
    penanceNormalizer: PenanceNormalizer,

    abilities: Abilities,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    buffs: Buffs,
    haste: Haste,
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,
    alwaysBeCasting: AlwaysBeCasting,
    canceledCasts: CanceledCasts,
    // Mana Tab
    manaTracker: ManaTracker,
    hpmTracker: HealingEfficiencyTracker,
    hpmDetails: HealingEfficiencyDetails,

    // Specific Spells
    shadowfiend: Shadowfiend,
    prayerOfMending: PrayerOfMending,
    circleOfHealing: CircleOfHealing,
    prayerOfHealing: PrayerOfHealing,
    rapture: Rapture,
    penance: Penance,
    painSuppression: PainSuppression,
    divineAegis: DivineAegis,
    renewedHope: RenewedHope,
    soulWarding: SoulWarding,
    reflectiveShield: ReflectiveShield,
    shadowWordPain: ShadowWordPain,
    vampiricTouch: VampiricTouch,
    devouringPlague: DevouringPlague,

    checklist: Checklist,
    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells, whitelist),
  };
}

export default CombatLogParser;
