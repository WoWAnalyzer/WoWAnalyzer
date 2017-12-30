import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

const INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER = 150; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.
const INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME = 200; // if someone heals with FoL and then immediately casts a HS race conditions may occur. This prevents that (although the buff is probably not applied before the FoL).
const INFUSION_OF_LIGHT_FOL_HEALING_INCREASE = 0.5;

const debug = false;

class Tier19_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;
  totalIolProcsUsed = 0;
  bonusIolProcsUsed = 0;
  bonusIolProcsUsedOnFol = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id);
  }

  iolProcsUsedSinceLastHolyShock = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HOLY_SHOCK_HEAL.id) {
      if (event.hitType === HIT_TYPES.CRIT) {
        debug && console.log((event.timestamp - this.owner.fight.start_time) / 1000, 'Holy Shock crit!', event);
        this.iolProcsUsedSinceLastHolyShock = 0;
      }
    }

    if (spellId === SPELLS.FLASH_OF_LIGHT.id || spellId === SPELLS.HOLY_LIGHT.id) {
      const hasIol = this.combatants.selected.hasBuff(SPELLS.INFUSION_OF_LIGHT.id, event.timestamp, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER, INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME);

      if (hasIol) {
        this.iolProcsUsedSinceLastHolyShock += 1;
        debug && console.log((event.timestamp - this.owner.fight.start_time) / 1000, 'IoL', event.ability.name, this.iolProcsUsedSinceLastHolyShock, event);
        this.totalIolProcsUsed += 1;
        if (this.iolProcsUsedSinceLastHolyShock === 2) {
          debug && console.log((event.timestamp - this.owner.fight.start_time) / 1000, 'Bonus IOL', event, event);
          this.bonusIolProcsUsed += 1;
          if (spellId === SPELLS.FLASH_OF_LIGHT.id) {
            this.bonusIolProcsUsedOnFol += 1;
            this.healing += calculateEffectiveHealing(event, INFUSION_OF_LIGHT_FOL_HEALING_INCREASE);
          }
        }
      } else {
        debug && console.log((event.timestamp - this.owner.fight.start_time) / 1000, 'Regular', event.ability.name, event);
      }
    }
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HOLY_SHOCK_DAMAGE.id) {
      if (event.hitType === HIT_TYPES.CRIT) {
        debug && console.log((event.timestamp - this.owner.fight.start_time) / 1000, 'Holy Shock crit!');
        this.iolProcsUsedSinceLastHolyShock = 0;
      }
    }
  }

  on_beacon_heal(beaconTransferEvent, healEvent) {
    const spellId = healEvent.ability.guid;
    if (spellId !== SPELLS.FLASH_OF_LIGHT.id) {
      return;
    }
    const combatant = this.combatants.players[healEvent.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet.
      debug && console.log('Skipping beacon heal event since combatant couldn\'t be found:', beaconTransferEvent, 'for heal:', healEvent);
      return;
    }
    const hasIol = this.combatants.selected.hasBuff(SPELLS.INFUSION_OF_LIGHT.id, healEvent.timestamp, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER, INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME);
    if (!hasIol) {
      return;
    }

    if (this.iolProcsUsedSinceLastHolyShock === 2) {
      debug && console.log((beaconTransferEvent.timestamp - this.owner.fight.start_time) / 1000, 'Beacon transfer', beaconTransferEvent);
      this.healing += calculateEffectiveHealing(beaconTransferEvent, INFUSION_OF_LIGHT_FOL_HEALING_INCREASE);
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`The actual effective healing contributed by the tier 19 4 set bonus. <b>This does not include any healing "gained" from the Holy Light cast time reduction.</b> You used a total of ${this.totalIolProcsUsed} Infusion of Light procs, ${this.bonusIolProcsUsed} of those were from procs from the 4 set bonus and ${this.bonusIolProcsUsedOnFol} of those bonus procs were used on Flash of Light.`}>
          <ItemHealingDone amount={this.healing} />
        </dfn>
      ),
    };
  }
}

export default Tier19_4set;
