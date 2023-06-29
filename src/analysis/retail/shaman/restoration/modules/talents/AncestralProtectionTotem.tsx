import fetchWcl from 'common/fetchWclApi';
import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { WCLEventsResponse, WclOptions } from 'common/WCL_TYPES';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { Icon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ApplyDebuffEvent, CastEvent, EventType, HasSource } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'parser/ui/LazyLoadStatisticBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

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
    this.active = Boolean(
      this.selectedCombatant.hasTalent(TALENTS.ANCESTRAL_PROTECTION_TOTEM_TALENT),
    );
  }

  // recursively fetch events until no nextPageTimestamp is returned
  fetchAll(pathname: string, query: WclOptions) {
    const checkAndFetch: any = async (_query: WclOptions) => {
      const json = (await fetchWcl(pathname, _query)) as WCLEventsResponse;
      const events = json.events as Array<CastEvent | ApplyDebuffEvent>;
      this.aptEvents.push(...events);
      if (json.nextPageTimestamp) {
        return checkAndFetch(
          Object.assign(query, {
            start: json.nextPageTimestamp,
          }),
        );
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
        (type='${EventType.Cast}' AND ability.id=${TALENTS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id})
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
      case TALENTS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id:
        return <>Totem placed</>;
      case SPELLS.TOTEMIC_REVIVAL_DEBUFF.id:
        return <>Able to revive</>;
      case SPELLS.TOTEMIC_REVIVAL_CAST.id:
        return <>Resurrected</>;
      default:
        return '';
    }
  }

  statistic() {
    const tooltip = this.loaded ? (
      <>This includes the APT casts of all Restoration Shamans in the fight.</>
    ) : (
      <>Click to analyze APT usage on this fight.</>
    );
    const value =
      this.aptEvents.length > 0 ? <>{this.aptEvents.length} events found</> : <>No Results</>;

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={TALENTS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id} />}
        label={<>Ancestral Protection Totem</>}
        value={value}
        tooltip={tooltip}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(60)}
      >
        {this.aptEvents.length > 0 && (
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>
                  <>Time</>
                </th>
                <th>
                  <>Player</>
                </th>
                <th style={{ textAlign: 'center' }}>
                  <>Ability</>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.aptEvents.map((event, index) => {
                if (!HasSource(event)) {
                  return null;
                }
                const combatant = this.combatants.players[event.sourceID];
                if (!combatant) {
                  return null; // pet or something
                }

                const specClassName = combatant.player.type.replace(' ', '');

                return (
                  <tr key={index}>
                    <th scope="row">
                      {formatDuration(event.timestamp - this.owner.fight.start_time, 0)}
                    </th>
                    <td className={specClassName}>{combatant.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <SpellLink id={event.ability.guid} icon={false}>
                        <Icon icon={event.ability.abilityIcon} />{' '}
                        {this.spellToText(event.ability.guid)}
                      </SpellLink>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </LazyLoadStatisticBox>
    );
  }
}

export default AncestralProtectionTotem;
