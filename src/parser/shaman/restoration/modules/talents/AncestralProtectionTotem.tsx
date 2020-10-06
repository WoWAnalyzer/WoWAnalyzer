import React from 'react';

import fetchWcl from 'common/fetchWclApi';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatDuration } from 'common/format';
import SPECS from 'game/SPECS';

import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'interface/others/LazyLoadStatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import { ApplyDebuffEvent, CastEvent, Event, EventType, HasSource } from 'parser/core/Events';

//RQXjBJ1kG9pAC2DV/21-Mythic++Atal'Dazar+-+Kill+(51:52)/Koorshaman/
interface Query {
  start: number,
  end: number,
  filter: string,
}

class AncestralProtectionTotem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  loaded = false;
  aptEvents: Array<Event<EventType.Cast | EventType.ApplyDebuff>> = [];
  constructor(options: any) {
    super(options);
    this.active = !!this.selectedCombatant.hasTalent(SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id);
  }

  // recursively fetch events until no nextPageTimestamp is returned
  fetchAll(pathname: string, query: Query) {
    const checkAndFetch: any = async (_query: Query) => {
      const json = await fetchWcl(pathname, _query);
      const events = json.events as Array<Event<EventType.Cast | EventType.ApplyDebuff>>;
      this.aptEvents.push(...events);
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
    this.aptEvents = [];
    const query: Query = {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(
        (type='${EventType.Cast}' AND ability.id=${SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id})
        OR
        (type='${EventType.ApplyDebuff}' AND ability.id=${SPELLS.TOTEMIC_REVIVAL_DEBUFF.id})
        OR
        (type='${EventType.Cast}' AND ability.id=${SPELLS.TOTEMIC_REVIVAL_CAST.id})
      )`,
    };
    return this.fetchAll(`report/events/${this.owner.report.code}`, query);
  }

  spellToText(ability: number) {
    switch (ability) {
      case SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id:
        return "Totem placed";
      case SPELLS.TOTEMIC_REVIVAL_DEBUFF.id:
        return "Able to revive";
      case SPELLS.TOTEMIC_REVIVAL_CAST.id:
        return "Resurrected";
      default:
        return "";
    }
  }

  statistic() {
    const tooltip = this.loaded
      ? 'This includes the APT casts of all Restoration Shamans in the fight.'
      : 'Click to analyze APT usage on this fight.';
    const value = this.aptEvents.length > 0 ? `${this.aptEvents.length} events found` : 'No Results';

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id} />}
        label="Ancestral Protection Totem"
        value={value}
        tooltip={tooltip}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(60)}
      >
        {(this.aptEvents.length > 0) && (
          <table className="table table-condensed" style={{ fontWeight: 'bold' }}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Player</th>
                <th style={{ textAlign: 'center' }}>Ability</th>
              </tr>
            </thead>
            <tbody>
              {
                this.aptEvents.map((event, index) => {
                  if (!HasSource(event)) {
                    return null;
                  }
                  const combatant: any = this.combatants.players[event.sourceID];
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
                        <SpellLink id={(event as ApplyDebuffEvent | CastEvent).ability.guid} icon={false}>
                          <Icon icon={(event as ApplyDebuffEvent | CastEvent).ability.abilityIcon} /> {this.spellToText((event as ApplyDebuffEvent | CastEvent).ability.guid)}
                        </SpellLink></td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        )}
      </LazyLoadStatisticBox>
    );
  }
}

export default AncestralProtectionTotem;
