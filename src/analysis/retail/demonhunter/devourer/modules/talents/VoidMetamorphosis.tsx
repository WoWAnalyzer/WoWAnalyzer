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
import { formatNumber, formatPercentage } from 'common/format';
import { PerformanceMark } from 'interface/guide';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import Haste from 'parser/shared/modules/Haste';

interface VoidMetamorphosisTracker {
  startTimestamp: number;
  endTimestamp: number;
  totalCasts: number;
  totalCullCasts: number;
  smuggledToll: boolean;
}

interface castBreakdownItem {
  performance: QualitativePerformance;
  checklistItem: CooldownExpandableItem;
}

class VoidMetamorphosis extends Analyzer.withDependencies({
  alwaysBeCasting: AlwaysBeCasting,
  haste: Haste,
}) {
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

    this.addEventListener(Events.death.to(SELECTED_PLAYER), this._onFightEndOrDeath);

    this.addEventListener(Events.fightend, this._onFightEndOrDeath);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._onCast);
  }

  private _onVoidMetamorphosisCast(event: CastEvent) {
    const smuggledToll = this.selectedCombatant.hasBuff(SPELLS.REAPERS_TOLL_BUFF);

    this._castTrackers.push({
      startTimestamp: event.timestamp,
      endTimestamp: 0,
      totalCasts: 0,
      totalCullCasts: 0,
      smuggledToll: smuggledToll,
    });
  }

  private _onFightEndOrDeath(event: DeathEvent | FightEndEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.VOID_METAMORPHOSIS_BUFF)) {
      return;
    }
    this._castTrackers.at(-1)!.endTimestamp = event.timestamp;
  }

  private _onVoidMetamorphosisEnd(event: RemoveBuffEvent) {
    this._castTrackers.at(-1)!.endTimestamp = event.timestamp;
  }

  private _onCast(cast: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.VOID_METAMORPHOSIS_BUFF)) {
      return;
    }

    if (cast.ability.guid === SPELLS.CULL.id) {
      this._castTrackers.at(-1)!.totalCullCasts += 1;
    }

    // Filtering out off-gcd spells
    const ignoredSpellsIds = [
      TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT.id,
      SPELLS.BLUR.id,
      SPELLS.SOUL_FRAGMENT_2.id,
    ];

    if (!ignoredSpellsIds.includes(cast.ability.guid)) {
      console.log('cast', cast.ability, cast.timestamp);
      this._castTrackers.at(-1)!.totalCasts += 1;
    }
  }

  private get _buffHistory() {
    return this.selectedCombatant.getBuffHistory(SPELLS.VOID_METAMORPHOSIS_BUFF.id);
  }

  private _computeExpectedCullCasts(cast: VoidMetamorphosisTracker): number {
    // // expected Cull cpm at 0 haste (during Void Metamorphosis)
    // // This was discussed with Voodoo, wowhead and icyveins guide writer and theorycrafter for Devour
    // const baseCullExpectedCpm = 16;

    // // factoring in haste
    // // 10% of Haste gives 6 additional casts every minute which will roughly translate to 2 additional Cull casts

    // // apply to Void Metamorphosis length
    // const expectedCullCasts = Math.round((cast.endTimestamp - cast.startTimestamp) / 1000 * baseCullExpectedCpm / 60)

    const expectedCullCastShare = 0.33;
    const expectedCullCasts = Math.round(cast.totalCasts * expectedCullCastShare);

    console.log('cull', expectedCullCasts, cast.totalCasts, cast.totalCullCasts);
    return expectedCullCasts;
  }

  private _getCullItem(cast: VoidMetamorphosisTracker): castBreakdownItem {
    const expectedCullCasts = this._computeExpectedCullCasts(cast);

    let cullPerformance = QualitativePerformance.Fail;
    if (cast.totalCullCasts >= expectedCullCasts) {
      cullPerformance = QualitativePerformance.Perfect;
    } else if (cast.totalCullCasts >= expectedCullCasts - 2) {
      cullPerformance = QualitativePerformance.Good;
    } else if (cast.totalCullCasts >= expectedCullCasts - 4) {
      cullPerformance = QualitativePerformance.Ok;
    }

    const cullChecklistItem: CooldownExpandableItem = {
      label: <>Cull casts</>,
      result: <PerformanceMark perf={cullPerformance} />,
      details: <>{formatNumber(cast.totalCullCasts)}</>,
    };

    return { performance: cullPerformance, checklistItem: cullChecklistItem };
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

    const cullItem = this._getCullItem(cast);
    performances.push(cullItem.performance);
    checklistItems.push(cullItem.checklistItem);

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
