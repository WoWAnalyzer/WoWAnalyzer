/** Earth Elemental
 * Calls forth a Greater Earth Elemental to protect you and your allies, generating high threat and taunting enemies periodically for 30 sec.
 *
 * Primordial Bond
 * Your Earth Elemental no longer taunts nearby enemies or generates threat and instead increases your maximum health by 15% while active.
 *
 */
import { Trans } from '@lingui/react/macro';
import fetchWcl from 'common/fetchWclApi';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { WCLEventsResponse, WclOptions } from 'common/WCL_TYPES';
import { SpellIcon, SpellLink, Icon } from 'interface';
import { DamageEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'parser/ui/LazyLoadStatisticBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { abilityToSpell } from 'common/abilityToSpell';
import {
  MajorDefensiveBuff,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import type { ReactNode } from 'react';

const PRIMORDIAL_BOND_MAX_HEALTH_INCREASE = 0.15;

class EarthElemental extends MajorDefensiveBuff {
  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  loaded = false;
  lifeSavingEvents: DamageEvent[] = [];
  filteredLifeSavingEvents: DamageEvent[] = [];

  constructor(options: Options) {
    super(TALENTS.PRIMORDIAL_BOND_TALENT, buff(SPELLS.PRIMORDIAL_BOND_BUFF), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_BOND_TALENT);
  }

  fetchAll(pathname: string, query: WclOptions) {
    const checkAndFetch = async (_query: WclOptions) => {
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

  load() {
    const HP_THRESHOLD = 1 - 1 / (1 + PRIMORDIAL_BOND_MAX_HEALTH_INCREASE);

    this.lifeSavingEvents = [];
    const query: WclOptions = {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,

      filter: `(
        IN RANGE
        WHEN type='${EventType.Damage}'
          AND target.disposition='friendly'
          AND target.type='player'
          AND resources.hitPoints>0
          AND 100*resources.hpPercent<=${Math.ceil(10000 * HP_THRESHOLD)}
          AND 10000*(resources.hitPoints+effectiveDamage)/resources.maxHitPoints>=${Math.floor(
            10000 * HP_THRESHOLD,
          )}
        FROM type='${EventType.ApplyBuff}'
          AND ability.id=${SPELLS.PRIMORDIAL_BOND_BUFF.id}
          AND source.name='${this.selectedCombatant.name}'
        TO type='${EventType.RemoveBuff}'
          AND ability.id=${SPELLS.PRIMORDIAL_BOND_BUFF.id}
          AND source.name='${this.selectedCombatant.name}'
        END
      )`,
      timeout: 2000,
    };
    return this.fetchAll(`report/events/${this.owner.report.code}`, query);
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={TALENTS.PRIMORDIAL_BOND_TALENT} /> increases your maximum health by 15%
        while active.
      </p>
    );
  }

  statistic() {
    const tooltip = this.loaded ? (
      <Trans id="shaman.shared.primordialBond.statistic.tooltip.active">
        The amount of players that would have died without your max health increase from{' '}
        <SpellLink spell={TALENTS.PRIMORDIAL_BOND_TALENT} />.
      </Trans>
    ) : (
      <Trans id="shaman.shared.primordialBond.statistic.tooltip.inactive">
        Click to analyze how many times a live was saved by the max health increase from{' '}
        <SpellLink spell={TALENTS.PRIMORDIAL_BOND_TALENT} />.
      </Trans>
    );

    this.lifeSavingEvents.forEach((event) => {
      const combatant = this.combatants.getEntity(event);
      if (!combatant) {
        return;
      }
      if (this.filteredLifeSavingEvents.find((e) => e.timestamp === event.timestamp)) {
        return;
      }
      if (!combatant.hasBuff(SPELLS.PRIMORDIAL_BOND_BUFF.id, event.timestamp, 100, 50)) {
        return;
      }

      const currentHealthRatio = (event.hitPoints || NaN) / (event.maxHitPoints || NaN);
      const bonusHealthRatio = 1 - 1 / (1 + PRIMORDIAL_BOND_MAX_HEALTH_INCREASE);
      if (currentHealthRatio > bonusHealthRatio) {
        return;
      }
      this.filteredLifeSavingEvents.push(event);
    });
    this.filteredLifeSavingEvents.sort((a, b) => a.timestamp - b.timestamp);

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon spell={TALENTS.PRIMORDIAL_BOND_TALENT} />}
        value={`≈${this.filteredLifeSavingEvents.length}`}
        label={<Trans id="shaman.shared.primordialBond.statistic.label">Lives saved</Trans>}
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
                <Trans id="common.health">Health</Trans>
              </th>
            </tr>
          </thead>
          <tbody>
            {this.filteredLifeSavingEvents.map((event, index) => {
              const combatant = this.combatants.getEntity(event);

              if (!combatant) {
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

export default EarthElemental;
