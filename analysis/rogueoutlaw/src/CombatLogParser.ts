import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import {
  ComboPointDetails,
  EchoingReprimand,
  EnergyDetails,
  EnergyTracker,
  EssenceOfBloodfang,
  Flagellation,
  InvigoratingShadowdust,
  SerratedBoneSpike,
  SpellEnergyCost,
  SpellUsable,
  InstantPoison,
  Sepsis,
  StealthAbilityFollowingSepsis,
} from '@wowanalyzer/rogue';

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
import Celerity from './modules/spells/shadowlands/legendaries/Celerity';
import GreenskinsWickers from './modules/spells/shadowlands/legendaries/GreenskinsWickers';
import GuileCharm from './modules/spells/shadowlands/legendaries/GuileCharm';
import SliceAndDiceUptime from './modules/spells/SliceAndDiceUptime';
import BladeRush from './modules/talents/BladeRush';

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

    //Core
    restlessBlades: RestlessBlades,
    rollTheBonesCastTracker: RollTheBonesCastTracker,
    instantPoison: InstantPoison,

    //Items
    guileCharm: GuileCharm,
    greenskinsWickers: GreenskinsWickers,
    essenceOfBloodfang: EssenceOfBloodfang,
    invigoratingShadowdust: InvigoratingShadowdust,
    celerity: Celerity,

    //Casts
    dispatch: Dispatch,
    opportunityDamageTracker: OpportunityDamageTracker,
    opportunity: Opportunity,
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
    // Covenants
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
