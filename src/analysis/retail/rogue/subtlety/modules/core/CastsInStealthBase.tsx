import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';

class CastsInStealthBase extends Analyzer {
  backstabSpell: Spell;
  badStealthSpells: Spell[] = [];
  stealthCondition = '';
  maxCastsPerStealth = 0;
  validStealthSpellIds = [
    SPELLS.BACKSTAB.id,
    TALENTS.GLOOMBLADE_TALENT.id,
    SPELLS.SHURIKEN_STORM.id,
    SPELLS.SHADOWSTRIKE.id,
    SPELLS.EVISCERATE.id,
    TALENTS.SHURIKEN_TORNADO_TALENT.id,
    TALENTS.SECRET_TECHNIQUE_TALENT.id,
  ];

  constructor(options: Options) {
    super(options);
    this.backstabSpell = this.selectedCombatant.hasTalent(TALENTS.GLOOMBLADE_TALENT)
      ? TALENTS.GLOOMBLADE_TALENT
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
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestWrongCast(when: When, spell: Spell, thresholds: any) {
    when(thresholds).addSuggestion(
      (suggest: SuggestionFactory, actual: number | boolean, recommended: number | boolean) =>
        suggest(
          <>
            Use <SpellLink spell={SPELLS.SHADOWSTRIKE} /> instead of <SpellLink spell={spell} />{' '}
            during {this.stealthCondition}.{' '}
          </>,
        )
          .icon(spell.icon)
          .actual(
            defineMessage({
              id: 'rogue.subtlety.suggestions.castsInStealth.casts',
              message: `${actual} ${spell.name} casts`,
            }),
          )
          .recommended(`${recommended} is recommended`),
    );
  }

  suggestAvgCasts(when: When, spell: Spell) {
    when(this.castsInStealthThresholds).addSuggestion((suggest: SuggestionFactory) =>
      suggest(
        <>
          Try to cast {this.maxCastsPerStealth} spells during {this.stealthCondition}
        </>,
      )
        .icon(spell.icon)
        .actual(
          defineMessage({
            id: 'rogue.subtlety.suggestions.castsInStealth.efficiency',
            message: `${this.stealthActualCasts} casts out of ${this.stealthMaxCasts} possible.`,
          }),
        )
        .recommended(`${this.maxCastsPerStealth} in each ${this.stealthCondition} window`),
    );
  }
}

export default CastsInStealthBase;
