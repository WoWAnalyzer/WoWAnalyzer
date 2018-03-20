import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import ItemDamageDone from 'Main/ItemDamageDone';
import Abilities from 'Parser/Core/Modules/Abilities';

const HIT_BUFFER_MS = 500;

/**
 * Kil'jaeden's Burning Wish
 * Use: Launch a vortex of destruction that seeks your current enemy. When it reaches the target, it explodes, dealing a critical strike to all enemies within 10 yds for (317030 * 200 / 100) Fire damage. (1 Min, 15 Sec Cooldown)
 */
class KiljaedensBurningWish extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  hitTimestamp;
  casts = 0;
  hits = 0;
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.KILJAEDENS_BURNING_WISH.id);

    if (this.active) {
      this.abilities.add({
        spell: SPELLS.KILJAEDENS_BURNING_WISH_DAMAGE, // cast event never shows, we fab cast events from damage events
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 75,
        castEfficiency: {
          suggestion: true,
          extraSuggestion: 'Delaying the cast somewhat to line up with add spawns is acceptable, however.',
        },
      });
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.KILJAEDENS_BURNING_WISH_DAMAGE.id) {
      return;
    }

    this.hits += 1;
    // KJBW doesn't produce cast events when used, for whatever reason, so we guess them from damage events
    // Multiple damage events together is obviously the result of one cast, not several.
    if (!this.hitTimestamp || this.hitTimestamp + HIT_BUFFER_MS < event.timestamp) {
      this.hitTimestamp = event.timestamp;
      this.casts += 1;
      // obviously this is maybe a second after the actual cast, but it's close enough
      this._fabricateCastFromDamage(event);
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  _fabricateCastFromDamage(event) {
    const castEvent = {
      timestamp: event.timestamp,
      type: 'cast',
      sourceID: event.sourceID,
      sourceIsFriendly: event.sourceIsFriendly,
      targetID: event.targetID,
      targetIsFriendly: event.targetIsFriendly,
      ability: event.ability,
    };
    this.owner.fabricateEvent(castEvent, event);
  }

  item() {
    return {
      item: ITEMS.KILJAEDENS_BURNING_WISH,
      result: (
        <dfn data-tip={`You got ${this.hits} hits over ${this.casts} casts, for an average of <b>${((this.hits / this.casts) || 0).toFixed(2)} hits per cast</b>`}>
          <ItemDamageDone amount={this.damage} />
        </dfn>
      ),
    };
  }
}

export default KiljaedensBurningWish;
