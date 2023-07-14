import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import HIT_TYPES from 'game/HIT_TYPES';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import EventFilter, { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, {
  DamageEvent,
  EventType,
  ResourceChangeEvent,
  CastEvent,
  MappedEvent,
  ClassResources,
} from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

const debug = false;

const DAMAGE_GENERATORS = {
  [SPELLS.IMMOLATE_DEBUFF.id]: () => 1, // has 50% chance of additional fragment on crit
  [SPELLS.CONFLAGRATE.id]: () => 5,
  [TALENTS.SHADOWBURN_TALENT.id]: () => 3,
  [SPELLS.INCINERATE.id]: (event: DamageEvent) => (event.hitType === HIT_TYPES.CRIT ? 1 : 0),
};

const IMMO_PROB = 0.5;
const ROF_PROB = 0.2;
const INFERNAL_DURATION = 30000;
const INFERNAL_FRAGMENT_TICK_PERIOD = 500;

class SoulShardTracker extends ResourceTracker {
  static get fullshardgained() {
    return new EventFilter(EventType.FullShardGained);
  }

  static dependencies = {
    ...ResourceTracker.dependencies,
    enemies: Enemies,
  };

  lastInfernalSummon: number | null = null;
  lastInfernalTick: number | null = null;
  immolateCrits = 0;
  rainOfFireHits = 0;
  hasInferno = false;

  constructor(options: Options) {
    super(options);
    // a copy of the object since I don't want to change it in the Events tab, only in the Resource tab
    this.resource = Object.assign({}, RESOURCE_TYPES.SOUL_SHARDS);
    this.resource.name = 'Soul Shard Fragments';
    // this.current = 30;
    this.hasInferno = this.selectedCombatant.hasTalent(TALENTS.INFERNO_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.any, this.onEvent);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  // this accounts for Soul Conduit and possibly Feretory of Souls (they grant whole Soul Shards and appear as energize events, but their resourceChange field is in values 0 - 5 and we want 0 - 50
  onEnergize(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    if (event.resourceChange < 10) {
      event.resourceChange = event.resourceChange * 10;
    }
    super.onEnergize(event);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const eventResource = this.getResource(event);
    if (spellId === TALENTS.SOUL_FIRE_TALENT.id) {
      this.processInvisibleEnergize(spellId, 4, event.timestamp);
    } else if (spellId === SPELLS.INCINERATE.id) {
      // Incinerate generates 2 fragments on cast (and another one if it crits, handled further down)
      this.processInvisibleEnergize(spellId, 2, event.timestamp);
    } else if (eventResource) {
      // eventResource.amount has correct amount of fragments *before* the cast
      // if this is larger than the fragments currently tracked, then some random fragment generation must have happened since last cast till this cast
      debug &&
        console.log(
          `Fragments from event before cast: ${eventResource.amount}, currently tracked fragments: ${this.current}`,
        );
      // before processing the spender, synchronize fragments to account for random procs
      if (eventResource.amount > this.current) {
        const missingFragments = eventResource.amount - this.current;
        debug &&
          console.log(
            `Missing ${missingFragments} fragments, Immolate critted ${this.immolateCrits}x, Rain of Fire hit ${this.rainOfFireHits}x`,
          );
        if (!this.hasInferno) {
          // if we're not running Inferno, there's no other way to get random fragments than Immolate
          // ... or it's some kind of Infernal shenanigan again, we can't account more fragments than there were events possibly causing them
          debug &&
            console.log(
              `Adding ${Math.min(missingFragments, this.immolateCrits)} fragments to Immolate`,
            );
          this.processInvisibleEnergize(
            SPELLS.IMMOLATE_DEBUFF.id,
            Math.min(missingFragments, this.immolateCrits),
            event.timestamp,
          );
        } else {
          const distribution = this._getRandomFragmentDistribution(
            this.immolateCrits,
            this.rainOfFireHits,
            missingFragments,
          );
          const actualImmolate = Math.min(distribution.immolate, this.immolateCrits);
          const actualRain = Math.min(distribution.rainOfFire, this.rainOfFireHits);
          debug &&
            console.log(`Adding ${actualImmolate} to Immolate, ${actualRain} to Rain of Fire`);
          if (actualImmolate > 0) {
            // so we don't get "empty" energizes, meaning 0 generated, 0 wasted but still 1 cast
            this.processInvisibleEnergize(
              SPELLS.IMMOLATE_DEBUFF.id,
              actualImmolate,
              event.timestamp,
            );
          }
          if (actualRain > 0) {
            this.processInvisibleEnergize(
              SPELLS.RAIN_OF_FIRE_DAMAGE.id,
              actualRain,
              event.timestamp,
            );
          }
        }
      }
      // reset the counters
      this.immolateCrits = 0;
      this.rainOfFireHits = 0;
      // actually process the spender with super.on_by_player_cast()
    }

    super.onCast(event);
  }

  onEvent(event: MappedEvent) {
    // after summoning Infernal (after Infernal Awakening), it generates 1 fragment every 0.5 seconds for 30 seconds
    // theoretically accurate, practically it messes up the fragment generation a lot
    // (but it's a lot worse without it, so I decided to go with the lesser of two evils since this way of generating fragments isn't tied to any kind of event)
    const timestamp = (event && event.timestamp) || this.owner.currentTimestamp;
    if (this._hasInfernal(timestamp) && this._infernalTicked(timestamp)) {
      this.processInvisibleEnergize(SPELLS.SUMMON_INFERNAL.id, 1, event.timestamp);
      this.lastInfernalTick = timestamp;
    }
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.INFERNAL_AWAKENING.id) {
      this.lastInfernalSummon = event.timestamp;
      this.lastInfernalTick = event.timestamp;
    }

    if (DAMAGE_GENERATORS[spellId] && DAMAGE_GENERATORS[spellId](event) > 0) {
      this.processInvisibleEnergize(spellId, DAMAGE_GENERATORS[spellId](event), event.timestamp);
    }

    if (spellId === SPELLS.IMMOLATE_DEBUFF.id && event.hitType === HIT_TYPES.CRIT) {
      this.immolateCrits += 1;
    } else if (this.hasInferno && spellId === SPELLS.RAIN_OF_FIRE_DAMAGE.id) {
      this.rainOfFireHits += 1;
    }
  }

  onFightend() {
    // after the fight has finished, try to redistribute the missing fragments
    const missingFragments = this.spent - this.generated;
    if (missingFragments <= 0) {
      return;
    }
    const distribution = this._getRandomFragmentDistribution(
      this.immolateCrits,
      this.rainOfFireHits,
      missingFragments,
    );
    debug &&
      console.log(
        `At the end of fight, missing ${missingFragments} fragments, redistributed ${distribution.immolate} to Immolate, ${distribution.rainOfFire} to Rain of Fire`,
      );
    // with all the other balancing, it shouldn't probably be possible to give more shards than is the maximum
    this.processInvisibleEnergize(
      SPELLS.IMMOLATE_DEBUFF.id,
      distribution.immolate,
      this.owner.currentTimestamp,
    );
    if (this.hasInferno) {
      // makes no sense to even show this if the player doesn't have Inferno
      this.processInvisibleEnergize(
        SPELLS.RAIN_OF_FIRE_DAMAGE.id,
        distribution.rainOfFire,
        this.owner.currentTimestamp,
      );
    }
  }

  _applyBuilder(
    spellId: number,
    gain: number,
    waste: number,
    timestamp?: number,
    resource?: ClassResources,
  ) {
    const beforeBuilder = this.current % 10;
    super._applyBuilder(spellId, gain, waste, timestamp ?? -1, resource);
    const afterBuilder = this.current % 10;
    // for trait Chaos Shards we need to know when we generated a full Shard
    // can be either to full shard (39 => 40, beforebuilder = 9, afterBuilder = 0)
    // or over full shard (39 => 41, before = 9, after = 1)
    // but not something like 34 => 39, before = 4, after = 9
    // also, Chaos Shards can't proc off itself
    if (beforeBuilder > afterBuilder) {
      const event = {
        timestamp: this.owner.currentTimestamp,
        type: EventType.FullShardGained,
        current: this.current,
      };

      this.eventEmitter.fabricateEvent(event);
    }
  }

  _hasInfernal(timestamp: number) {
    return (
      this.lastInfernalSummon !== undefined &&
      this.lastInfernalSummon !== null &&
      timestamp < this.lastInfernalSummon + INFERNAL_DURATION
    );
  }

  _infernalTicked(timestamp: number) {
    return (
      this.lastInfernalTick !== undefined &&
      this.lastInfernalTick !== null &&
      timestamp > this.lastInfernalTick + INFERNAL_FRAGMENT_TICK_PERIOD
    );
  }

  _getRandomFragmentDistribution(
    immolateCrits: number,
    rainOfFireHits: number,
    totalFragments: number,
  ) {
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
    const denominator = IMMO_PROB * immolateCrits + ROF_PROB * rainOfFireHits || 1; // to avoid division by zero, if immolateCrits is 0, then 0 / 1 is still 0
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
