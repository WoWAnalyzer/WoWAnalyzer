import {
  ComboPointDetails,
  EchoingReprimand,
  EnergyDetails,
  EnergyTracker,
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
import Preparation from './modules/talents/Preparation';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Finishers from './modules/features/Finishers';
import RollTheBonesCastTracker from './modules/features/RollTheBonesCastTracker';
import BetweenTheEyes from './modules/spells/BetweenTheEyes';
import BetweenTheEyesDamageTracker from './modules/spells/BetweenTheEyesDamageTracker';
import Dispatch from './modules/spells/Dispatch';
import Opportunity from './modules/spells/Opportunity';
import OpportunityDamageTracker from './modules/spells/OpportunityDamageTracker';
import RollTheBonesBuffs from './modules/spells/RollTheBonesBuffs';
import SliceAndDiceUptime from './modules/spells/SliceAndDiceUptime';
import Audacity from './modules/spells/Audacity';
import AudacityDamageTracker from './modules/spells/AudacityDamageTracker';
import FanTheHammerNormalizer from './normalizers/FanTheHammerNormalizer';
import Guide from './Guide';
import BuilderUse from './modules/core/BuilderUse';
import FinisherUse from './modules/core/FinisherUse';
import AplCheck from './modules/apl/AplCheck';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import OpportunityRefreshNormalizer from './normalizers/OpportunityRefreshNormalizer';

import SpellUsable from './modules/features/SpellUsable';
import AdrenalineRush from './modules/talents/AdrenalineRush';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    spellUsable: SpellUsable,

    //Normalizers
    castLinkNormalizer: CastLinkNormalizer,
    thistleTeaCastLinkNormalizer: ThistleTeaCastLinkNormalizer,
    fanTheHammerNormalizer: FanTheHammerNormalizer,
    opportunityRefreshNormalizer: OpportunityRefreshNormalizer,

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
    finishers: Finishers,
    sliceAndDiceUptime: SliceAndDiceUptime,
    //Talents
    echoingReprimand: EchoingReprimand,
    adrenalineRush: AdrenalineRush,
    preparation: Preparation,

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

  static guide = Guide;
}

export default CombatLogParser;
