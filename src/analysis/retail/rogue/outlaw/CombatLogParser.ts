import {
  ComboPointDetails,
  EchoingReprimand,
  EnergyDetails,
  EnergyTracker,
  Flagellation,
  SpellEnergyCost,
  InstantPoison,
  ThistleTeaCastLinkNormalizer,
} from 'analysis/retail/rogue/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import EnergyGraph from 'analysis/retail/rogue/shared/EnergyGraph';
import ComboPointGraph from 'analysis/retail/rogue/shared/ComboPointGraph';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import ComboPoints from './modules/core/ComboPoints';
import Energy from './modules/core/Energy';
import OutlawComboPointTracker from './modules/core/OutlawComboPointTracker';
import OutlawEnergyCapTracker from './modules/core/OutlawEnergyCapTracker';
import RestlessBlades from './modules/core/RestlessBlades';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import Finishers from './modules/features/Finishers';
import RollTheBonesCastTracker from './modules/features/RollTheBonesCastTracker';
import BetweenTheEyes from './modules/spells/BetweenTheEyes';
import BetweenTheEyesDamageTracker from './modules/spells/BetweenTheEyesDamageTracker';
import Dispatch from './modules/spells/Dispatch';
import Opportunity from './modules/spells/Opportunity';
import OpportunityDamageTracker from './modules/spells/OpportunityDamageTracker';
import RollTheBonesBuffs from './modules/spells/RollTheBonesBuffs';
import RollTheBonesCounter from './modules/spells/RollTheBonesCounter';
import RollTheBonesEfficiency from './modules/spells/RollTheBonesEfficiency';
import SliceAndDiceUptime from './modules/spells/SliceAndDiceUptime';
import BladeRush from './modules/talents/BladeRush';
import InvigoratingShadowdust from 'analysis/retail/rogue/shared/shadowlands/legendaries/InvigoratingShadowdust';
import Audacity from './modules/spells/Audacity';
import AudacityDamageTracker from './modules/spells/AudacityDamageTracker';
import FanTheHammerNormalizer from './normalizers/FanTheHammerNormalizer';
import Guide from './Guide';
import BuilderUse from './modules/core/BuilderUse';
import FinisherUse from './modules/core/FinisherUse';
import AplCheck from './modules/apl/AplCheck';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    checklist: Checklist,

    //Normalizers
    castLinkNormalizer: CastLinkNormalizer,
    thistleTeaCastLinkNormalizer: ThistleTeaCastLinkNormalizer,
    fanTheHammerNormalizer: FanTheHammerNormalizer,

    //Resource
    comboPointTracker: OutlawComboPointTracker,
    comboPointDetails: ComboPointDetails,
    comboPoints: ComboPoints,
    comboPointGraph: ComboPointGraph,
    energyTracker: EnergyTracker,
    energyCapTracker: OutlawEnergyCapTracker,
    energyDetails: EnergyDetails,
    energy: Energy,
    energyGraph: EnergyGraph,
    spellEnergyCost: SpellEnergyCost,

    // Core
    builderUse: BuilderUse,
    finisherUse: FinisherUse,

    //Legendaries
    invigoratingShadowdust: InvigoratingShadowdust,

    //Core
    restlessBlades: RestlessBlades,
    rollTheBonesCastTracker: RollTheBonesCastTracker,
    instantPoison: InstantPoison,

    //Casts
    dispatch: Dispatch,
    opportunityDamageTracker: OpportunityDamageTracker,
    opportunity: Opportunity,
    audacityDamageTracker: AudacityDamageTracker,
    audacity: Audacity,
    betweenTheEyesDamageTracker: BetweenTheEyesDamageTracker,
    betweenTheEyes: BetweenTheEyes,
    rollTheBonesBuffs: RollTheBonesBuffs,
    rollTheBonesCounter: RollTheBonesCounter,
    rollTheBonesEfficiency: RollTheBonesEfficiency,
    finishers: Finishers,
    sliceAndDiceUptime: SliceAndDiceUptime,
    //Talents
    bladeRush: BladeRush,
    echoingReprimand: EchoingReprimand,
    flagellation: Flagellation,

    // Outlaw's throughput benefit isn't as big as for other classes since we don't have a lot of free gcds to use
    arcaneTorrent: [
      ArcaneTorrent,
      {
        gcd: 1000,
        castEfficiency: 0.5,
        extraSuggestion: 'You should be using Arcane Torrent whenever you have a free GCD for it.',
      },
    ] as const,

    apl: AplCheck,
  };

  static guide = Guide;
}

export default CombatLogParser;
