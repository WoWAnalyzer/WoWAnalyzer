import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';

import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatNumber } from 'common/format';
import AbilityTracker from 'parser/priest/shadow/modules/core/AbilityTracker';
import ShadowWordPain from 'parser/priest/shadow/modules/spells/ShadowWordPain';
import SpellLink from 'common/SpellLink';

// Example Log: /report/ZdaVqwLnvKHmcG7P/34-Heroic+Zul+-+Kill+(4:06)/16-매기사제
class DarkVoid extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    shadowWordPain: ShadowWordPain,
  };

  get totalDamage() {
    return this.swpDamage + this.dvDamage;
  }

  get swpDamage() {
    const averageSwpDamage = this.shadowWordPain.damage / (this.shadowWordPain.appliedShadowWordPains + this.shadowWordPain.refreshedShadowWordPains);
    return averageSwpDamage * this.dvSwpApplications;
  }

  get dvSwpApplications() {
    return this.shadowWordPain.darkVoidShadowWordPainApplications + this.shadowWordPain.darkVoidShadowWordPainRefreshes;
  }

  get dvDamage() {
    const spell = this.abilityTracker.getAbility(SPELLS.DARK_VOID_TALENT.id);
    return spell.damageEffective + spell.damageAbsorbed;
  }

  get totalTargetsHit() {
    return this.abilityTracker.getAbility(SPELLS.DARK_VOID_TALENT.id).damageHits;
  }

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.DARK_VOID_TALENT.id).casts;
  }

  get averageTargetsHit() {
    return this.totalTargetsHit / this.casts;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DARK_VOID_TALENT.id);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.DARK_VOID_TALENT.id}
        value={<ItemDamageDone amount={this.totalDamage} />}
        tooltip={`
          Damage from ${SPELLS.DARK_VOID_TALENT.name}: ${formatNumber(this.dvDamage)}<br />
          Damage from ${SPELLS.SHADOW_WORD_PAIN.name}: ${formatNumber(this.swpDamage)}
        `}
        position={STATISTIC_ORDER.CORE(3)}
      />
    );
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.averageTargetsHit,
      isLessThan: {
        minor: 3,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Try and cast <SpellLink id={SPELLS.DARK_VOID_TALENT.id} /> when there are more targets to hit.</>)
          .icon(SPELLS.DARK_VOID_TALENT.icon)
          .actual(`You hit ${actual} target on average per cast of ${SPELLS.DARK_VOID_TALENT.name}.`)
          .recommended(`You should try and hit ${recommended} or more targets per cast. Try saving the cooldown for add heavy phases.`);
      });
  }
}

export default DarkVoid;
