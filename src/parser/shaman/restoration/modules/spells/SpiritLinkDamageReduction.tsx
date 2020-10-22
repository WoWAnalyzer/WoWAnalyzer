import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import fetchWcl from 'common/fetchWclApi';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';

import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'interface/others/LazyLoadStatisticBox';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import makeWclUrl from 'common/makeWclUrl';
import SpellLink from 'common/SpellLink';
import Events, { BuffEvent, DamageEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const DEVOTION_AURA_ACTIVE_DAMAGE_REDUCTION = .1;

/**
 * Falling damage is considered "pure" or w/e damage meaning it doesn't get reduced by damage reductions. The ability description of such an event can look like this: {
		"name": "Falling",
		"guid": 3,
		"type": 1,
		"abilityIcon": "inv_axe_02.jpg"
	},
 * `type: 1` seems to only be used by Falling, but I was unable to verify this. I want to ignore this kind of damage taken. I figured the savest solution would be to filter by ability id instead of type, but if you find another such ability that needs to be ignored and it has `type: 1` while nothing else does, we may want to refactor this.
 */
// const THIS_MIGHT_BE_PURE_ABILITY_TYPE_ID = 1;
const FALLING_DAMAGE_ABILITY_ID = 3;

/**
 * Devotion Aura
 * Damage dealt to allies within 10 yards is reduced by up to 10%, diminishing as more allies enter the aura.
 * While Aura Mastery is active, all affected allies gain 20% damage reduction.
 * ---
 * See the markdown file next to this module for info about how this is analyzed.
 */
class SpiritLinkDamageReduction extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damageReduced = 0;
  get drps() {
    return (this.damageReduced / this.owner.fightDuration) * 1000;
  }

  get auraMasteryUptimeFilter() {
    const buffHistory = this.selectedCombatant.getBuffHistory(SPELLS.SPIRIT_LINK_TOTEM_BUFF.id); // check source with multiple shamans...
    if (buffHistory.length === 0) {
      return null;
    }
    // WCL's filter requires the timestamp to be relative to fight start
    return buffHistory.map(buff => `(timestamp>=${buff.start - this.owner.fight.start_time} AND timestamp<=${buff.end! - this.owner.fight.start_time})`,)
      .join(' OR ');
  }
  get filter() {
    const playerName = this.owner.player.name;
    const pet = this.owner.playerPets.find(p => p.guid === 53006); //make a pets file or something
    if (!pet) {
      return; // do this better
    }
//        AND source.id='${pet.id}'
    return `
      IN RANGE
      FROM type='${EventType.ApplyBuff}'
        AND ability.id=${SPELLS.SPIRIT_LINK_TOTEM_BUFF.id}
      TO type='${EventType.RemoveBuff}'
        AND ability.id=${SPELLS.SPIRIT_LINK_TOTEM_BUFF.id}
      END
    `;
  }

  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
    }).then(json => {
      console.log('Received AM damage taken', json);
      
     // const totalDamageTaken = json.entries.reduce(
     //   (damageTaken, entry) => damageTaken + entry.total,
     //   0,
     // );
     // this.damageReduced =
     //   (totalDamageTaken / (1 - DEVOTION_AURA_ACTIVE_DAMAGE_REDUCTION)) *
     //   DEVOTION_AURA_ACTIVE_DAMAGE_REDUCTION;
    });
  }

  statistic() {
    const tooltip = (
      <Trans>
        Text
      </Trans>
    );

    return (
      <LazyLoadStatisticBox
        position={STATISTIC_ORDER.OPTIONAL(60)}
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.DEVOTION_AURA.id} />}
        value={0} //<Trans>≈{formatNumber(this.totalDrps)} DRPS</Trans>
        label={<Trans>Damage reduction</Trans>}
        tooltip={tooltip}
        drilldown={makeWclUrl(this.owner.report.code, {
          fight: this.owner.fightId,
          type: 'damage-taken',
          pins: `2$Off$#244F4B$expression$${this.filter}`,
          view: 'events',
        })}
      />
    );
  }
}

export default SpiritLinkDamageReduction;
