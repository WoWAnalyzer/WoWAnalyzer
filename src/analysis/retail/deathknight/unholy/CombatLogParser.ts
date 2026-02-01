import { RuneDetails, RuneOfTheFallenCrusader } from 'analysis/retail/deathknight/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import AlwaysBeCasting from './modules/core/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/core/CooldownThroughputTracker';
import RuneTracker from './modules/core/RuneTracker';
import RuneGraph from './modules/core/RuneGraph';
import RunicPowerTracker from './modules/core/RunicPowerTracker';
import RunicPowerDetails from './modules/core/RunicPowerDetails';
import RunicPowerGraph from './modules/core/RunicPowerGraph';
import UnholyRuneForgeChecker from './modules/features/RuneForgeChecker';
import HeroTalents from './modules/features/HeroTalents';
import LesserGhoulTracker from './modules/features/LesserGhoulTracker';
import VirulentPlagueEfficiency from './modules/spells/VirulentPlagueEfficiency';
import DiseaseDetonation from './modules/spells/DiseaseDetonation';
import FesteringStrikeEfficiency from './modules/spells/FesteringStrikeEfficiency';
import ScourgeStrikeEfficiency from './modules/spells/ScourgeStrikeEfficiency';
import Putrefy from './modules/spells/Putrefy';
import Pestilence from './modules/spells/Pestilence';
import SuddenDoom from './modules/talents/SuddenDoom';
import CommanderOfTheDead from './modules/talents/CommanderOfTheDead';
import SummonGargoyleBuffs from './modules/talents/SummonGargoyleBuffs';
import SoulReaper from '../shared/talents/SoulReaper';
import Guide from './modules/Guide';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    channeling: Channeling,

    runeTracker: RuneTracker,
    runeDetails: RuneDetails,
    runeGraph: RuneGraph,

    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,
    runicPowerGraph: RunicPowerGraph,

    unholyRuneForge: UnholyRuneForgeChecker,
    heroTalents: HeroTalents,
    lesserGhoulTracker: LesserGhoulTracker,
    virulentPlagueEfficiency: VirulentPlagueEfficiency,
    diseaseDetonation: DiseaseDetonation,

    festeringStrikeEfficiency: FesteringStrikeEfficiency,
    scourgeStrikeEfficiency: ScourgeStrikeEfficiency,
    putrefy: Putrefy,
    pestilence: Pestilence,

    suddenDoom: SuddenDoom,
    soulReaper: SoulReaper,
    commanderOfTheDead: CommanderOfTheDead,
    summonGargoyleBuffs: SummonGargoyleBuffs,

    runeOfTheFallenCrusader: RuneOfTheFallenCrusader,

    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
