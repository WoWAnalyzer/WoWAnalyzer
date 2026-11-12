import { Trans } from '@lingui/react/macro';
import fetchWcl from 'common/fetchWclApi';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { Talent } from 'common/TALENTS/types';
import { WCLEventsResponse, WclOptions } from 'common/WCL_TYPES';
import { abilityToSpell } from 'common/abilityToSpell';
import SPECS from 'game/SPECS';
import { Icon, SpellLink } from 'interface';
import { useResults } from 'interface/report/Results/ResultsContext';
import Analyzer from 'parser/core/Analyzer';
import { DamageEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { ReactNode, useState } from 'react';
import { ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH } from '../../constants';

/**
 * A hit is only survivable thanks to Ancestral Vigor if it leaves the target at or below this
 * share of their (buffed) max health: 1 - 1 / 1.1 ≈ 9.09%.
 */
const HP_THRESHOLD = 1 - 1 / (1 + ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH);
/** Buffer and minimal active time (ms) used when checking for the buff at a damage event. */
const BUFF_BUFFER_MS = 100;
const BUFF_MINIMAL_ACTIVE_MS = 50;

interface LazyLoadStatisticProps {
  loader: () => Promise<unknown>;
  loaded: boolean;
  talent: Talent;
  /** The value to show once loaded. */
  children: ReactNode;
  tooltip?: ReactNode;
  /** Only shown once loaded. */
  dropdown?: ReactNode;
  // read from the returned element by the results page, so they have to live on this component
  category?: STATISTIC_CATEGORY;
  position?: number;
}

/**
 * A `Statistic` that only runs its (expensive) WCL query once the user clicks it.
 */
const LazyLoadStatistic = ({
  loader,
  loaded,
  talent,
  children,
  dropdown,
  ...others
}: LazyLoadStatisticProps) => {
  const [loading, setLoading] = useState(false);
  const { generateResults } = useResults();

  const handleClick = () => {
    if (loaded || loading) {
      return;
    }
    setLoading(true);
    loader()
      .then(() => generateResults())
      .catch((error) => console.error('Failed to load statistic', error))
      .finally(() => setLoading(false));
  };

  return (
    <Statistic
      size="flexible"
      onClick={handleClick}
      style={{ cursor: loaded || loading ? undefined : 'pointer' }}
      dropdown={loaded ? dropdown : undefined}
      {...others}
    >
      <TalentSpellText talent={talent}>
        {loaded ? children : loading ? 'Loading...' : 'Click to load'}
      </TalentSpellText>
    </Statistic>
  );
};

class AncestralVigor extends Analyzer.withDependencies({
  combatants: Combatants,
}) {
  loaded = false;
  lifeSavingEvents: DamageEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANCESTRAL_VIGOR_TALENT);
  }

  /**
   * Buff tracking can't tell apart Ancestral Vigor from different Restoration Shamans, so the
   * results would be very inaccurate if another one is talented into it.
   */
  get disabled() {
    return Object.values(this.deps.combatants.getEntities()).some(
      (combatant) =>
        combatant !== this.selectedCombatant &&
        combatant.specId === SPECS.RESTORATION_SHAMAN.id &&
        combatant.hasTalent(TALENTS.ANCESTRAL_VIGOR_TALENT),
    );
  }

  get query(): WclOptions {
    return {
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
          AND ability.id=${SPELLS.ANCESTRAL_VIGOR.id}
          AND source.name='${this.selectedCombatant.name}'
        TO type='${EventType.RemoveBuff}'
          AND ability.id=${SPELLS.ANCESTRAL_VIGOR.id}
          AND source.name='${this.selectedCombatant.name}'
        END
      )`,
      timeout: 2000,
    };
  }

  /** Fetches all candidate events, following `nextPageTimestamp` until the last page. */
  async fetchEvents() {
    const events: DamageEvent[] = [];
    // WCL returns `nextPageTimestamp: null` (not undefined) on the last page
    let start: number | null | undefined = this.owner.fight.start_time;
    while (start) {
      const json = (await fetchWcl(`report/events/${this.owner.report.code}`, {
        ...this.query,
        start,
      })) as WCLEventsResponse;
      events.push(...(json.events as DamageEvent[]));
      start = json.nextPageTimestamp;
    }
    return events;
  }

  /** The WCL filter is only a rough preselection, so verify the buff and health locally. */
  isLifeSaving(event: DamageEvent) {
    const combatant = this.deps.combatants.getEntity(event);
    if (
      !combatant?.hasBuff(
        SPELLS.ANCESTRAL_VIGOR.id,
        event.timestamp,
        BUFF_BUFFER_MS,
        BUFF_MINIMAL_ACTIVE_MS,
      )
    ) {
      return false;
    }
    const healthRatio = (event.hitPoints || NaN) / (event.maxHitPoints || NaN);
    return healthRatio <= HP_THRESHOLD;
  }

  async load() {
    const events = await this.fetchEvents();
    const seen = new Set<string>();
    this.lifeSavingEvents = events
      .filter((event) => {
        // a player can only be saved once per timestamp
        const key = `${event.timestamp}-${event.targetID}`;
        if (seen.has(key) || !this.isLifeSaving(event)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.timestamp - b.timestamp);
    this.loaded = true;
  }

  get lifeSavingEventsTable() {
    return (
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
          {this.lifeSavingEvents.map((event, index) => {
            const combatant = this.deps.combatants.getEntity(event);
            if (!combatant) {
              return null;
            }

            return (
              <tr key={index}>
                <th scope="row">
                  {formatDuration(event.timestamp - this.owner.fight.start_time, 0)}
                </th>
                <td className={combatant.player.type.replace(' ', '')}>{combatant.name}</td>
                <td style={{ textAlign: 'center' }}>
                  <SpellLink spell={abilityToSpell(event.ability)} icon={false}>
                    <Icon icon={event.ability.abilityIcon} />
                  </SpellLink>
                </td>
                <td>{formatPercentage((event.hitPoints || NaN) / (event.maxHitPoints || NaN))}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  statistic() {
    if (this.disabled) {
      return (
        <Statistic
          category={STATISTIC_CATEGORY.TALENTS}
          position={STATISTIC_ORDER.OPTIONAL(60)}
          size="flexible"
          tooltip={
            <Trans id="shaman.restoration.av.statistic.disabled.reason">
              There were multiple Restoration Shamans with Ancestral Vigor in your raid group, this
              causes major issues with buff tracking. As the results from this module would be very
              inaccurate, it was disabled.
            </Trans>
          }
        >
          <TalentSpellText talent={TALENTS.ANCESTRAL_VIGOR_TALENT}>
            <Trans id="shaman.restoration.av.statistic.disabled">Module disabled</Trans>
          </TalentSpellText>
        </Statistic>
      );
    }

    return (
      <LazyLoadStatistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(60)}
        loader={this.load.bind(this)}
        loaded={this.loaded}
        talent={TALENTS.ANCESTRAL_VIGOR_TALENT}
        tooltip={
          this.loaded ? (
            <Trans id="shaman.restoration.av.statistic.tooltip.active">
              The amount of players that would have died without the max health increase from your{' '}
              <SpellLink spell={TALENTS.ANCESTRAL_VIGOR_TALENT} />.
            </Trans>
          ) : (
            <Trans id="shaman.restoration.av.statistic.tooltip.inactive">
              Click to analyze how many lives were saved by the max health increase from your{' '}
              <SpellLink spell={TALENTS.ANCESTRAL_VIGOR_TALENT} />.
            </Trans>
          )
        }
        dropdown={this.lifeSavingEvents.length > 0 ? this.lifeSavingEventsTable : undefined}
      >
        ≈{this.lifeSavingEvents.length}{' '}
        <small>
          <Trans id="shaman.restoration.av.statistic.label">lives saved</Trans>
        </small>
      </LazyLoadStatistic>
    );
  }
}

export default AncestralVigor;
