import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

import SoulShardEvents from './SoulShardEvents';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Enemies from 'Parser/Core/Modules/Enemies';

class SoulShardTrackerV2 extends ResourceTracker {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  _hasT20_2p = false;
  _GENERATORS = {
    [SPELLS.IMMOLATE_DEBUFF.id]: _ => 1, // has 50% chance of additional fragment on crit
    [SPELLS.CONFLAGRATE.id]: _ => 5,
    [SPELLS.SHADOWBURN_TALENT.id]: _ => 3,
    [SPELLS.INCINERATE.id]: (event) => {
      const enemy = this.enemies.getEntity(event);
      if (!enemy) {
        // shouldn't happen, bail out
        return null;
      }

      const hasHavoc = enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp);
      // Havoc is somehow bugged in the sense that it doesn't gain the benefit of T20 2p set bonus, so if the target has Havoc, it doesn't matter if we have the set or not, otherwise it counts it in
      // TODO: Verify for BFA? Still couldn't find anyone with T20 2p on PTR
      let rawFragments = hasHavoc ? 2 : (this._hasT20_2p ? 3 : 2);
      if (event.hitType === HIT_TYPES.CRIT) {
        rawFragments += 1;
      }
      return rawFragments;
    },
  };

  on_initialized() {
    this.resource = RESOURCE_TYPES.SOUL_SHARDS;
    this.resource.name = "Soul Shard Fragments";
    this._hasT20_2p = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DESTRO_T20_2P_BONUS.id);
  }

  // http://localhost:3000/report/rL2AnjCcB46aDRNF/4-Normal+Taloc+-+Wipe+3+(5:22)/4-Twerrco/events
  // Feretory of Souls and Soul Conduit should still show up as energize events (they refund whole shards)
  // incinerate - fragments on CAST, bonus one on crit (damage ofc)
  // conflagrate, shadowburn - both instants, doesn't matter?
  // immolate - dmg ticks
}

export default SoulShardTrackerV2;
