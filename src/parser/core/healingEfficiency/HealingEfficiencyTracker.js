import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/HealingDone';
import DamageDone from 'parser/shared/modules/DamageDone';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';

import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import ManaTracker from './ManaTracker';

class HealingEfficiencyTracker extends Analyzer {
  static dependencies = {
    manaTracker: ManaTracker,
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    castEfficiency: CastEfficiency,
  };

  getSpellDetails(spellId) {
    let spellInfo = {};
    const ability = this.abilityTracker.getAbility(spellId);

    spellInfo.spell = SPELLS[spellId];
    spellInfo.casts = ability.casts || 0;

    spellInfo.healingHits = ability.healingHits || 0;
    spellInfo.healingDone = ability.healingEffective || 0;
    spellInfo.overhealingDone = ability.healingOverheal || 0;
    spellInfo.healingAbsorbed = ability.healingAbsorbed || 0;

    spellInfo.damageHits = ability.damageHits || 0;
    spellInfo.damageDone = ability.damageEffective || 0;
    spellInfo.damageAbsorbed = ability.damageAbsorbed || 0;

    spellInfo.percentOverhealingDone = spellInfo.overhealingDone / (spellInfo.healingDone + spellInfo.healingAbsorbed) || 0;
    spellInfo.percentHealingDone = spellInfo.healingDone / this.healingDone.total.regular || 0;
    spellInfo.percentDamageDone = spellInfo.damageDone / this.damageDone.total.regular || 0;

    spellInfo.manaSpent = this.manaTracker.spendersObj[spellId] ? this.manaTracker.spendersObj[spellId].spent : 0;
    spellInfo.manaPercentSpent = spellInfo.manaSpent / this.manaTracker.spent;
    spellInfo.manaGained = this.manaTracker;

    spellInfo.hpm = spellInfo.healingDone / spellInfo.manaSpent;
    spellInfo.dpm = spellInfo.damageDone / spellInfo.manaSpent;

    spellInfo.timeSpentCasting = this.castEfficiency.getTimeSpentCasting(spellId).timeSpentCasting + this.castEfficiency.getTimeSpentCasting(spellId).gcdSpent;
    spellInfo.percentTimeSpentCasting = spellInfo.timeSpentCasting / this.owner.fightDuration;

    spellInfo.healingPerTimeSpentCasting = spellInfo.healingDone / spellInfo.timeSpentCasting;
    spellInfo.damagePerTimeSpentCasting = spellInfo.damageDone / spellInfo.timeSpentCasting;

    return spellInfo;
  }

  detailsCache;
  get spellDetails() {
    if (this.detailsCache === undefined) {
      this.detailsCache = {};
    }

    return this.detailsCache;
  }

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.MANA;
    this.maxResource = 100000;
  }
}

export default HealingEfficiencyTracker;
