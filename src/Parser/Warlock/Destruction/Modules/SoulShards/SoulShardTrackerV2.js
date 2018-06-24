import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

const debug = true;

const DAMAGE_GENERATORS = {
  [SPELLS.IMMOLATE_DEBUFF.id]: () => 1, // has 50% chance of additional fragment on crit
  [SPELLS.CONFLAGRATE.id]: () => 5,
  [SPELLS.SHADOWBURN_TALENT.id]: () => 3,
  [SPELLS.INCINERATE.id]: event => (event.hitType === HIT_TYPES.CRIT) ? 1 : 0,
};
const IMMO_PROB = 0.5;
const ROF_PROB = 0.2;
const INFERNAL_DURATION = 30000;
const INFERNAL_FRAGMENT_TICK_PERIOD = 500;

class SoulShardTrackerV2 extends ResourceTracker {
  static dependencies = {
    enemies: Enemies,
  };

  lastInfernalSummon = undefined;
  lastInfernalTick = undefined;

  immolateCrits = 0;
  rainOfFireHits = 0;

  hasInferno = false;
  hasT20_2p = false;

  constructor(...args) {
    super(...args);
    this.resource = Object.assign({}, RESOURCE_TYPES.SOUL_SHARDS);
    this.resource.name = "Soul Shard Fragments";
    this.current = 30;
    this.hasT20_2p = this.selectedCombatant.hasBuff(SPELLS.WARLOCK_DESTRO_T20_2P_BONUS.id);
    this.hasInferno = this.selectedCombatant.hasTalent(SPELLS.INFERNO_TALENT.id);
  }

