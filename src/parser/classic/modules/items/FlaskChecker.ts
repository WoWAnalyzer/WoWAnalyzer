import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';
import { RequirementThresholds } from 'parser/shared/modules/features/Checklist/Requirement';
import BaseFlaskChecker from 'parser/shared/modules/items/FlaskChecker';

const MAX_FLASK_IDS = [
  79469, // https://www.wowhead.com/cata/spell=79469/flask-of-steelskin
  79470, // https://www.wowhead.com/cata/spell=79470/flask-of-the-draconic-mind
  79471, // https://www.wowhead.com/cata/spell=79471/flask-of-the-winds
  79472, // https://www.wowhead.com/cata/spell=79472/flask-of-titanic-strength
  92679, // https://www.wowhead.com/cata/spell=92679/flask-of-battle
  94160, // https://www.wowhead.com/cata/spell=94160/flask-of-flowing-water
];

const MIN_FLASK_IDS = [
  54212, // https://www.wowhead.com/cata/spell=54212/flask-of-pure-mojo
  53758, // https://www.wowhead.com/cata/spell=53758/flask-of-stoneblood
  53755, // https://www.wowhead.com/cata/spell=53755/flask-of-the-frost-wyrm
  53760, // https://www.wowhead.com/cata/spell=53760/flask-of-endless-rage
  79637, // https://www.wowhead.com/cata/spell=79637/flask-of-enhancement
];

const GUARDIAN_ELIXIR_IDS = [
  60347, // https://www.wowhead.com/cata/spell=60347/mighty-thoughts
];

const BATTLE_ELIXIR_IDS = [
  79632, // https://www.wowhead.com/cata/spell=79632/mighty-speed
];

class FlaskChecker extends BaseFlaskChecker {
  //flaskBuffId: number | null = null;
  guardianElixirId: number | null = null;
  battleElixirId: number | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff);
  }

  get MinFlaskIds(): number[] {
    return MIN_FLASK_IDS;
  }

  get MaxFlaskIds(): number[] {
    return MAX_FLASK_IDS;
  }

  onApplybuff(event: ApplyBuffEvent) {
    super.onApplybuff(event);

    const spellId = event.ability.guid;

    if (GUARDIAN_ELIXIR_IDS.includes(spellId) && event.prepull) {
      this.guardianElixirId = spellId;
    }
    if (BATTLE_ELIXIR_IDS.includes(spellId) && event.prepull) {
      this.battleElixirId = spellId;
    }
  }

  get FlaskSuggestionThresholds(): RequirementThresholds {
    return {
      actual: Boolean(this.flaskBuffId) || Boolean(this.guardianElixirId && this.battleElixirId),
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  get GuardianElixirSuggestionThresholds(): RequirementThresholds {
    return {
      actual: !this.flaskBuffId && !this.guardianElixirId,
      isEqual: true,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  get BattleElixirSuggestionThresholds(): RequirementThresholds {
    return {
      actual: !this.flaskBuffId && !this.battleElixirId,
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
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR),
    );
    when(this.GuardianElixirSuggestionThresholds).addSuggestion((suggest: SuggestionFactory) =>
      suggest(
        'You did not have a guardian elixir or flask up before combat. Having one of these is an easy way to improve performance.',
      )
        .icon('inv_potion_155')
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR),
    );
    when(this.BattleElixirSuggestionThresholds).addSuggestion((suggest: SuggestionFactory) =>
      suggest(
        'You did not have a battle elixir or flask up before combat. Having one of these is an easy way to improve performance.',
      )
        .icon('inv_potion_142')
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR),
    );
  }
}

export default FlaskChecker;
