import { maybeGetSpell, registerSpell } from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { Ability, AnyEvent } from 'parser/core/Events';
import { maybeGetTalent } from 'common/TALENTS/maybeGetTalent';

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
    // If the spell is already in the spellbook, we ignore it
    if (maybeGetSpell(ability.guid) || !ability.name || !ability.abilityIcon) {
      return;
    }

    // If the spell is a talent, we want to use the talent version instead of whatever
    // is logged by the game, because it can be misleading
    const talent = maybeGetTalent(ability.guid);
    registerSpell(
      ability.guid,
      talent?.name ?? ability.name,
      (talent?.icon ?? ability.abilityIcon).replace(/\.jpg$/, ''),
    );
  }
}

export default SpellInfo;
