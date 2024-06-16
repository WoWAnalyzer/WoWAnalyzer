import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink, TooltipElement } from 'interface';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  HealEvent,
  RefreshBuffEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemManaGained from 'parser/ui/ItemManaGained';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import RenewingMistDuringManaTea from './RenewingMistDuringManaTea';
import { PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import {
  HasStackChange,
  getManaTeaChannelDuration,
  getManaTeaStacksConsumed,
} from '../../normalizers/CastLinkNormalizer';
import { MANA_TEA_MAX_STACKS, MANA_TEA_REDUCTION } from '../../constants';
import Haste from 'parser/shared/modules/Haste';

interface ManaTeaTracker {
  timestamp: number;
  manaSaved: number;
  totalVivifyCleaves: number;
  numVivifyCasts: number;
  overhealing: number;
  healing: number;
  stacksConsumed: number;
  manaRestored: number;
  channelTime: number | undefined;
}

class ManaTea extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    renewingMistDuringManaTea: RenewingMistDuringManaTea,
    haste: Haste,
  };

  protected renewingMistDuringManaTea!: RenewingMistDuringManaTea;
  protected haste!: Haste;

  manaSavedMT: number = 0;
  manaRestoredMT: number = 0;
  manateaCount: number = 0;
  casts: Map<string, number> = new Map<string, number>();
  castTrackers: ManaTeaTracker[] = [];
  effectiveHealing: number = 0;
  manaPerManaTeaGoal: number = 0;
  overhealing: number = 0;
  stacksWasted: number = 0;
  manaRestoredSinceLastApply: number = 0;
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    if (!this.active) {
      return;
    }
    this.manaPerManaTeaGoal = this.selectedCombatant.hasTalent(
      TALENTS_MONK.REFRESHING_JADE_WIND_TALENT,
    )
      ? 6700
      : 7500;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.handleCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.heal);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onStackWaste,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onVivHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onVivCast);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_CAST),
      this.onManaRestored,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.manateaCount += 1; //count the number of mana teas to make an average over teas
    this.castTrackers.push({
      timestamp: event.timestamp,
      totalVivifyCleaves: 0,
      numVivifyCasts: 0,
      manaSaved: 0,
      healing: 0,
      overhealing: 0,
      stacksConsumed: getManaTeaStacksConsumed(event),
      manaRestored: this.manaRestoredSinceLastApply,
      channelTime: event?.prepull
        ? this.estimatedChannelTime(event)
        : getManaTeaChannelDuration(event),
    });
    this.manaRestoredSinceLastApply = 0;
  }

  private estimatedChannelTime(event: ApplyBuffEvent): number {
    const channelTimePerTick =
      (this.selectedCombatant.hasTalent(TALENTS_MONK.ENERGIZING_BREW_TALENT) ? 0.25 : 0.5) /
      (1 + this.haste.current);
    return channelTimePerTick * getManaTeaStacksConsumed(event);
  }

  heal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_BUFF.id)) {
      //if this is in a mana tea window
      this.effectiveHealing += (event.amount || 0) + (event.absorbed || 0);
      this.castTrackers.at(-1)!.healing += (event.amount || 0) + (event.absorbed || 0);
      this.castTrackers.at(-1)!.overhealing += event.overheal || 0;
      this.overhealing += event.overheal || 0;
    }
  }

  handleCast(event: CastEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_BUFF.id) ||
      event.resourceCost == null ||
      event.resourceCost[RESOURCE_TYPES.MANA.id] == null ||
      event.resourceCost[RESOURCE_TYPES.MANA.id] === 0
    ) {
      return;
    }
    const actualCost = event.resourceCost[RESOURCE_TYPES.MANA.id];
    const preMTCost = event.resourceCost[RESOURCE_TYPES.MANA.id] / (1 - MANA_TEA_REDUCTION);
    const manaSaved = preMTCost - actualCost;
    this.manaSavedMT += manaSaved;
    this.castTrackers.at(-1)!.manaSaved += manaSaved;
  }

  onVivCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_BUFF.id)) {
      return;
    }
    this.castTrackers.at(-1)!.totalVivifyCleaves -= 1; // this is overcounted in vivHeal func
    this.castTrackers.at(-1)!.numVivifyCasts += 1;
  }

  onVivHeal(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_BUFF.id)) {
      return;
    }
    this.castTrackers.at(-1)!.totalVivifyCleaves += 1;
  }

  onManaRestored(event: ResourceChangeEvent) {
    this.manaRestoredSinceLastApply += event.resourceChange;
    this.manaRestoredMT += event.resourceChange;
  }

  onStackWaste(event: RefreshBuffEvent) {
    if (
      HasStackChange(event) ||
      this.selectedCombatant.getBuffStacks(SPELLS.MANA_TEA_STACK.id, event.timestamp) <
        MANA_TEA_MAX_STACKS
    ) {
      return;
    }

    this.stacksWasted += 1;
  }

  get avgMtSaves() {
    return this.manaSavedMT / this.manateaCount || 0;
  }

  get avgManaRestored() {
    return this.manaRestoredMT / this.manateaCount || 0;
  }

  get avgChannelDuration() {
    let totalValid = 0;
    let totalDuration = 0;
    this.castTrackers.forEach((tracker) => {
      if (tracker !== undefined) {
        totalValid += 1;
        totalDuration += tracker.channelTime!;
      }
    });
    return totalDuration / totalValid;
  }

  get avgOverhealing() {
    return parseFloat(
      (this.overhealing / (this.overhealing + this.effectiveHealing) || 0).toFixed(4),
    );
  }

  getCastOverhealingPercent(cast: ManaTeaTracker) {
    return cast.overhealing / (cast.overhealing + cast.healing);
  }

  get guideCastBreakdown() {
    const explanationPercent = 55;
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} />
        </strong>{' '}
        Need to update me!
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTrackers.map((cast, ix) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} />
            </>
          );
          const checklistItems: CooldownExpandableItem[] = [];
          let manaPerf = QualitativePerformance.Good;
          if (cast.manaSaved < 20000) {
            manaPerf = QualitativePerformance.Ok;
          } else if (cast.manaSaved < 15000) {
            manaPerf = QualitativePerformance.Fail;
          }
          checklistItems.push({
            label: (
              <>
                Mana saved during <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} />
              </>
            ),
            result: <PerformanceMark perf={manaPerf} />,
            details: <>{formatNumber(cast.manaSaved)}</>,
          });
          const overhealingPercent = this.getCastOverhealingPercent(cast);
          let overhealingPerf = QualitativePerformance.Good;
          if (overhealingPercent > 0.65) {
            overhealingPerf = QualitativePerformance.Fail;
          } else if (overhealingPercent > 0.55) {
            overhealingPerf = QualitativePerformance.Ok;
          }
          checklistItems.push({
            label: (
              <>
                Overhealing during <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} />
              </>
            ),
            result: <PerformanceMark perf={overhealingPerf} />,
            details: <>{formatPercentage(overhealingPercent)}%</>,
          });
          const allPerfs = [manaPerf, overhealingPerf];
          if (cast.numVivifyCasts > 0) {
            const avgCleaves = cast.totalVivifyCleaves / cast.numVivifyCasts;
            let vivCleavePerf = QualitativePerformance.Good;
            if (avgCleaves < 8) {
              vivCleavePerf = QualitativePerformance.Ok;
            } else if (avgCleaves < 6) {
              vivCleavePerf = QualitativePerformance.Fail;
            }
            checklistItems.push({
              label: (
                <>
                  Avg <SpellLink spell={SPELLS.VIVIFY} /> cleaves per cast
                </>
              ),
              result: <PerformanceMark perf={vivCleavePerf} />,
              details: <>{avgCleaves.toFixed(1)}</>,
            });
            allPerfs.push(vivCleavePerf);
          }

          const lowestPerf = getLowestPerf(allPerfs);
          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={lowestPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, explanationPercent);
  }

  get totalManaSaved() {
    return this.manaSavedMT + this.manaRestoredMT;
  }

  get avgStacks() {
    return (
      this.castTrackers.reduce(
        (prev: number, cur: ManaTeaTracker) => prev + cur.stacksConsumed,
        0,
      ) / this.castTrackers.length
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(9)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>Total mana saved: {formatNumber(this.manaSavedMT)}</div>
            <div>Total mana restored: {formatNumber(this.manaRestoredMT)}</div>
            <div>
              Average <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> stacks:{' '}
              {this.avgStacks.toFixed(1)}
            </div>
            <div>Average channel duration: {(this.avgChannelDuration / 1000).toFixed(1)}s</div>
            <div>Total wasted stacks: {this.stacksWasted}</div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MANA_TEA_TALENT}>
          <div>
            <ItemManaGained amount={this.totalManaSaved} useAbbrev customLabel="mana" />
          </div>
          <div>
            <TooltipElement
              content={
                <>
                  This is the mana saved from the mana reduction provided by{' '}
                  <SpellLink spell={SPELLS.MANA_TEA_CAST} />
                </>
              }
            >
              {formatNumber(this.avgMtSaves)} <small>mana saved per cast</small>
            </TooltipElement>
          </div>
          <div>
            <TooltipElement
              content={
                <>
                  This is the mana restored from channeling{' '}
                  <SpellLink spell={SPELLS.MANA_TEA_CAST} />
                </>
              }
            >
              {formatNumber(this.avgManaRestored)} <small> mana restored per cast</small>
            </TooltipElement>
          </div>
          <div>{this.renewingMistDuringManaTea.subStatistic()}</div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ManaTea;
