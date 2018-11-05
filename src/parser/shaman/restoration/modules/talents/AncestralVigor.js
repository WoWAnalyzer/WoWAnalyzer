import React from 'react';

import fetchWcl from 'common/fetchWclApi';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatDuration, formatPercentage } from 'common/format';
import SPECS from 'game/SPECS';

import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'interface/others/LazyLoadStatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

const ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH = 0.1;
const HP_THRESHOLD = 1 - 1 / (1 + ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH);

class AncestralVigor extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  loaded = false;
  lifeSavingEvents = [];
  constructor(...args) {
    super(...args);
    this.active = !!this.selectedCombatant.hasTalent(SPELLS.ANCESTRAL_VIGOR_TALENT.id);
  }

  // recursively fetch events until no nextPageTimestamp is returned
  fetchAll(pathname, query) {
    const checkAndFetch = async _query => {
      const json = await fetchWcl(pathname, _query);
      Array.prototype.push.apply(this.lifeSavingEvents, json.events);
      if (json.nextPageTimestamp) {
        return checkAndFetch(Object.assign(query, {
          start: json.nextPageTimestamp,
        }));
      }
      this.loaded = true;
      return null;
    };
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
          AND source.name='${this.selectedCombatant.name}'
        TO type='removebuff'
          AND ability.id=${SPELLS.ANCESTRAL_VIGOR.id}
          AND source.name='${this.selectedCombatant.name}'
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
        value={`≈${this.lifeSavingEvents.length}`}
        label="Lives saved"
        tooltip={tooltip}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(60)}
      >
        <table className="table table-condensed" style={{ fontWeight: 'bold' }}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Player</th>
              <th style={{ textAlign: 'center' }}>Ability</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            {
              this.lifeSavingEvents
                .map((event, index) => {
                  const combatant = this.combatants.players[event.targetID];
                  if (!combatant) {
                    return null; // pet or something
                  }

                  const spec = SPECS[combatant.specId];
                  const specClassName = spec.className.replace(' ', '');

                  return (
                    <tr key={index}>
                      <th scope="row">{formatDuration((event.timestamp - this.owner.fight.start_time) / 1000, 0)}</th>
                      <td className={specClassName}>{combatant.name}</td>
                      <td style={{ textAlign: 'center' }}>
                        <SpellLink id={event.ability.guid} icon={false}>
                          <Icon icon={event.ability.abilityIcon} />
                        </SpellLink></td>
                      <td>{formatPercentage(event.hitPoints / event.maxHitPoints)}%</td>
                    </tr>
                  );
                }
                )
            }
          </tbody>
        </table>
      </LazyLoadStatisticBox>
    );
  }
}

export default AncestralVigor;
