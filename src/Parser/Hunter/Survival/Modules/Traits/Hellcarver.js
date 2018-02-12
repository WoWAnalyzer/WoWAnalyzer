import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

const HELLCARVER_MODIFIER_PER_RANK = (1 / 30); //3.33% repeat ofcourse

const MS_BUFFER = 100;

/*
 * Carve or Butchery deals 3% increased damage for each additional target hit.
 */
class Hellcarver extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  rank = 0;
  bonusDamage = 0;
  lastCastTimestamp = 0;
  enemiesHit = 0;
  damagePreCalc = 0;
  modifier = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.HELLCARVER_TRAIT.id];
    if (this.rank > 0) {
      this.active = true;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BUTCHERY_TALENT.id && spellId !== SPELLS.CARVE.id) {
      return;
    }
    this.lastCastTimestamp = event.timestamp;
    this.enemiesHit = 0;
    this.damagePreCalc = 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (this.lastCastTimestamp && (this.lastCastTimestamp + MS_BUFFER < event.timestamp) && this.damagePreCalc > 0) {
      this.modifier = HELLCARVER_MODIFIER_PER_RANK * this.rank * this.enemiesHit;
      this.bonusDamage += this.damagePreCalc - (this.damagePreCalc / (1 + this.modifier));
      this.lastCastTimestamp = null;
    }
    if (spellId !== SPELLS.BUTCHERY_TALENT.id && spellId !== SPELLS.CARVE.id) {
      return;
    }
    if ((this.lastCastTimestamp + MS_BUFFER) > event.timestamp) {
      this.damagePreCalc += event.amount + (event.absorbed || 0);
      this.enemiesHit++;
    }
  }

  get damageContribution() {
    return formatNumber(this.bonusDamage);
  }

}

export default Hellcarver;
