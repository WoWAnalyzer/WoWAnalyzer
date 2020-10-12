import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatPercentage, formatNumber } from 'common/format';

class HolyNova extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA.id).casts;
  }

  get healingHits() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA_HEAL.id).healingHits;
  }

  get effectiveHealing() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA_HEAL.id).healingEffective + this.abilityTracker.getAbility(SPELLS.HOLY_NOVA_HEAL.id).healingAbsorbed;
  }

  get overHealing() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA_HEAL.id).healingOverheal;
  }

  get overhealPercent() {
    return this.overHealing / (this.effectiveHealing + this.overHealing);
  }

  get damageHits() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA.id).damageHits;
  }

  get damageDone() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA.id).damageEffective;
  }

  get averageFriendlyTargetsHit() {
    if (this.casts > 0) {
      return this.healingHits / this.casts;
    }
    return 0;
  }

  get averageHealingPerCast() {
    if (this.casts > 0) {
      return this.effectiveHealing / this.casts;
    }
    return 0;
  }

  get averageEnemyTargetsHit() {
    if (this.casts > 0) {
      return this.damageHits / this.casts;
    }
    return 0;
  }

  get averageDamagePerCast() {
    if (this.casts > 0) {
      return this.damageDone / this.casts;
    }
    return 0;
  }

  get holyNovaThreshold() {
    return {
      actual: this.averageFriendlyTargetsHit > 0 ? this.averageFriendlyTargetsHit : 10,
      isLessThan: {
        minor: 10,
        average: 5,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    if (this.casts === 0) {
      return (<></>);
    }
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HOLY_NOVA.id} />}
        value={(
<>
          Average Hits:&nbsp;
          <div style={{ 'color': 'green', display: 'inline-block' }}> {Math.floor(this.averageFriendlyTargetsHit)}</div>
          |
          <div style={{ 'color': 'red', display: 'inline-block' }}> {Math.floor(this.averageEnemyTargetsHit)}</div><br />
          <ItemHealingDone amount={this.effectiveHealing} /><br />
          <ItemDamageDone amount={this.damageDone} />
        </>
)}
        label="Holy Nova"
        tooltip={(
          <>
            Healing done: {formatNumber(this.effectiveHealing)} ({formatPercentage(this.overhealPercent)}% OH)<br />
            Damage done: {formatNumber(this.damageDone)}
          </>
        )}
      />
    );
  }

  suggestions(when: When) {
    when(this.holyNovaThreshold)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You should only cast <SpellLink id={SPELLS.HOLY_NOVA.id} /> when you will hit 5 or more targets.</>)
            .icon(SPELLS.HOLY_NOVA.icon)
            .actual(<>You hit an average of {actual} targets when you cast Holy Nova.</>)
            .recommended(`An average of ${recommended} or more healing hits per cast is recommended.`),
      );
  }
}

export default HolyNova;
