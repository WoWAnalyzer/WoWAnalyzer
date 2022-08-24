import { maybeGetSpell, registerSpell } from 'common/SPELLS';
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
      this.addSpellInfo(event.extraAbility!);
    }
  }

  addSpellInfo(ability: Omit<Ability, 'type'>) {
    if (maybeGetSpell(ability.guid) || !ability.name || !ability.abilityIcon) {
      return;
    }

    registerSpell(ability.guid, ability.name, ability.abilityIcon.replace(/\.jpg$/, ''));
  }
}

export default SpellInfo;
