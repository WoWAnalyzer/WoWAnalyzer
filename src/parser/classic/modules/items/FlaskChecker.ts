import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';
import { RequirementThresholds } from 'parser/shared/modules/features/Checklist/Requirement';

const FLASK_IDS = [
  28518, // https://tbc.wowhead.com/spell=28518/flask-of-fortification
  28540, // https://tbc.wowhead.com/spell=28540/flask-of-pure-death
  28520, // https://tbc.wowhead.com/spell=28520/flask-of-relentless-assault
  28521, // https://tbc.wowhead.com/spell=28521/flask-of-blinding-light
  28519, // https://tbc.wowhead.com/spell=28519/flask-of-mighty-restoration
  42735, // https://tbc.wowhead.com/spell=42735/chromatic-wonder
  17627, // https://tbc.wowhead.com/spell=17627/distilled-wisdom

  41609, // https://tbc.wowhead.com/spell=41609/fortification-of-shattrath
  46837, // https://tbc.wowhead.com/spell=46837/pure-death-of-shattrath
  46838, // https://tbc.wowhead.com/spell=46837/pure-death-of-shattrath  it's also pure-death-of-shattrath, but different from the 46837
  41608, // https://tbc.wowhead.com/spell=41608/relentless-assault-of-shattrath
  46839, // https://tbc.wowhead.com/spell=46839/blinding-light-of-shattrath
  41610, // https://tbc.wowhead.com/spell=41610/mighty-restoration-of-shattrath
  41611, // https://tbc.wowhead.com/spell=41611/supreme-power-of-shattrath,
];

const GUARDIAN_ELIXIR_IDS = [
  28514, // https://tbc.wowhead.com/spell=28514/empowerment
  28509, // https://tbc.wowhead.com/spell=28509/greater-mana-regeneration
  28502, // https://tbc.wowhead.com/spell=28502/major-armor
  39628, // https://tbc.wowhead.com/spell=39628/elixir-of-ironskin
  39627, // https://tbc.wowhead.com/spell=39627/elixir-of-draenic-wisdom
  39626, // https://tbc.wowhead.com/spell=39626/earthen-elixir
  39625, // https://tbc.wowhead.com/spell=39625/elixir-of-major-fortitude
];

const BATTLE_ELIXIR_IDS = [
  28503, // https://tbc.wowhead.com/spell=28503/major-shadow-power
  38954, // https://tbc.wowhead.com/spell=38954/fel-strength-elixir
  28497, // https://tbc.wowhead.com/spell=28497/major-agility
  28501, // https://tbc.wowhead.com/spell=28501/major-firepower
  28493, // https://tbc.wowhead.com/spell=28493/major-frost-power
  28491, // https://tbc.wowhead.com/spell=28491/healing-power
  33726, // https://tbc.wowhead.com/spell=33726/elixir-of-mastery
  28490, // https://tbc.wowhead.com/spell=28490/major-strength
  33721, // https://tbc.wowhead.com/spell=33721/adepts-elixir
  33720, // https://tbc.wowhead.com/spell=33720/onslaught-elixir
];

class FlaskChecker extends Analyzer {
  flaskId: number | null = null;
  guardianElixirId: number | null = null;
  battleElixirId: number | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff);
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (FLASK_IDS.includes(spellId) && event.prepull) {
      this.flaskId = spellId;
    }
    if (GUARDIAN_ELIXIR_IDS.includes(spellId) && event.prepull) {
      this.guardianElixirId = spellId;
    }
    if (BATTLE_ELIXIR_IDS.includes(spellId) && event.prepull) {
      this.battleElixirId = spellId;
    }
  }

  get FlaskSuggestionThresholds(): RequirementThresholds {
    return {
      actual: Boolean(this.flaskId) || Boolean(this.guardianElixirId && this.battleElixirId),
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  get GuardianElixirSuggestionThresholds(): RequirementThresholds {
    return {
      actual: !this.flaskId && !this.guardianElixirId,
      isEqual: true,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  get BattleElixirSuggestionThresholds(): RequirementThresholds {
    return {
      actual: !this.flaskId && !this.battleElixirId,
      isEqual: true,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  suggestions(when: When) {
    when(this.FlaskSuggestionThresholds).addSuggestion((suggest: SuggestionFactory) =>
      suggest(
        'You did not have a flask up before combat. Having a flask during combat is an easy way to improve performance.',
      )
        .icon('inv_potion_97')
        .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
    );
    when(this.GuardianElixirSuggestionThresholds).addSuggestion((suggest: SuggestionFactory) =>
      suggest(
        'You did not have a guardian elixir or flask up before combat. Having one of these is an easy way to improve performance.',
      )
        .icon('inv_potion_155')
        .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
    );
    when(this.BattleElixirSuggestionThresholds).addSuggestion((suggest: SuggestionFactory) =>
      suggest(
        'You did not have a battle elixir or flask up before combat. Having one of these is an easy way to improve performance.',
      )
        .icon('inv_potion_142')
        .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
    );
  }
}

export default FlaskChecker;
