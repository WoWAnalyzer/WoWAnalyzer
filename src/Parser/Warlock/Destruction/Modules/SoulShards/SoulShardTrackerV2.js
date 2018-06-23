import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

import SoulShardEvents from './SoulShardEvents';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Enemies from 'Parser/Core/Modules/Enemies';

const DAMAGE_GENERATORS = {
  [SPELLS.IMMOLATE_DEBUFF.id]: 1, // has 50% chance of additional fragment on crit
  [SPELLS.CONFLAGRATE.id]: 5,
  [SPELLS.SHADOWBURN_TALENT.id]: 3,
};

class SoulShardTrackerV2 extends ResourceTracker {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  _hasT20_2p = false;

  on_initialized() {
    this.resource = Object.assign({}, RESOURCE_TYPES.SOUL_SHARDS);
    this.resource.name = "Soul Shard Fragments";
    this._hasT20_2p = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DESTRO_T20_2P_BONUS.id);
  }

  on_toPlayer_energize(event) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    if (event.resourceChange < 10) {
      event.resourceChange = event.resourceChange * 10;
    }
    super.on_toPlayer_energize && super.on_toPlayer_energize(event);
  }

  on_byPlayer_cast(event) {
    // TODO: fabricate compensation events for immolate crits
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.INCINERATE.id) {
      super.on_byPlayer_cast(event);
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      super.on_byPlayer_cast(event);
      return;
    }
    const hasHavoc = enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp);
    // Havoc is somehow bugged in the sense that it doesn't gain the benefit of T20 2p set bonus, so if the target has Havoc,
    // it doesn't matter if we have the set or not, otherwise it counts it in
    // TODO: Verify for BFA? Still couldn't find anyone with T20 2p on PTR
    const fragments = hasHavoc ? 2 : (this._hasT20_2p ? 3 : 2);
    this.processInvisibleEnergize(spellId, fragments);

    super.on_byPlayer_cast(event);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.INCINERATE.id && event.hitType === HIT_TYPES.CRIT) {
      this.processInvisibleEnergize(spellId, 1);
    }
    else if (DAMAGE_GENERATORS[spellId]) {
      this.processInvisibleEnergize(spellId, DAMAGE_GENERATORS[spellId]);
    }
  }
  // http://localhost:3000/report/rL2AnjCcB46aDRNF/4-Normal+Taloc+-+Wipe+3+(5:22)/4-Twerrco/events

  // before I forget my train of thoughts - track amount of spent shards, track amount of known created shards, work with the difference?
}

export default SoulShardTrackerV2;
