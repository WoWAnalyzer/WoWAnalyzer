import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatTracker from 'parser/shared/modules/StatTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SCHOOLS from 'game/MAGIC_SCHOOLS';
import Events, { DamageEvent } from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const debug = false;

class SpellReflect extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  };
  protected statTracker!: StatTracker;
  protected abilityTracker!: AbilityTracker;

  magicDamage = 0;
  magicDamageReduced = 0;
  totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamage);
    debug && this.addEventListener(Events.fightend, this.fightEndDebug);
  }

  onDamage(event: DamageEvent) {
    if (event.ability.type === SCHOOLS.ids.PHYSICAL) {
      return;
    }
    this.magicDamage += event.unmitigatedAmount || 0;
    if (this.selectedCombatant.hasBuff(SPELLS.SPELL_REFLECTION.id)) {
      this.magicDamageReduced += event.unmitigatedAmount || 0;
    }
  }

  fightEndDebug() {
    console.log(`magic damage ${this.magicDamage}`);
    console.log(`magic damage with mit ${this.magicDamageReduced}`);
    console.log(`total damage ${this.totalDamage}`);
  }

  get suggestionThresholds(){
    return {
      actual: this.magicDamageReduced / this.magicDamage,
      isLessThan: {
        minor: .25,
        average: .15,
        major: .05,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          Try to cast <SpellLink id={SPELLS.SPELL_REFLECTION.id} />  more often when magic damage is going out to take less damage.
        </>,
      )
        .icon(SPELLS.SPELL_REFLECTION.icon)
        .actual(i18n._(t('warrior.protection.suggestions.spellReflect.efficiency')`${formatPercentage(actual)} % magic damage With Spell Reflect Up`))
        .recommended(`${formatPercentage(recommended)} % recommended`));
  }
}

export default SpellReflect;