  on_toPlayer_energize(event) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    if (event.resourceChange < 10) {
      event.resourceChange = event.resourceChange * 10;
    }
    super.on_toPlayer_energize(event);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.INCINERATE.id) {
      this._processIncinerateCast(event);
    }
    else if (this.shouldProcessCastEvent(event)) {
      const eventResource = this.getResource(event);
      // eventResource.amount has correct amount of fragments *before* the cast
      // if this is larger than the fragments currently tracked, then some random fragment generation must have happened since last cast till this cast
      debug && console.log(`Fragments from event before cast: ${eventResource.amount}, currently tracked fragments: ${this.current}`);
      // before processing the spender, synchronize fragments to account for random procs
      if (eventResource.amount > this.current) {
        const missingFragments = eventResource.amount - this.current;
        debug && console.log(`Missing ${missingFragments} fragments, Immolate critted ${this.immolateCrits}x, Rain of Fire hit ${this.rainOfFireHits}x`);
        if (!this.hasInferno) {
          // if we're not running Inferno, there's no other way to get random fragments than Immolate
          debug && console.log('Adding all to Immolate');
          this.processInvisibleEnergize(SPELLS.IMMOLATE_DEBUFF.id, missingFragments);
        }
        else {
          const distribution = this._getRandomFragmentDistribution(this.immolateCrits, this.rainOfFireHits, missingFragments);
          debug && console.log(`Adding ${distribution.immolate} to Immolate, ${distribution.rainOfFire} to Rain of Fire`);
          if (distribution.immolate > 0) {
            // so we don't get "empty" energizes, meaning 0 generated, 0 wasted but still 1 cast
            this.processInvisibleEnergize(SPELLS.IMMOLATE_DEBUFF.id, distribution.immolate);
          }
          if (distribution.rainOfFire > 0) {
            this.processInvisibleEnergize(SPELLS.RAIN_OF_FIRE_DAMAGE.id, distribution.rainOfFire);
          }
        }
      }
      // reset the counters
      this.immolateCrits = 0;
      this.rainOfFireHits = 0;
      // actually process the spender with super.on_by_player_cast()
    }

    super.on_byPlayer_cast(event);
  }

  on_event(_, event) {
    // hopefully as accurate for a timed tracking as possible
    // after summoning Infernal (after Infernal Awakening), it generates 1 fragment every 0.5 seconds for 30 seconds
    if (this._hasInfernal(event.timestamp) && this._infernalTicked(event.timestamp)) {
      this.processInvisibleEnergize(SPELLS.SUMMON_INFERNAL.id, 1);
      this.lastInfernalTick = event.timestamp;
    }
  }

  _hasInfernal(timestamp) {
    return (this.lastInfernalSummon !== undefined) && (timestamp < this.lastInfernalSummon + INFERNAL_DURATION);
  }
  _infernalTicked(timestamp) {
    return (this.lastInfernalTick !== undefined) && (timestamp > this.lastInfernalTick + INFERNAL_FRAGMENT_TICK_PERIOD);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.INFERNAL_AWAKENING.id) {
      // Infernal fell down, start the timer
      this.lastInfernalSummon = event.timestamp;
      this.lastInfernalTick = event.timestamp;
    }

    if (DAMAGE_GENERATORS[spellId] && DAMAGE_GENERATORS[spellId](event) > 0) {
      this.processInvisibleEnergize(spellId, DAMAGE_GENERATORS[spellId](event));
    }

    if (spellId === SPELLS.IMMOLATE_DEBUFF.id && event.hitType === HIT_TYPES.CRIT) {
      this.immolateCrits += 1;
    }
    else if (this.hasInferno && spellId === SPELLS.RAIN_OF_FIRE_DAMAGE.id) {
      this.rainOfFireHits += 1;
    }
  }

  _processIncinerateCast(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const hasHavoc = enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp);
    // Havoc is somehow bugged in the sense that it doesn't gain the benefit of T20 2p set bonus, so if the target has Havoc,
    // it doesn't matter if we have the set or not, otherwise it counts it in
    // TODO: Verify for BFA? Still couldn't find anyone with T20 2p on PTR
    const fragments = hasHavoc ? 2 : (this.hasT20_2p ? 3 : 2);
    this.processInvisibleEnergize(event.ability.guid, fragments);
  }

  on_finished() {
    const missingFragments = this.spent - this.generated;
    if (missingFragments <= 0) {
      return;
    }
    const distribution = this._getRandomFragmentDistribution(this.immolateCrits, this.rainOfFireHits, missingFragments);
    debug && console.log(`At the end of fight, missing ${missingFragments} fragments, redistributed ${distribution.immolate} to Immolate, ${distribution.rainOfFire} to Rain of Fire`);
    // circumvent processInvisibleEnergize (it's possible we're recompensating for more fragments than is our maximum, at the end of fight)
    this._applyBuilder(SPELLS.IMMOLATE_DEBUFF.id, null, distribution.immolate, 0);
    if (this.hasInferno) {
      // makes no sense to even show this if the player doesn't have Inferno
      this._applyBuilder(SPELLS.RAIN_OF_FIRE_DAMAGE.id, null, distribution.rainOfFire, 0);
    }
  }
  _getRandomFragmentDistribution(immolateCrits, rainOfFireHits, totalFragments) {
    /*
        This function tries to "distribute" totalFragments into 2 possible sources:
          - Immolate crits
          - Rain of Fire hits (with the Inferno talent)

        A little background info to make things clear:
          - Immolate crits have a 50% chance to generate an extra fragment
          - when the player has the Inferno talent, Rain of Fire hits have a 20% chance to generate a fragment
          - both the number of crits/hits, and the probability itself increase the probability of a certain fragment belonging to one of the sources

        With variables named:
          - Pi, Pr = probabilities for the fragment generation (for Immolate and Rain of Fire respectively)
          - ni, nr = amount of events capable of generating the fragments (immolateCrits and rainOfFireHits)
          - i, r = estimated amount of fragments from each source
          - T = total number of fragments we're trying to distribute (totalFragments)

        We can make 2 equations that should reasonably accurately distribute the fragments:
        1) the estimated fragments should have the same ratio as the "statistically expected" ones
            (Pi * ni) / (Pr * nr) = i / r
        2) estimated fragments from both sources sum up to the total fragments generated
            i + r = T

        If we substitute r = T - i, and solve for i, we get:
          i = (Pi * ni * T) / (Pi * ni + Pr * nr)
          r = T - i
     */
    const denominator = (IMMO_PROB * immolateCrits + ROF_PROB * rainOfFireHits) || 1; // to avoid division by zero, if immolateCrits is 0, then 0 / 1 is still 0
    const i = Math.round((IMMO_PROB * immolateCrits * totalFragments) / denominator);
    const r = totalFragments - i;
    return {
      immolate: i,
      rainOfFire: r,
    };
  }
}

export default SoulShardTrackerV2;
