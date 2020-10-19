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

import Analyzer, { Options } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import { ApplyDebuffEvent, CastEvent, EventType, HasSource } from 'parser/core/Events';
import { WCLEventsResponse, WclOptions } from 'common/WCL_TYPES';
import { Trans } from '@lingui/macro';

//RQXjBJ1kG9pAC2DV/21-Mythic++Atal'Dazar+-+Kill+(51:52)/Koorshaman/

class AncestralProtectionTotem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  loaded = false;
  aptEvents: Array<CastEvent | ApplyDebuffEvent> = [];
  constructor(options: Options) {
    super(options);
    this.active = Boolean(this.selectedCombatant.hasTalent(SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id));
  }

  // recursively fetch events until no nextPageTimestamp is returned
  fetchAll(pathname: string, query: WclOptions) {
    const checkAndFetch: any = async (_query: WclOptions) => {
      const json = await fetchWcl(pathname, _query) as WCLEventsResponse;
      const events = json.events as Array<CastEvent | ApplyDebuffEvent>;
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
    const query: WclOptions = {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(
        (type='${EventType.Cast}' AND ability.id=${SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id})
        OR
        (type='${EventType.ApplyDebuff}' AND ability.id=${SPELLS.TOTEMIC_REVIVAL_DEBUFF.id})
        OR
        (type='${EventType.Cast}' AND ability.id=${SPELLS.TOTEMIC_REVIVAL_CAST.id})
      )`,
      timeout: 2000,
    };
    return this.fetchAll(`report/events/${this.owner.report.code}`, query);
  }

  spellToText(ability: number) {
    switch (ability) {
      case SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id:
        return <Trans id="shaman.restoration.apt.status.totemPlaced">Totem placed</Trans>;
      case SPELLS.TOTEMIC_REVIVAL_DEBUFF.id:
        return <Trans id="shaman.restoration.apt.status.revivable">Able to revive</Trans>;
      case SPELLS.TOTEMIC_REVIVAL_CAST.id:
        return <Trans id="shaman.restoration.apt.status.res">Resurrected</Trans>;
      default:
        return "";
    }
  }

  statistic() {
    const tooltip = this.loaded
      ? <Trans id="shaman.restoration.apt.statistic.tooltip.active">This includes the APT casts of all Restoration Shamans in the fight.</Trans>
      : <Trans id="shaman.restoration.apt.statistic.tooltip.inactive">Click to analyze APT usage on this fight.</Trans>;
    const value = this.aptEvents.length > 0 ? <Trans id="shaman.restoration.apt.statistic.label.success">{this.aptEvents.length} events found</Trans> : <Trans id="shaman.restoration.apt.statistic.label.failure">No Results</Trans>;

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id} />}
        label={<Trans id="shaman.restoration.apt.statistic.label">Ancestral Protection Totem</Trans>}
        value={value}
        tooltip={tooltip}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(60)}
      >
        {(this.aptEvents.length > 0) && (
          <table className="table table-condensed" style={{ fontWeight: 'bold' }}>
            <thead>
              <tr>
                <th><Trans id="common.time">Time</Trans></th>
                <th><Trans id="common.player">Player</Trans></th>
                <th style={{ textAlign: 'center' }}><Trans id="common.ability">Ability</Trans></th>
              </tr>
            </thead>
            <tbody>
              {
                this.aptEvents.map((event, index) => {
                  if (!HasSource(event)) {
                    return null;
                  }
                  const combatant = this.combatants.players[event.sourceID];
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
                          <Icon icon={event.ability.abilityIcon} /> {this.spellToText(event.ability.guid)}
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
