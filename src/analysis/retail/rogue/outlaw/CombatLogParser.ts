import {
  ComboPointDetails,
  EchoingReprimand,
  EnergyDetails,
  EnergyTracker,
  Flagellation,
  SerratedBoneSpike,
  SpellEnergyCost,
  SpellUsable,
  InstantPoison,
  Sepsis,
  StealthAbilityFollowingSepsis,
} from 'analysis/retail/rogue/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

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
import BladeFlurry from './modules/spells/BladeFlurry';
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

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    spellUsable: SpellUsable,
    checklist: Checklist,

    //Resource
    comboPointTracker: OutlawComboPointTracker,
    comboPointDetails: ComboPointDetails,
    comboPoints: ComboPoints,
    energyTracker: EnergyTracker,
    energyCapTracker: OutlawEnergyCapTracker,
    energyDetails: EnergyDetails,
    energy: Energy,
    spellEnergyCost: SpellEnergyCost,

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
    bladeFlurry: BladeFlurry,
    //Talents
    bladeRush: BladeRush,
    serratedBoneSpike: SerratedBoneSpike,
    echoingReprimand: EchoingReprimand,
    flagellation: Flagellation,
    sepsis: Sepsis,
    stealthAbilityFollowingSepsis: StealthAbilityFollowingSepsis,

    // Outlaw's throughput benefit isn't as big as for other classes since we don't have a lot of free gcds to use
    arcaneTorrent: [
      ArcaneTorrent,
      {
        gcd: 1000,
        castEfficiency: 0.5,
        extraSuggestion: 'You should be using Arcane Torrent whenever you have a free GCD for it.',
      },
    ] as const,
  };
}

export default CombatLogParser;
