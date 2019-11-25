import EventSubscriber, { SELECTED_PLAYER } from 'parser/core/EventSubscriber';
import Abilities from 'parser/core/modules/Abilities';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Events from 'parser/core/Events';

/**
 * Validate that all spells castable by the player is in the spellbook
 */
class AbilitiesMissing extends EventSubscriber {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.handleCast);
  }

  handleCast(event) {
    if (!event.ability) {
      return;
    }
    const ability = this.abilities.getAbility(event.ability.guid);
    if (!ability && !CASTS_THAT_ARENT_CASTS.includes(event.ability.guid)) {
      console.warn('Ability missing from spellbook:', event.ability);
    }
  }
}

export default AbilitiesMissing;
