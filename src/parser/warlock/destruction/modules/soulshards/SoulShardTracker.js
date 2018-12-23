import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';
import HIT_TYPES from 'game/HIT_TYPES';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const debug = false;

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
const CHAOS_SHARDS_COUNT = 5; // Chaos Shards trait regenerates full Soul Shard (10 fragments) in 2 seconds (5 "ticks", each worth 2 fragments)
const FRAGMENTS_PER_CHAOS_SHARDS_ENERGIZE = 2;

class SoulShardTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    enemies: Enemies,
  };

  lastInfernalSummon = null;
  lastInfernalTick = null;

  immolateCrits = 0;
  rainOfFireHits = 0;

  hasInferno = false;

  currentChaosShardsEnergizes = 0;

  constructor(...args) {
    super(...args);
    // a copy of the object since I don't want to change it in the Events tab, only in the Resource tab
    this.resource = Object.assign({}, RESOURCE_TYPES.SOUL_SHARDS);
    this.resource.name = "Soul Shard Fragments";
    this.current = 30;
    this.hasInferno = this.selectedCombatant.hasTalent(SPELLS.INFERNO_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.CHAOS_SHARDS_BUFF_ENERGIZE.id) {
      return;
    }
    this.currentChaosShardsEnergizes = 0;
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.CHAOS_SHARDS_BUFF_ENERGIZE.id) {
      return;
    }
    // if player has max shards and the traits procs, the energize events don't trigger
    // keep track of the energizes and count the missing ones as wasted
    const wastedTicks = CHAOS_SHARDS_COUNT - this.currentChaosShardsEnergizes;
    this._applyBuilder(SPELLS.CHAOS_SHARDS_BUFF_ENERGIZE.id, null, 0, wastedTicks * FRAGMENTS_PER_CHAOS_SHARDS_ENERGIZE);
  }

  // this accounts for Soul Conduit and possibly Feretory of Souls (they grant whole Soul Shards and appear as energize events, but their resourceChange field is in values 0 - 5 and we want 0 - 50
  on_toPlayer_energize(event) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    if (event.resourceChange < 10) {
      event.resourceChange = event.resourceChange * 10;
    }
    if (event.ability.guid === SPELLS.CHAOS_SHARDS_BUFF_ENERGIZE.id) {
      // even though this trait's effect triggers an energize event, it's "0.2" Soul Shards and has "resourceChange" = 0, that's why I have to trigger it manually
      this.currentChaosShardsEnergizes += 1;
      this.processInvisibleEnergize(event.ability.guid, FRAGMENTS_PER_CHAOS_SHARDS_ENERGIZE);
    }
    super.on_toPlayer_energize(event);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.INCINERATE.id) {
      // Incinerate generates 2 fragments on cast (and another one if it crits, handled further down)
      this.processInvisibleEnergize(spellId, 2);
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
          // ... or it's some kind of Infernal shenanigan again, we can't account more fragments than there were events possibly causing them
          debug && console.log(`Adding ${Math.min(missingFragments, this.immolateCrits)} fragments to Immolate`);
          this.processInvisibleEnergize(SPELLS.IMMOLATE_DEBUFF.id, Math.min(missingFragments, this.immolateCrits));
        }
        else {
          const distribution = this._getRandomFragmentDistribution(this.immolateCrits, this.rainOfFireHits, missingFragments);
          const actualImmolate = Math.min(distribution.immolate, this.immolateCrits);
          const actualRain = Math.min(distribution.rainOfFire, this.rainOfFireHits);
          debug && console.log(`Adding ${actualImmolate} to Immolate, ${actualRain} to Rain of Fire`);
          if (actualImmolate > 0) {
            // so we don't get "empty" energizes, meaning 0 generated, 0 wasted but still 1 cast
            this.processInvisibleEnergize(SPELLS.IMMOLATE_DEBUFF.id, actualImmolate);
          }
          if (actualRain > 0) {
            this.processInvisibleEnergize(SPELLS.RAIN_OF_FIRE_DAMAGE.id, actualRain);
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

  on_event(event) {
    // after summoning Infernal (after Infernal Awakening), it generates 1 fragment every 0.5 seconds for 30 seconds
    // theoretically accurate, practically it messes up the fragment generation a lot
    // (but it's a lot worse without it, so I decided to go with the lesser of two evils since this way of generating fragments isn't tied to any kind of event)
    const timestamp = (event && event.timestamp) || this.owner.currentTimestamp;
    if (this._hasInfernal(timestamp) && this._infernalTicked(timestamp)) {
      this.processInvisibleEnergize(SPELLS.SUMMON_INFERNAL.id, 1);
      this.lastInfernalTick = timestamp;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.INFERNAL_AWAKENING.id) {
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

  on_fightend() {
    // after the fight has finished, try to redistribute the missing fragments
    const missingFragments = this.spent - this.generated;
    if (missingFragments <= 0) {
      return;
    }
    const distribution = this._getRandomFragmentDistribution(this.immolateCrits, this.rainOfFireHits, missingFragments);
    debug && console.log(`At the end of fight, missing ${missingFragments} fragments, redistributed ${distribution.immolate} to Immolate, ${distribution.rainOfFire} to Rain of Fire`);
    // with all the other balancing, it shouldn't probably be possible to give more shards than is the maximum
    this.processInvisibleEnergize(SPELLS.IMMOLATE_DEBUFF.id, distribution.immolate);
    if (this.hasInferno) {
      // makes no sense to even show this if the player doesn't have Inferno
      this.processInvisibleEnergize(SPELLS.RAIN_OF_FIRE_DAMAGE.id, distribution.rainOfFire);
    }
  }

  getGeneratedBySpell(spellId) {
    return (this.buildersObj[spellId] && this.buildersObj[spellId].generated) || 0;
  }

  _hasInfernal(timestamp) {
    return (this.lastInfernalSummon !== undefined) && (timestamp < this.lastInfernalSummon + INFERNAL_DURATION);
  }

  _infernalTicked(timestamp) {
    return (this.lastInfernalTick !== undefined) && (timestamp > this.lastInfernalTick + INFERNAL_FRAGMENT_TICK_PERIOD);
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
    // known caveat - presumably Summon Infernal can mess up the shard tracking so that this function gets called with 0 Immolate crits and 0 Rain of Fire hits, but nonzero fragments
    // this results in them being accounted to Rain of Fire (which is caught outside of the function though)
    return {
      immolate: i,
      rainOfFire: r,
    };
  }
}

export default SoulShardTracker;
