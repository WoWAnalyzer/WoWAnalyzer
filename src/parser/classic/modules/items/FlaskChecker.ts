import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';
import { RequirementThresholds } from 'parser/shared/modules/features/Checklist/Requirement';
import BaseFlaskChecker from 'parser/shared/modules/items/FlaskChecker';

const MAX_FLASK_IDS = [
  54212, // https://www.wowhead.com/wotlk/spell=54212/flask-of-pure-mojo
  53758, // https://www.wowhead.com/wotlk/spell=53758/flask-of-stoneblood
  53755, // https://www.wowhead.com/wotlk/spell=53755/flask-of-the-frost-wyrm
  53760, // https://www.wowhead.com/wotlk/spell=53760/flask-of-endless-rage
];

const MIN_FLASK_IDS = [
  28520, // https://www.wowhead.com/wotlk/spell=28520/flask-of-relentless-assault
  28521, // https://www.wowhead.com/wotlk/spell=28521/flask-of-blinding-light
  67019, // https://www.wowhead.com/wotlk/spell=67019/flask-of-the-north
  28540, // https://www.wowhead.com/wotlk/spell=28540/flask-of-pure-death
  28519, // https://www.wowhead.com/wotlk/spell=28519/flask-of-mighty-restoration
  17627, // https://www.wowhead.com/wotlk/item=13511/flask-of-distilled-wisdom
];

const GUARDIAN_ELIXIR_IDS = [
  53751, // https://www.wowhead.com/wotlk/spell=53751/elixir-of-mighty-fortitude
  60343, // https://www.wowhead.com/wotlk/spell=60343/mighty-defense
  53763, // https://www.wowhead.com/wotlk/spell=53763/protection
  60347, // https://www.wowhead.com/wotlk/spell=60347/mighty-thoughts
];

const BATTLE_ELIXIR_IDS = [
  53749, // https://www.wowhead.com/wotlk/spell=53749/gurus-elixir
  60346, // https://www.wowhead.com/wotlk/spell=60346/lightning-speed
  33721, // https://www.wowhead.com/wotlk/spell=33721/spellpower-elixir
  60340, // https://www.wowhead.com/wotlk/spell=60340/accuracy
  53764, // https://www.wowhead.com/wotlk/spell=53764/mighty-mana-regeneration
  53748, // https://www.wowhead.com/wotlk/spell=53748/mighty-strength
  60344, // https://www.wowhead.com/wotlk/spell=60344/expertise
  28497, // https://www.wowhead.com/wotlk/spell=28497/mighty-agility
  60345, // https://www.wowhead.com/wotlk/spell=60345/armor-piercing
  60341, // https://www.wowhead.com/wotlk/spell=60341/deadly-strikes
  53746, // https://www.wowhead.com/wotlk/spell=53746/wrath-elixir
  53747, // https://www.wowhead.com/wotlk/spell=53747/elixir-of-spirit
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
