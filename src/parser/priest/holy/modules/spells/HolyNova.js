import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellLink from 'common/SpellLink';

class HolyNova extends Analyzer {
  get casts() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA.id).casts || 0;
  }

  get healingHits() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA_HEAL.id).healingHits || 0;
  }

  get effectiveHealing() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA_HEAL.id).healingEffective + this.abilityTracker.getAbility(SPELLS.HOLY_NOVA_HEAL.id).healingAbsorbed || 0;
  }

  get overHealing() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA_HEAL.id).healingOverheal || 0;
  }

  get damageHits() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA.id).damageHits || 0;
  }

  get damageDone() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA.id).damageEffective;
  }

  get averageFriendlyTargetsHit() {
    return this.healingHits / this.casts;
  }

  get averageHealingPerCast() {
    return this.effectiveHealing / this.casts;
  }

  get averageEnemyTargetsHit() {
    return this.damageHits / this.casts;
  }

  get averageDamagePerCast() {
    return this.damageDone / this.casts;
  }

  get holyNovaThreshold() {
    return {
      actual: this.averageFriendlyTargetsHit,
      isLessThan: {
        minor: 5,
        average: 3,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.holyNovaThreshold)
      .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>You should only cast <SpellLink id={SPELLS.HOLY_NOVA.id} /> when you will hit 5 or more targets.</>)
            .icon(SPELLS.HOLY_NOVA.icon)
            .actual(<>You hit an average of {actual} targets when you cast Holy Nova.</>)
            .recommended(`An average of ${recommended} or more healing hits per cast is recommended.`);
        },
      );
  }
}

export default HolyNova;
