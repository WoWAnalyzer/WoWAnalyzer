import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';

/*
  Soul Fire (Tier 15 Destruction talent):
    Burns the enemy's soul, dealing X Fire damage. Cooldown is reduced by 2 sec for every Soul Shard you spend.
 */
const REDUCTION_MS_PER_SHARD = 2000;

class SpellUsable extends CoreSpellUsable {
  hasSF = false;

  constructor(...args) {
    super(...args);
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
}

export default SpellUsable;
