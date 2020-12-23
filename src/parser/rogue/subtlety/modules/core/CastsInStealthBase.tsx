import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { t } from '@lingui/macro';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';

class CastsInStealthBase extends Analyzer {
  backstabSpell: Spell;
  badStealthSpells: Spell[] = [];
  stealthCondition = '';
  maxCastsPerStealth = 0;
  validStealthSpellIds = [
    SPELLS.BACKSTAB.id,
    SPELLS.GLOOMBLADE_TALENT.id,
    SPELLS.SHURIKEN_STORM.id,
    SPELLS.SHADOWSTRIKE.id,
    SPELLS.NIGHTBLADE.id,
    SPELLS.EVISCERATE.id,
    SPELLS.SHURIKEN_TORNADO_TALENT.id,
    SPELLS.SECRET_TECHNIQUE_TALENT.id,
  ];

  constructor(options: Options) {
    super(options);
    this.backstabSpell = this.selectedCombatant.hasTalent(SPELLS.GLOOMBLADE_TALENT.id)
      ? SPELLS.GLOOMBLADE_TALENT
      : SPELLS.BACKSTAB;
    this.badStealthSpells = [this.backstabSpell];
  }

  get stealthMaxCasts() {
    return 0;
  }

  get stealthActualCasts() {
    return 0;
  }

  get castsInStealthThresholds() {
    return {
      actual: this.stealthActualCasts / this.stealthMaxCasts,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  createWrongCastThresholds(spell: Spell, tracker: any) {
    return {
      actual: tracker.getAbility(spell.id).casts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: 'number',
    };
  }

  suggestWrongCast(when: When, spell: Spell, thresholds: any) {
    when(thresholds)
      .addSuggestion((suggest: SuggestionFactory, actual: number | boolean, recommended: number | boolean) => suggest(<>Use <SpellLink id={SPELLS.SHADOWSTRIKE.id} /> instead of <SpellLink id={spell.id} /> during {this.stealthCondition}. </>)
        .icon(spell.icon)
        .actual(t({
      id: "rogue.subtlety.suggestions.castsInStealth.casts",
      message: `${actual} ${spell.name} casts`
    }))
        .recommended(`${recommended} is recommended`));
  }

  suggestAvgCasts(when: When, spell: Spell) {
    when(this.castsInStealthThresholds)
      .addSuggestion((suggest: SuggestionFactory) => suggest(<>Try to cast {this.maxCastsPerStealth} spells during {this.stealthCondition}</>)
        .icon(spell.icon)
        .actual(t({
      id: "rogue.subtlety.suggestions.castsInStealth.efficiency",
      message: `${this.stealthActualCasts} casts out of ${this.stealthMaxCasts} possible.`
    }))
        .recommended(`${this.maxCastsPerStealth} in each ${this.stealthCondition} window`));
  }
}

export default CastsInStealthBase;
