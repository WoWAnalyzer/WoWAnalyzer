import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { HasStackChange } from '../../normalizers/CastLinkNormalizer';
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
  castStart = this.owner.fight.start_time;
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
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onRemoveStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_CAST),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onRemoveStack,
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
    if (!event?.prepull) {
      this.castStart = event.timestamp;
    }
    this.castTrackers.push({
      timestamp: event.timestamp,
      stacksConsumed: 0,
      manaRestored: 0,
      channelTime: -1,
    });
    this.manaRestoredSinceLastApply = 0;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const tracker = this.castTrackers.at(-1);
    if (!tracker) {
      return;
    }
    tracker.channelTime = event.timestamp - this.castStart;
    tracker.manaRestored = this.manaRestoredSinceLastApply;
    this.castStart = -1;
  }

  onRemoveStack(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_CAST, event.timestamp, 50)) {
      this.castTrackers.at(-1)!.stacksConsumed += 1;
    }
  }

  onManaRestored(event: ResourceChangeEvent) {
    this.manaRestoredSinceLastApply += event.resourceChange;
  }

  onStackWaste(event: RefreshBuffEvent) {
    if (!HasStackChange(event)) {
      this.stacksWasted += 1;
    }
  }

  get avgManaRestored() {
    if (this.castTrackers.length === 0) {
      return 0;
    }
    return this.totalManaRestored / this.castTrackers.length;
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

  get totalManaRestored() {
    return this.castTrackers.reduce((sum, acc) => sum + acc.manaRestored, 0);
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
            <div>Total mana restored: {formatNumber(this.totalManaRestored)}</div>
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
            <ItemManaGained amount={this.totalManaRestored} useAbbrev customLabel="mana" />
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
