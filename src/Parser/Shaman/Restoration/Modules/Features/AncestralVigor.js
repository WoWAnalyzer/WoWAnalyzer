import React from 'react';

import fetchWcl from 'common/fetchWcl';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import LazyLoadStatisticBox from 'Main/LazyLoadStatisticBox';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH = 0.1;
const HP_THRESHOLD = 1 - 1 / (1 + ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH);

class AncestralVigor extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  loaded = false;
  totalLifeSaved = 0;
  on_initialized() {
    this.active = !!this.combatants.selected.hasTalent(SPELLS.ANCESTRAL_VIGOR_TALENT.id);
  }

  // recursively fetch events until no nextPageTimestamp is returned
  fetchAll(pathname, query) {
    const self = this;
    async function checkAndFetch(_query) {
      const json = await fetchWcl(pathname, _query);
      self.totalLifeSaved += json.events.length;
      if (json.nextPageTimestamp) {
        return checkAndFetch(Object.assign(query, { start: json.nextPageTimestamp }));
      }
      self.loaded = true;
      return null;
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
          AND source.name='${this.combatants.selected.name}'
        TO type='removebuff'
          AND ability.id=${SPELLS.ANCESTRAL_VIGOR.id}
          AND source.name='${this.combatants.selected.name}'
        END
      )`,
    };
    return this.fetchAll(`report/events/${this.owner.report.code}`, query);
  }

  statistic() {
    const tooltip = this.loaded
      ? 'The amount of players that would have died without your Ancestral Vigor buff.'
      : 'Click to analyze how many lives were saved by the ancestral vigor buff.';
    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.ANCESTRAL_VIGOR.id} />}
        value={`≈${this.totalLifeSaved}`}
        label="Lives saved"
        tooltip={tooltip}
      />
    );
  }
}

export default AncestralVigor;
