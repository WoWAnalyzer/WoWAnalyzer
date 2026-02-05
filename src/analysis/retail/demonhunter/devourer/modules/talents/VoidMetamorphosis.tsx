import type { JSX } from 'react';
import SPELLS from 'common/SPELLS/demonhunter';
import { ResourceLink, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { SubSection } from 'interface/guide';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { getAveragePerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatPercentage } from 'common/format';
import { PerformanceMark } from 'interface/guide';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

interface VoidMetamorphosisTracker {
  startTimestamp: number;
  endTimestamp: number;
  totalCullCasts: number;
  smuggledToll: boolean;
}

interface castBreakdownItem {
  performance: QualitativePerformance;
  checklistItem: CooldownExpandableItem;
}

class VoidMetamorphosis extends Analyzer.withDependencies({ alwaysBeCasting: AlwaysBeCasting }) {
  private _castTrackers: VoidMetamorphosisTracker[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOID_METAMORPHOSIS_CAST),
      this._onVoidMetamorphosisCast,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VOID_METAMORPHOSIS_BUFF),
      this._onVoidMetamorphosisEnd,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CULL), this._onCullCast);
  }

  private _onVoidMetamorphosisCast(event: CastEvent) {
    const smuggledToll = this.selectedCombatant.hasBuff(SPELLS.REAPERS_TOLL_BUFF);

    this._castTrackers.push({
      startTimestamp: event.timestamp,
      endTimestamp: 0,
      totalCullCasts: 0,
      smuggledToll: smuggledToll,
    });
  }

  private _onVoidMetamorphosisEnd(event: RemoveBuffEvent) {
    this._castTrackers.at(-1)!.endTimestamp = event.timestamp;
  }

  private _onCullCast() {
    // Cull is only available during Void Metamorphosis
    this._castTrackers.at(-1)!.totalCullCasts += 1;
  }

  private get _buffHistory() {
    return this.selectedCombatant.getBuffHistory(SPELLS.VOID_METAMORPHOSIS_BUFF.id);
  }

  private _getActiveTimeItem(cast: VoidMetamorphosisTracker): castBreakdownItem {
    let activeTimePerformance = QualitativePerformance.Fail;
    const activeTimePercentageDuringWindow =
      this.deps.alwaysBeCasting.getActiveTimePercentageInWindow(
        cast.startTimestamp,
        cast.endTimestamp,
      );

    if (activeTimePercentageDuringWindow >= 0.99) {
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

  private _getCastBreakdownItems(
    cast: VoidMetamorphosisTracker,
  ): [QualitativePerformance[], CooldownExpandableItem[]] {
    const performances: QualitativePerformance[] = [];
    const checklistItems: CooldownExpandableItem[] = [];

    const activeTimeItem = this._getActiveTimeItem(cast);
    performances.push(activeTimeItem.performance);
    checklistItems.push(activeTimeItem.checklistItem);

    return [performances, checklistItems];
  }

  private _castBreakdownGuidePart(): JSX.Element {
    const explanation = (
      <>
        <p>
          As <span className="DemonHunter">Devour</span>, the greater share of your damage is dealt
          during <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />.
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
        {this._castTrackers.map((cast, index) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.startTimestamp)} &mdash;{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />
            </>
          );

          const castBreakdownItems = this._getCastBreakdownItems(cast);
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

  private _uptimeGuidePart(): JSX.Element {
    return (
      <>
        <div>
          <b>Uptime graph</b> - grey segments show when the buff was not active, yellow segments
          show when it was active.
        </div>
        <>
          {uptimeBarSubStatistic(this.owner.fight, {
            spells: [SPELLS.VOID_METAMORPHOSIS_BUFF],
            uptimes: this._buffHistory.map((buff) => ({
              start: buff.start,
              end: buff.end ?? this.owner.fight.end_time,
            })),
          })}
        </>
      </>
    );
  }

  public guideSubsection(): JSX.Element {
    return (
      <SubSection title="Void Metamorphosis">
        {this._uptimeGuidePart()}
        {this._castBreakdownGuidePart()}
      </SubSection>
    );
  }
}

export default VoidMetamorphosis;
