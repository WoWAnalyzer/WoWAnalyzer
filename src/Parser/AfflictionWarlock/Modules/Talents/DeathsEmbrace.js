import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';
import getDamageBonus from '../WarlockCore/getDamageBonus';

const abilitiesAffected = [
  SPELLS.AGONY.id,
  SPELLS.CORRUPTION_DEBUFF.id,
  SPELLS.PHANTOM_SINGULARITY.id,
  SPELLS.SEED_OF_CORRUPTION_EXPLOSION.id,
  SPELLS.DRAIN_SOUL.id,
  ...UNSTABLE_AFFLICTION_DEBUFF_IDS,
];

//based on the fact that it's a linear increase in damage that is +0% damage at 35% HP and +50% damage at 0% HP
const SLOPE_OF_DAMAGE_INCREASE = -50/35;

class DeathsEmbrace extends Module {
  bonusDmg = 0;

  getDeathEmbraceBonus(healthPercentage) {
    //damageIncrease = (-50/35) * current_target_HP_percentage + 0.5
    //gives 0 for healthPercentage = 0.35 and 0.5 for healthPercentage = 0
    return SLOPE_OF_DAMAGE_INCREASE * healthPercentage + 0.5;
  }

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTalent(SPELLS.DEATHS_EMBRACE_TALENT.id) || this.owner.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_NETHERLORD.id);
  }

  on_byPlayer_damage(event) {
    const targetHealthPercentage = event.hitPoints / event.maxHitPoints;
    if (!targetHealthPercentage) {
      //on random occasion (happened at least once), damage event doesn't have hitPoints and maxHitPoints, which results in NaN and messes up entire module, turning bonusDmg into NaN
      return;
    }
    if (targetHealthPercentage > 0.35) {
      return; //talent doesn't even do anything till 35% target HP
    }

    const spellId = event.ability.guid;
    if (abilitiesAffected.indexOf(spellId) === -1) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, this.getDeathEmbraceBonus(targetHealthPercentage));
  }
}

export default DeathsEmbrace;
