import SPELLS, { registerSpell } from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { Ability, AnyEvent } from 'parser/core/Events';

/**
 * We automatically discover spell info from the combat log so we can avoid many
 * calls to resolve missing spell info.
 */
class SpellInfo extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.any, this.onEvent);
  }

  onEvent(event: AnyEvent) {
    if ('ability' in event) {
      this.addSpellInfo(event.ability);
    }
    if ('extraAbility' in event) {
      this.addSpellInfo(event.extraAbility);
    }
  }

  _normalizeAbilityIcon(abilityIcon: string) {
    return abilityIcon.replace(/\.jpg$/, '');
  }
  _spellExists(ability: Omit<Ability, 'type'>) {
    return (
      SPELLS[ability.guid] !== undefined &&
      SPELLS[ability.guid].name === ability.name &&
      SPELLS[ability.guid].icon === this._normalizeAbilityIcon(ability.abilityIcon)
    );
  }

  addSpellInfo(ability: Omit<Ability, 'type'>) {
    // Ability typing is incomplete: name and abilityIcon may be undefined. If that's the case, there's no point storing their info in the SPELLS object. I think it only occurs for fabricated events.
    if (!ability.name || !ability.abilityIcon || this._spellExists(ability)) {
      return;
    }

    registerSpell(ability.guid, ability.name, this._normalizeAbilityIcon(ability.abilityIcon));
  }
}

export default SpellInfo;
