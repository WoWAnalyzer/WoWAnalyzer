import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

const DAMAGE_GENERATORS = {
  [SPELLS.IMMOLATE_DEBUFF.id]: () => 1, // has 50% chance of additional fragment on crit
  [SPELLS.CONFLAGRATE.id]: () => 5,
  [SPELLS.SHADOWBURN_TALENT.id]: () => 3,
  [SPELLS.INCINERATE.id]: event => (event.hitType === HIT_TYPES.CRIT) ? 1 : 0,
};

const IMMO_PROB = 0.5;
const ROF_PROB = 0.2;

class SoulShardTrackerV2 extends ResourceTracker {
  static dependencies = {
    enemies: Enemies,
  };

  immolateCrits = 0;
  rainOfFireHits = 0;

  hasInferno = false;
  hasT20_2p = false;

  constructor(...args) {
    super(...args);
    this.resource = Object.assign({}, RESOURCE_TYPES.SOUL_SHARDS);
    this.resource.name = "Soul Shard Fragments";
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
    const fragments = hasHavoc ? 2 : (this.hasT20_2p ? 3 : 2);
    this.processInvisibleEnergize(spellId, fragments);

    super.on_byPlayer_cast(event);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
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

  on_finished() {
    // the idea is to try and estimate, where did the fragments come from

    // First iteration - do the calculation at the end - easier but less accurate?
    // Second iteration - do them in between but with the same principle?

    const distribution = this._getRandomFragmentDistribution(this.immolateCrits, this.rainOfFireHits, this.missingFragments);
    // circumvent processInvisibleEnergize (it's possible we're recompensating for more fragments than is our maximum, at the end of fight)
    this._applyBuilder(SPELLS.IMMOLATE_DEBUFF.id, null, distribution.immolate, 0);
    if (this.hasInferno) {
      // makes no sense to even show this if the player doesn't have Inferno
      this._applyBuilder(SPELLS.RAIN_OF_FIRE_DAMAGE.id, null, distribution.rainOfFire, 0);
    }
  }

  get missingFragments() {
    return this.spent - this.generated;
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
    const i = Math.floor((IMMO_PROB * immolateCrits * totalFragments) / (IMMO_PROB * immolateCrits + ROF_PROB * rainOfFireHits));
    const r = totalFragments - i;
    return {
      immolate: i,
      rainOfFire: r,
    };
  }
}

export default SoulShardTrackerV2;
