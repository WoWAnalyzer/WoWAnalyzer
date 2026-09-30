import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellIcon, SpellLink } from 'interface';
import { TooltipElement } from 'interface/Tooltip';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  GetRelatedEvents,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import GlobalCooldown from '../core/GlobalCooldown';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import {
  AT_BLACKOUT_KICK,
  AT_TIGER_PALM,
  BLACKOUT_KICK_CAST_LINK,
} from '../../normalizers/EventLinks/EventLinkConstants';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';
import { effectiveHealing } from 'parser/shared/modules/HealingValue';
import { WAY_OF_THE_CRANE_TP_STRIKES } from '../../constants';
import {
  XUENS_GUIDANCE_REFUND_CHANCE,
  XUENS_GUIDANCE_TP_INCREASE,
} from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// refunded stacks land ~100ms after the consuming blackout kick
const REFUND_WINDOW_MS = 250;
// a stack gain and its paired refresh land on the same timestamp
const REFRESH_PAIR_WINDOW_MS = 10;

class XuensGuidance extends Analyzer.withDependencies({
  globalCooldown: GlobalCooldown,
}) {
  talent = TALENTS_MONK.XUENS_GUIDANCE_TALENT;
  tigerPalmHealing = 0;
  tigerPalmDamage = 0;
  blackoutKickHealing = 0;
  blackoutKickDamage = 0;
  stacksConsumed = 0;
  pendingRefundedStacks = 0;
  stacksWasted = 0;
  wastedSinceRefund = 0;
  lastStackGain = Number.MIN_SAFE_INTEGER;
  unpairedStackGains = 0;
  stacksRefunded = 0;
  blackoutKicksWithRefund = 0;
  timeSaved = 0; // ms
  stacksPerTigerPalm = 1;
  lastBlackoutKick = Number.MIN_SAFE_INTEGER;
  refundedThisKick = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.WAY_OF_THE_CRANE_TALENT)) {
      this.stacksPerTigerPalm = WAY_OF_THE_CRANE_TP_STRIKES;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK),
      this.onBlackoutKick,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.onStackGained,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.onStackGained,
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.onStackOvercap,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM),
      this.onTigerPalmDamage,
    );
  }

  // refreshes also fire alongside normal stack gains, so a refresh only counts as an overcap
  // when there is no gain on the same timestamp to pair it with
  // only the refunded stacks are blamed since those are what pushed the count up
  onStackOvercap(event: RefreshBuffEvent) {
    if (
      event.timestamp - this.lastStackGain <= REFRESH_PAIR_WINDOW_MS &&
      this.unpairedStackGains > 0
    ) {
      this.unpairedStackGains -= 1;
      return;
    }
    if (this.wastedSinceRefund < this.pendingRefundedStacks) {
      this.stacksWasted += 1;
      this.wastedSinceRefund += 1;
    }
  }

  onBlackoutKick(event: CastEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY.id);
    this.stacksConsumed += stacks;
    if (stacks > 0 && this.pendingRefundedStacks > 0) {
      const refundedShare = Math.min(1, this.pendingRefundedStacks / stacks);
      GetRelatedEvents<DamageEvent>(event, BLACKOUT_KICK_CAST_LINK)
        .filter((damage) => damage.ability.guid === SPELLS.BLACKOUT_KICK_TOTM.id)
        .forEach((damage) => {
          this.blackoutKickDamage += effectiveDamage(damage) * refundedShare;
          this.blackoutKickHealing +=
            GetRelatedEvents<HealEvent>(damage, AT_BLACKOUT_KICK).reduce(
              (sum, heal) => sum + effectiveHealing(heal),
              0,
            ) * refundedShare;
        });
    }
    this.pendingRefundedStacks = 0;
    this.wastedSinceRefund = 0;
    this.lastBlackoutKick = event.timestamp;
    this.refundedThisKick = false;
  }

  onStackGained(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (event.timestamp - this.lastStackGain > REFRESH_PAIR_WINDOW_MS) {
      this.unpairedStackGains = 0;
    }
    this.unpairedStackGains += 1;
    this.lastStackGain = event.timestamp;
    if (event.timestamp - this.lastBlackoutKick > REFUND_WINDOW_MS) {
      return;
    }
    this.stacksRefunded += 1;
    this.pendingRefundedStacks += 1;
    if (!this.refundedThisKick) {
      this.refundedThisKick = true;
      this.blackoutKicksWithRefund += 1;
    }
    this.timeSaved +=
      this.deps.globalCooldown.getGlobalCooldownDuration(SPELLS.TIGER_PALM.id) /
      this.stacksPerTigerPalm;
  }

  onTigerPalmDamage(event: DamageEvent) {
    this.tigerPalmDamage += calculateEffectiveDamage(event, XUENS_GUIDANCE_TP_INCREASE);
    this.tigerPalmHealing += GetRelatedEvents<HealEvent>(event, AT_TIGER_PALM).reduce(
      (sum, heal) => sum + calculateEffectiveHealing(heal, XUENS_GUIDANCE_TP_INCREASE),
      0,
    );
  }

  get healing() {
    return this.tigerPalmHealing + this.blackoutKickHealing;
  }

  get damage() {
    return this.tigerPalmDamage + this.blackoutKickDamage;
  }

  get refundRate() {
    return this.stacksConsumed > 0 ? this.stacksRefunded / this.stacksConsumed : 0;
  }

  get tigerPalmsSaved() {
    return this.stacksRefunded / this.stacksPerTigerPalm;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <ul>
            <li>
              <SpellLink spell={SPELLS.TEACHINGS_OF_THE_MONASTERY} /> stacks consumed:{' '}
              {this.stacksConsumed}
            </li>
            <li>
              Refund chance: {formatPercentage(this.refundRate)}% (expected{' '}
              {formatPercentage(XUENS_GUIDANCE_REFUND_CHANCE)}%)
            </li>
            <li>
              <SpellLink spell={SPELLS.BLACKOUT_KICK} /> casts with a refund:{' '}
              {this.blackoutKicksWithRefund}
            </li>
            <li>
              Refunded stacks wasted by overcapping with <SpellLink spell={SPELLS.TIGER_PALM} />:{' '}
              {this.stacksWasted}
            </li>
            <li>
              <SpellLink spell={SPELLS.TIGER_PALM} /> casts saved:{' '}
              {formatNumber(this.tigerPalmsSaved)} ({formatDuration(this.timeSaved)} of GCDs)
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={this.talent}>
          <div>
            <TooltipElement
              content={
                <>
                  <SpellLink spell={SPELLS.ANCIENT_TEACHINGS} /> healing from the increased{' '}
                  <SpellLink spell={SPELLS.TIGER_PALM} /> damage (
                  {formatNumber(this.tigerPalmHealing)}) and from the{' '}
                  <SpellLink spell={SPELLS.BLACKOUT_KICK_TOTM} /> hits of refunded stacks (
                  {formatNumber(this.blackoutKickHealing)}).
                </>
              }
            >
              <ItemHealingDone amount={this.healing} />
            </TooltipElement>
          </div>
          <div>
            <TooltipElement
              content={
                <>
                  Increased <SpellLink spell={SPELLS.TIGER_PALM} /> damage (
                  {formatNumber(this.tigerPalmDamage)}) and{' '}
                  <SpellLink spell={SPELLS.BLACKOUT_KICK_TOTM} /> hits of refunded stacks (
                  {formatNumber(this.blackoutKickDamage)}).
                </>
              }
            >
              <ItemDamageDone amount={this.damage} />
            </TooltipElement>
          </div>
          <div>
            <SpellIcon spell={SPELLS.TEACHINGS_OF_THE_MONASTERY} /> {this.stacksRefunded}{' '}
            <small>stacks refunded</small>
          </div>
          <div>
            <SpellIcon spell={SPELLS.TIGER_PALM} /> {formatDuration(this.timeSaved)}{' '}
            <small>time saved</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default XuensGuidance;
