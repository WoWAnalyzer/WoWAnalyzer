import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SCHOOLS from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatTracker from 'parser/shared/modules/StatTracker';
import React from 'react';

const debug = false;

class SpellReflect extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  };
  magicDamage = 0;
  magicDamageReduced = 0;
  totalDamage = 0;
  protected statTracker!: StatTracker;
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamage);
    debug && this.addEventListener(Events.fightend, this.fightEndDebug);
  }

  get suggestionThresholds() {
    return {
      actual: this.magicDamageReduced / this.magicDamage,
      isLessThan: {
        minor: 0.25,
        average: 0.15,
        major: 0.05,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to cast <SpellLink id={SPELLS.SPELL_REFLECTION.id} /> more often when magic damage is
          going out to take less damage.
        </>,
      )
        .icon(SPELLS.SPELL_REFLECTION.icon)
        .actual(
          t({
            id: 'warrior.protection.suggestions.spellReflect.efficiency',
            message: `${formatPercentage(actual)} % magic damage With Spell Reflect Up`,
          }),
        )
        .recommended(`${formatPercentage(recommended)} % recommended`),
    );
  }
}

export default SpellReflect;
