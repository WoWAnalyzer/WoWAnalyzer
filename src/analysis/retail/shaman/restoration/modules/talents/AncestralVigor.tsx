import { Trans } from '@lingui/macro';
import fetchWcl from 'common/fetchWclApi';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { WCLEventsResponse, WclOptions } from 'common/WCL_TYPES';
import SPECS from 'game/SPECS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { Icon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { DamageEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'parser/ui/LazyLoadStatisticBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticBox from 'parser/ui/StatisticBox';
import { abilityToSpell } from 'common/abilityToSpell';
import {
  DOWNPOUR_INCREASED_MAX_HEALTH,
  ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH,
} from '../../constants';

//const ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH_PER_POINT = 0.1;

class AncestralVigor extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  loaded = false;
  lifeSavingEvents: DamageEvent[] = [];
  disableStatistics = false;
  ancestralVigorIncrease: number;
  downpourIncrease: number;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANCESTRAL_VIGOR_TALENT);
    this.ancestralVigorIncrease = ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH;
    this.downpourIncrease = DOWNPOUR_INCREASED_MAX_HEALTH;
  }

  // recursively fetch events until no nextPageTimestamp is returned
  fetchAll(pathname: string, query: WclOptions) {
    const checkAndFetch: any = async (_query: WclOptions) => {
      const json = (await fetchWcl(pathname, _query)) as WCLEventsResponse;
      const events = json.events as DamageEvent[];
      this.lifeSavingEvents.push(...events);
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

  loadOne(skillId: number) {
    const HP_THRESHOLD = 1 - 1 / (1 + this.ancestralVigorIncrease + this.downpourIncrease);
    // clear array to avoid duplicate entries after switching tabs and clicking it again
    this.lifeSavingEvents = [];
    const query: WclOptions = {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(
        IN RANGE
        WHEN type='${EventType.Damage}'
          AND source.disposition='enemy'
          AND target.disposition='friendly'
          AND target.type='player'
          AND resources.hitPoints>0
          AND 100*resources.hpPercent<=${Math.ceil(10000 * HP_THRESHOLD)}
          AND 10000*(resources.hitPoints+effectiveDamage)/resources.maxHitPoints>=${Math.floor(
            10000 * HP_THRESHOLD,
          )}
        FROM type='${EventType.ApplyBuff}'
          AND ability.id=${skillId}
          AND source.name='${this.selectedCombatant.name}'
        TO type='${EventType.RemoveBuff}'
          AND ability.id=${skillId}
          AND source.name='${this.selectedCombatant.name}'
        END
      )`,
      timeout: 2000,
    };
    return this.fetchAll(`report/events/${this.owner.report.code}`, query);
  }

  load() {
    const vigorQuery = this.loadOne(SPELLS.ANCESTRAL_VIGOR.id);
    const downpourQuery = this.loadOne(SPELLS.DOWNPOUR_HEAL.id);
    return Promise.all([vigorQuery, downpourQuery]);
  }

  statistic() {
    const players = this.combatants.getEntities();
    const restoShamans = Object.values(players).filter(
      (combatant) =>
        combatant.specId === SPECS.RESTORATION_SHAMAN.id && combatant !== this.selectedCombatant,
    );
    if (
      restoShamans &&
      restoShamans.some((shaman) => shaman.hasTalent(TALENTS.ANCESTRAL_VIGOR_TALENT))
    ) {
      this.disableStatistics = true;
    }
    const tooltip = this.loaded ? (
      <Trans id="shaman.restoration.av.statistic.tooltip.active">
        The amount of players that would have died without your Ancestral Vigor buff.
      </Trans>
    ) : (
      <Trans id="shaman.restoration.av.statistic.tooltip.inactive">
        Click to analyze how many lives were saved by the ancestral vigor buff.
      </Trans>
    );
    if (this.disableStatistics) {
      return (
        <StatisticBox
          icon={<SpellIcon spell={SPELLS.ANCESTRAL_VIGOR} />}
          label={<Trans id="shaman.restoration.av.statistic.label">Lives saved</Trans>}
          value={<Trans id="shaman.restoration.av.statistic.disabled">Module disabled</Trans>}
          tooltip={
            <Trans id="shaman.restoration.av.statistic.disabled.reason">
              There were multiple Restoration Shamans with Ancestral Vigor in your raid group, this
              causes major issues with buff tracking. As the results from this module would be very
              inaccurate, it was disabled.
            </Trans>
          }
          category={STATISTIC_CATEGORY.TALENTS}
          position={STATISTIC_ORDER.OPTIONAL(60)}
        />
      );
    } else {
      return (
        <LazyLoadStatisticBox
          loader={this.load.bind(this)}
          icon={<SpellIcon spell={SPELLS.ANCESTRAL_VIGOR} />}
          value={`≈${this.lifeSavingEvents.length}`}
          label={<Trans id="shaman.restoration.av.statistic.label">Lives saved</Trans>}
          tooltip={tooltip}
          category={STATISTIC_CATEGORY.TALENTS}
          position={STATISTIC_ORDER.OPTIONAL(60)}
        >
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>
                  <Trans id="common.time">Time</Trans>
                </th>
                <th>
                  <Trans id="common.player">Player</Trans>
                </th>
                <th style={{ textAlign: 'center' }}>
                  <Trans id="common.ability">Ability</Trans>
                </th>
                <th>
                  <Trans id="common.buffs">Buff(s)</Trans>
                </th>
                <th>
                  <Trans id="common.health">Health</Trans>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.lifeSavingEvents.map((event, index) => {
                const combatant = this.combatants.getEntity(event);
                if (!combatant) {
                  return null;
                }

                // Check presence of buffs in the timeframe
                if (
                  !combatant.hasBuff(SPELLS.DOWNPOUR_HEAL.id, event.timestamp, 100, 50) &&
                  !combatant.hasBuff(SPELLS.ANCESTRAL_VIGOR.id, event.timestamp, 100, 50)
                ) {
                  return null;
                }

                // Check if player only has the bonus HP left
                const currentDownpourIncrease = combatant.hasBuff(
                  SPELLS.DOWNPOUR_HEAL.id,
                  event.timestamp,
                  100,
                  50,
                )
                  ? DOWNPOUR_INCREASED_MAX_HEALTH
                  : 0;
                const currentAncestralVigorIncrease = combatant.hasBuff(
                  SPELLS.ANCESTRAL_VIGOR.id,
                  event.timestamp,
                  100,
                  50,
                )
                  ? ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH
                  : 0;
                const currentBonusHealthRatio =
                  1 - 1 / (1 + currentAncestralVigorIncrease + currentDownpourIncrease);
                const currentHealthRation = (event.hitPoints || NaN) / (event.maxHitPoints || NaN);
                console.log('currentBonusHealthRatio', currentBonusHealthRatio);
                console.log('currentHealthRation', currentHealthRation);
                if (currentHealthRation > currentBonusHealthRatio) {
                  return null;
                }

                const specClassName = combatant.player.type.replace(' ', '');

                return (
                  <tr key={index}>
                    <th scope="row">
                      {formatDuration(event.timestamp - this.owner.fight.start_time, 0)}
                    </th>
                    <td className={specClassName}>{combatant.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <SpellLink spell={abilityToSpell(event.ability)} icon={false}>
                        <Icon icon={event.ability.abilityIcon} />
                      </SpellLink>
                    </td>
                    <td>
                      {combatant.hasBuff(SPELLS.DOWNPOUR_HEAL.id, event.timestamp, 100, 50) && (
                        <>
                          <SpellLink spell={SPELLS.DOWNPOUR_HEAL} icon={false}>
                            <Icon icon={SPELLS.DOWNPOUR_HEAL.icon} />
                          </SpellLink>
                        </>
                      )}
                      {combatant.hasBuff(SPELLS.ANCESTRAL_VIGOR.id, event.timestamp, 100, 50) && (
                        <>
                          <SpellLink spell={TALENTS.ANCESTRAL_VIGOR_TALENT} icon={false}>
                            <Icon icon={TALENTS.ANCESTRAL_VIGOR_TALENT.icon} />
                          </SpellLink>
                        </>
                      )}
                    </td>
                    <td>
                      {formatPercentage((event.hitPoints || NaN) / (event.maxHitPoints || NaN))}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </LazyLoadStatisticBox>
      );
    }
  }
}

export default AncestralVigor;
