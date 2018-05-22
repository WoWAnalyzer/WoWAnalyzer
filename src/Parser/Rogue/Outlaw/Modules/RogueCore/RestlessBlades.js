import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Analyzer from 'Parser/Core/Analyzer';

class RestlessBlades extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  on_byPlayer_spendresource(event) {
    const spent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) return;

    let cdr = 500;
    if(this.combatants.selected.hasBuff(SPELLS.TRUE_BEARING.id))
      {cdr = 1500;}
    const amount = cdr*spent;

    this.reduceCooldown(SPELLS.ADRENALINE_RUSH.id,amount);
    this.reduceCooldown(SPELLS.BETWEEN_THE_EYES.id,amount);
    this.reduceCooldown(SPELLS.CANNONBALL_BARRAGE_TALENT.id,amount);
    this.reduceCooldown(SPELLS.KILLING_SPREE_TALENT.id,amount);
    this.reduceCooldown(SPELLS.DEATH_FROM_ABOVE_TALENT.id,amount);
    this.reduceCooldown(SPELLS.MARKED_FOR_DEATH_TALENT.id,amount);
  }

  reduceCooldown(spellId,amount)
  {    
    if (this.spellUsable.isOnCooldown(spellId)) {
      this.spellUsable.reduceCooldown(spellId, amount);
    }
  }
}

export default RestlessBlades;
