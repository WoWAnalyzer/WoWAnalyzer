import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

/*
  Soul Fire (Tier 15 Destruction talent):
    Burns the enemy's soul, dealing X Fire damage. Cooldown is reduced by 2 sec for every Soul Shard you spend.
 */

const SHADOWBURN_DEBUFF_DURATION = 5000;
const BUFFER = 50;
const debug = false;
const REDUCTION_MS_PER_SHARD = 2000;

class SpellUsable extends CoreSpellUsable {
  hasSB = false;
  hasSF = false;

  shadowburnedEnemies = {
    /*
    [targetString]: {
      start: timestamp,
      expectedEnd: timestamp
    }
     */
  };

  constructor(...args) {
    super(...args);
    this.hasSB = this.selectedCombatant.hasTalent(SPELLS.SHADOWBURN_TALENT.id);
    this.hasSF = this.selectedCombatant.hasTalent(SPELLS.SOUL_FIRE_TALENT.id);
  }

  on_byPlayer_spendresource(event) {
    if (!this.hasSF) {
      return;
    }
    if (this.isOnCooldown(SPELLS.SOUL_FIRE_TALENT.id)) {
      // event.resourceChange is in multiples of 10 (2 shards = 20)
      const shardsSpent = event.resourceChange / 10;
      this.reduceCooldown(SPELLS.SOUL_FIRE_TALENT.id, shardsSpent * REDUCTION_MS_PER_SHARD);
    }
  }

  _handleShadowburn(event) {
    if (!this.hasSB) {
      return;
    }
    if (event.ability.guid !== SPELLS.SHADOWBURN_TALENT.id) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    this.shadowburnedEnemies[target] = {
      start: event.timestamp,
      expectedEnd: event.timestamp + SHADOWBURN_DEBUFF_DURATION,
    };
  }

  on_byPlayer_applydebuff(event) {
    this._handleShadowburn(event);
  }

  on_byPlayer_refreshdebuff(event) {
    this._handleShadowburn(event);
  }

  on_byPlayer_removedebuff(event) {
    if (!this.hasSB) {
      return;
    }
    if (event.ability.guid !== SPELLS.SHADOWBURN_TALENT.id) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.shadowburnedEnemies[target]) {
      debug && this.log(`Shadowburn debuff remove on untracked enemy: ${target}`);
      return;
    }
    // the Shadowburn debuff sometimes expires earlier than in full 5 seconds (e.g. on bosses), so we're checking for even earlier expiration
    const diedEarlier = this.shadowburnedEnemies[target].start <= event.timestamp && event.timestamp <= this.shadowburnedEnemies[target].expectedEnd - BUFFER;
    if (diedEarlier && this.isOnCooldown(SPELLS.SHADOWBURN_TALENT.id)) {
      debug && this.log(`Shadowburned enemy died (${target}), cooldown reset.`);
      this.endCooldown(SPELLS.SHADOWBURN_TALENT.id);
    }
  }
}

export default SpellUsable;
