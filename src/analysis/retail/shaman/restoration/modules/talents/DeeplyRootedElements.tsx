import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import BUFFS from 'src/analysis/retail/shaman/restoration/modules/Buffs'

import Events, {
  HealEvent,
  BeginCastEvent,
  CastEvent,
  ApplyBuffStackEvent,
  RemoveBuffStackEvent
} from 'parser/core/Events';




// Tracks the uptime of Deeply Rooted Elements's procs and reports the additionl output as well as the casts.

// **ToDo list
// Check for procs (buff apply) > Fill counter | > Import Buff from Buffs file
// Filter from real CD button press IF taken with Asc. talent
// Create Bubble for casts made between buff apply and buff remove events
// Track if taken with Preeminence talent (haste boost)
// Check for casts made by livly totems (CH targat increases applies!)
// Import all math (if possible) from constants file
// Check for Healing from Procs if taken with Ancestral Awakening (because HW becomes a 100% crit!)
// Beg Senpai for a good UI because you're so not going to do anything front end Nalta!

// Take over from Harrek's Asc. file
class DeeplyRootedElements extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;
  eventCount = 0;

    protected cooldownThroughputTracker!: CooldownThroughputTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);

    const tracker = this.cooldownThroughputTracker;

    const validCastIds = [TALENTS.CHAIN_HEAL_TALENT.id, SPELLS.HEALING_WAVE.id];


    if (this.selectedCombatant.hasTalent(TALENTS.OVERSURGE_TALENT)) {
      validCastIds.push(SPELLS.HEALING_STREAM_TOTEM.id);
      validCastIds.push(SPELLS.STORMSTREAM_TOTEM.id);
    }




  }
}

export default DeeplyRootedElements;
