import type { JSX } from 'react';
import SPELLS from 'common/SPELLS/demonhunter';
import { ResourceLink, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import Events, { CastEvent, DeathEvent, FightEndEvent, RemoveBuffEvent } from 'parser/core/Events';
import { SubSection } from 'interface/guide';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { getAveragePerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatPercentage } from 'common/format';
import { PerformanceMark } from 'interface/guide';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import Abilities from '../Abilities';
import StatTracker from 'parser/shared/modules/StatTracker';

interface VoidMetamorphosisTracker {
  startTimestamp: number;
  endTimestamp: number;
  activeTimeEndTimestamp: number;
  totalCasts: number;
  totalCollapsingStarCasts: number;
  smuggledToll: boolean;
}

interface castBreakdownItem {
  performance: QualitativePerformance;
  checklistItem: CooldownExpandableItem;
}

class VoidMetamorphosis extends Analyzer.withDependencies({
  alwaysBeCasting: AlwaysBeCasting,
  statTracker: StatTracker,
  abilities: Abilities,
}) {
  #castTrackers: VoidMetamorphosisTracker[] = [];
  #hungeringSlashTalented = this.selectedCombatant.hasTalent(
    TALENTS_DEMON_HUNTER.HUNGERING_SLASH_TALENT,
  );

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOID_METAMORPHOSIS_CAST),
      this.#onVoidMetamorphosisCast,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VOID_METAMORPHOSIS_BUFF),
      this.#onVoidMetamorphosisEnd,
    );

    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.#onFightEndOrDeath);

    this.addEventListener(Events.fightend, this.#onFightEndOrDeath);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COLLAPSING_STAR),
      this.#onCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.VOID_RAY_TALENT),
      this.#onVoidRayCast,
    );
  }

  #onVoidMetamorphosisCast(event: CastEvent) {
    const smuggledToll = this.selectedCombatant.hasBuff(SPELLS.REAPERS_TOLL_BUFF);

    this.#castTrackers.push({
      startTimestamp: event.timestamp,
      endTimestamp: 0,
      activeTimeEndTimestamp: 0,
      totalCasts: 0,
      totalCollapsingStarCasts: 0,
      smuggledToll: smuggledToll,
    });
  }

  #onFightEndOrDeath(event: DeathEvent | FightEndEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.VOID_METAMORPHOSIS_BUFF)) {
      return;
    }
    const currentCast = this.#castTrackers.at(-1);
    if (!currentCast) {
      return;
    }

    currentCast.endTimestamp = event.timestamp;
    currentCast.activeTimeEndTimestamp = Math.max(
      currentCast.activeTimeEndTimestamp,
      event.timestamp,
    );
  }

  #onVoidMetamorphosisEnd(event: RemoveBuffEvent) {
    const currentCast = this.#castTrackers.at(-1);
    if (!currentCast) {
      return;
    }

    currentCast.endTimestamp = event.timestamp;
    currentCast.activeTimeEndTimestamp = Math.max(
      currentCast.activeTimeEndTimestamp,
      event.timestamp,
    );
  }

  #onCast(cast: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.VOID_METAMORPHOSIS_BUFF)) {
      return;
    }

    if (cast.ability.guid === SPELLS.COLLAPSING_STAR.id) {
      this.#castTrackers.at(-1)!.totalCollapsingStarCasts += 1;
    }
  }

  #onVoidRayCast(cast: CastEvent) {
    const currentCast = this.#castTrackers.at(-1);
    if (!currentCast) {
      return;
    }

    currentCast.activeTimeEndTimestamp = Math.max(
      currentCast.activeTimeEndTimestamp,
      cast.channel?.timestamp ?? cast.timestamp,
    );
  }

  get #buffHistory() {
    return this.selectedCombatant.getBuffHistory(SPELLS.VOID_METAMORPHOSIS_BUFF.id);
  }

  #getActiveTimeItem(cast: VoidMetamorphosisTracker): castBreakdownItem {
    let activeTimePerformance = QualitativePerformance.Fail;
    const activeTimePercentageDuringWindow =
      this.deps.alwaysBeCasting.getActiveTimePercentageInWindow(
        cast.startTimestamp,
        cast.activeTimeEndTimestamp || cast.endTimestamp,
      );

    if (activeTimePercentageDuringWindow >= 0.98) {
      activeTimePerformance = QualitativePerformance.Perfect;
    } else if (activeTimePercentageDuringWindow >= 0.95) {
      activeTimePerformance = QualitativePerformance.Good;
    } else if (activeTimePercentageDuringWindow >= 0.9) {
      activeTimePerformance = QualitativePerformance.Ok;
    }

    const activeTimeChecklistItem: CooldownExpandableItem = {
      label: <>Active time</>,
      result: <PerformanceMark perf={activeTimePerformance} />,
      details: <>{formatPercentage(activeTimePercentageDuringWindow)}%</>,
    };

    return { performance: activeTimePerformance, checklistItem: activeTimeChecklistItem };
  }

  #getCollapsingStarItem(cast: VoidMetamorphosisTracker): castBreakdownItem {
    let performance = QualitativePerformance.Fail;
    if (cast.totalCollapsingStarCasts >= 5) {
      performance = QualitativePerformance.Perfect;
    } else if (cast.totalCollapsingStarCasts === 4) {
      performance = QualitativePerformance.Good;
    }

    const checklistItem: CooldownExpandableItem = {
      label: (
        <>
          <SpellLink spell={SPELLS.COLLAPSING_STAR} /> casts
        </>
      ),
      result: <PerformanceMark perf={performance} />,
      details: <>{cast.totalCollapsingStarCasts}</>,
    };

    return { performance, checklistItem };
  }

  #getSmugglingItem(cast: VoidMetamorphosisTracker): castBreakdownItem {
    const smugglingPerformance = cast.smuggledToll
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;
    const smugglingChecklistItem: CooldownExpandableItem = {
      label: (
        <>
          Smuggled{' '}
          {this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_DEVOURER_TALENT) ? (
            <SpellLink spell={TALENTS_DEMON_HUNTER.THE_HUNT_DEVOURER_TALENT} />
          ) : (
            <SpellLink spell={SPELLS.HUNGERING_SLASH_CAST} />
          )}
        </>
      ),
      result: <PerformanceMark perf={smugglingPerformance} />,
      details: <>{cast.smuggledToll ? 'Yes' : 'No'}</>,
    };

    return { performance: smugglingPerformance, checklistItem: smugglingChecklistItem };
  }

  #getCastBreakdownItems(
    cast: VoidMetamorphosisTracker,
  ): [QualitativePerformance[], CooldownExpandableItem[]] {
    const performances: QualitativePerformance[] = [];
    const checklistItems: CooldownExpandableItem[] = [];

    const activeTimeItem = this.#getActiveTimeItem(cast);
    performances.push(activeTimeItem.performance);
    checklistItems.push(activeTimeItem.checklistItem);

    const collapsingStarItem = this.#getCollapsingStarItem(cast);
    performances.push(collapsingStarItem.performance);
    checklistItems.push(collapsingStarItem.checklistItem);

    if (this.#hungeringSlashTalented) {
      const smugglingItem = this.#getSmugglingItem(cast);
      performances.push(smugglingItem.performance);
      checklistItems.push(smugglingItem.checklistItem);
    }

    return [performances, checklistItems];
  }

  #castBreakdownGuidePart(): JSX.Element {
    const explanation = (
      <>
        <p>
          As <span className="DemonHunter">Devourer</span>, the greater share of your damage is
          dealt during <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />.
        </p>
        <p>
          During <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />,{' '}
          <ResourceLink id={RESOURCE_TYPES.FURY.id} /> is constantly consumed. Fight this process by
          generating <ResourceLink id={RESOURCE_TYPES.FURY.id} /> using your abilities.{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_RAY_TALENT} />,{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.VOIDBLADE_TALENT} /> and{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.THE_HUNT_DEVOURER_TALENT} /> stop the fury
          drain&mdash; use them on cooldown!
          <div>
            For each window, aim for 4 Collapsing Stars or more. Less than 4 is considered bad,
            while 5+ is perfect.
          </div>
          <div>
            In order to extend <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />{' '}
            the longest, it is mandatory to keep up near-perfect active time.
          </div>
        </p>
        <hr />
        <p>
          <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} /> upgrades{' '}
          <SpellLink spell={SPELLS.REAP} /> to <SpellLink spell={SPELLS.CULL} />. The latter becomes
          uncommonly powerful and should be used as much as possible with 4{' '}
          <SpellLink spell={SPELLS.SOUL_FRAGMENT_DEVOUR} /> or more.
        </p>
        {this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.HUNGERING_SLASH_TALENT) && (
          <>
            <hr />
            <p>
              <SpellLink spell={SPELLS.HUNGERING_SLASH_CAST} /> becomes{' '}
              <SpellLink spell={SPELLS.REAPERS_TOLL_CAST} /> for much higher damage. You can press{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.VOIDBLADE_TALENT} /> or{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.THE_HUNT_DEVOURER_TALENT} /> right before
              entering <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} /> to
              convert one to the other. This allows for at least three{' '}
              <SpellLink spell={SPELLS.REAPERS_TOLL_CAST} /> casts during your cooldown window,
              instead of two. This is referred to as smuggling.
            </p>
          </>
        )}
      </>
    );

    const data = (
      <div>
        <b>Per-Cast Breakdown</b>
        <small> - click to expand</small>
        {this.#castTrackers.map((cast, index) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.startTimestamp)} &mdash;{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />
            </>
          );

          const castBreakdownItems = this.#getCastBreakdownItems(cast);
          const averagePerformance = getAveragePerf(castBreakdownItems[0]);
          const checklistItems = castBreakdownItems[1];

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={averagePerformance}
              key={index}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  #uptimeGuidePart(): JSX.Element {
    return (
      <>
        <div>
          <b>Uptime graph</b> - grey segments show when the buff was not active, yellow segments
          show when it was active.
        </div>
        <>
          {uptimeBarSubStatistic(this.owner.fight, {
            spells: [SPELLS.VOID_METAMORPHOSIS_BUFF],
            uptimes: this.#buffHistory.map((buff) => ({
              start: buff.start,
              end: buff.end ?? this.owner.fight.end_time,
            })),
          })}
        </>
      </>
    );
  }

  guideSubsection(): JSX.Element {
    return (
      <SubSection title="Void Metamorphosis">
        {this.#uptimeGuidePart()}
        {this.#castBreakdownGuidePart()}
      </SubSection>
    );
  }
}

export default VoidMetamorphosis;
