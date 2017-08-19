import React from 'react';

import SPELLS from 'common/SPELLS';
import makeWclUrl from 'common/makeWclUrl';
import SpellIcon from 'common/SpellIcon';

import LazyLoadStatisticBox from 'Main/LazyLoadStatisticBox';

import Module from 'Parser/Core/Module';

const ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH = 0.1;
const HP_THRESHOLD = 1 - 1/(1 + ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH);
// this threshold was used to filter the big damages that has more chance to kill a player if there is no ancestral vigor buff.
const BIG_DAMAGE_THRESHOLD = 0.2;

class AncestralVigor extends Module {

  loaded = false;
  totalLifeSaved = 0;
  totalLifeSavedFromBigDamage = 0;
  on_initialized() {
    if (!this.owner.error) {
      this.active = !!this.owner.selectedCombatant.hasTalent(SPELLS.ANCESTRAL_VIGOR_TALENT.id);
    }
  }

  // recursively fetch events until no nextPageTimestamp is returned
  fetchAll(pathname, query) {
    const self = this;
    async function checkAndFetch(_query) {
      try {
        const response = await fetch(makeWclUrl(pathname, _query));
        const json = await response.json();
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          self.totalLifeSaved += json.events.length;
          self.totalLifeSavedFromBigDamage += json.events.filter(e => e.amount / e.maxHitPoints >= BIG_DAMAGE_THRESHOLD).length;
          if (json.nextPageTimestamp) {
            return checkAndFetch(Object.assign(query, { start: json.nextPageTimestamp }));
          } else {
            self.loaded = true;
          }
        }
      } catch (err) {
        throw err;
      }
    }

    return checkAndFetch(query);
  }

  load() {
    const query = {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(
        IN RANGE
        WHEN type='damage'
          AND target.disposition='friendly'
          AND resources.hitPoints>0
          AND 100*resources.hpPercent<=${Math.ceil(10000 * HP_THRESHOLD)}
          AND 10000*(resources.hitPoints+effectiveDamage)/resources.maxHitPoints>=${Math.floor(10000 * HP_THRESHOLD)}
        FROM type='applybuff'
          AND ability.id=${SPELLS.ANCESTRAL_VIGOR.id}
          AND source.name='${this.owner.selectedCombatant.name}'
        TO type='removebuff'
          AND ability.id=${SPELLS.ANCESTRAL_VIGOR.id}
          AND source.name='${this.owner.selectedCombatant.name}'
        END
      )`,
    };
    return this.fetchAll(`report/events/${this.owner.report.code}`, query);
  }

  statistic() {
    let tooltip = `The theoretically result of how many player would been dead without the ancestral vigor buff was ${this.totalLifeSaved}.`;
    if (this.totalLifeSavedFromBigDamage) {
      tooltip += `<br/>Amoung the ${this.totalLifeSaved} lives saved by the buff, ${this.totalLifeSavedFromBigDamage} of them were caused by a big damage(>=${BIG_DAMAGE_THRESHOLD * 100}% of player's HP) which has a higher risk to cause death.`;
    }
    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.ANCESTRAL_VIGOR.id} />}
        value={`≈${this.totalLifeSaved}`}
        label="Life saved"
        tooltip={this.loaded ? tooltip : 'Click to load how many lives were saved by the ancestral vigor buff.'}
      />
    );
  }
}

export default AncestralVigor;
