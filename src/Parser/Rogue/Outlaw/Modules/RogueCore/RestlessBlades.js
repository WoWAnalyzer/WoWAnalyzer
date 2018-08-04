import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'Game/RESOURCE_TYPES';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Analyzer from 'Parser/Core/Analyzer';

/**
 * Restless Blades
 * Finishing moves reduce the remaining cooldown of Adrenaline Rush, Between the Eyes, Sprint, Grappling Hook, Ghostly Strike, Marked for Death, Blade Rush, Killing Spree and Vanish by 1 sec per combo point spent.
 */
class RestlessBlades extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  on_byPlayer_spendresource(event) {
    const spent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    let cdr = 1000;
    if (this.selectedCombatant.hasBuff(SPELLS.TRUE_BEARING.id)) {
      cdr += 1000;
    }
    const amount = cdr * spent;

    this.reduceCooldown(SPELLS.ADRENALINE_RUSH.id, amount);
    this.reduceCooldown(SPELLS.BETWEEN_THE_EYES.id, amount);
    this.reduceCooldown(SPELLS.SPRINT.id, amount);
    this.reduceCooldown(SPELLS.GRAPPLING_HOOK.id, amount);
    this.reduceCooldown(SPELLS.GHOSTLY_STRIKE_TALENT.id, amount);
    this.reduceCooldown(SPELLS.MARKED_FOR_DEATH_TALENT.id, amount);
    this.reduceCooldown(SPELLS.BLADE_RUSH_TALENT.id, amount);
    this.reduceCooldown(SPELLS.KILLING_SPREE_TALENT.id, amount);
    this.reduceCooldown(SPELLS.VANISH.id, amount);
  }

  reduceCooldown(spellId, amount) {
    if (this.spellUsable.isOnCooldown(spellId)) {
      this.spellUsable.reduceCooldown(spellId, amount);
    }
  }
}

export default RestlessBlades;
