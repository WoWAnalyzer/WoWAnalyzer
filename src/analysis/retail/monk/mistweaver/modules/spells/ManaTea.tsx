import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  HasStackChange,
  getManaTeaChannelDuration,
  getManaTeaStacksConsumed,
} from '../../normalizers/CastLinkNormalizer';
import { MANA_TEA_MAX_STACKS } from '../../constants';
import Haste from 'parser/shared/modules/Haste';

interface ManaTeaTracker {
  timestamp: number;
  stacksConsumed: number;
  manaRestored: number;
  channelTime: number | undefined;
}

class ManaTea extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    haste: Haste,
  };

  protected haste!: Haste;

  manaRestoredMT = 0;
  manateaCount = 0;
  casts: Map<string, number> = new Map<string, number>();
  castTrackers: ManaTeaTracker[] = [];
  stacksWasted = 0;
  manaRestoredSinceLastApply = 0;
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_CAST),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onStackWaste,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_CAST),
      this.onManaRestored,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.manateaCount += 1; //count the number of mana teas to make an average over teas
    this.castTrackers.push({
      timestamp: event.timestamp,
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

  get avgManaRestored() {
    return this.manaRestoredMT / this.manateaCount || 0;
  }

  get avgChannelDuration() {
    let totalValid = 0;
    let totalDuration = 0;
    this.castTrackers.forEach((tracker) => {
      if (tracker !== undefined && tracker.channelTime !== undefined) {
        totalValid += 1;
        totalDuration += tracker.channelTime;
      } else {
        console.warn('Undefined tracker or channel time in Mana Tea analysis');
      }
    });
    return totalDuration / totalValid;
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
            <ItemManaGained amount={this.manaRestoredMT} useAbbrev customLabel="mana" />
          </div>
          <div></div>
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
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ManaTea;
