import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { getZenPulseHitsPerCast, isZenPulseConsumed } from '../../normalizers/CastLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import { TooltipElement } from 'interface/Tooltip';
import { formatNumber, formatPercentage } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { ZEN_PULSE_INCREASE_PER_STACK, ZEN_PULSE_MAX_HITS_FOR_BOOST } from '../../constants';

const MAX_STACKS = 2;

class ZenPulse extends Analyzer {
  zenPulseHits: number = 0;
  healing: number = 0;
  overhealing: number = 0;
  wastedBuffs: number = 0;
  currentBuffs: number = 0;
  consumedBuffs: number = 0;
  badCasts: number = 0;
  castIncreases: number[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_HEAL),
      this.onHeal,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onViv);

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onRemoveBuff,
    );
  }

  get avgHitsPerConsume() {
    return this.zenPulseHits / this.castIncreases.length;
  }

  get avgIncrease() {
    return (
      this.castIncreases.reduce((sum, increase) => sum + increase, 0) / this.castIncreases.length
    );
  }

  get avgHealingPerCast() {
    return this.healing / this.castIncreases.length;
  }

  get avgRawHealingPerCast() {
    return (this.healing + this.overhealing) / this.consumedBuffs;
  }

  private onApplyBuff(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.currentBuffs += 1;
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    if (this.currentBuffs === MAX_STACKS) {
      this.wastedBuffs = +1;
    }
  }

  private onRemoveBuff(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (isZenPulseConsumed(event)) {
      this.consumedBuffs += 1;
      this.currentBuffs -= 1;
    } else {
      this.wastedBuffs += 1;
      this.currentBuffs = 0;
    }
  }

  private onHeal(event: HealEvent) {
    this.zenPulseHits += 1;
    this.healing += event.amount + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  private onViv(event: HealEvent) {
    const zenPulseHits = getZenPulseHitsPerCast(event);
    if (!zenPulseHits.length) {
      return;
    }
    if (zenPulseHits.length < ZEN_PULSE_MAX_HITS_FOR_BOOST) {
      this.badCasts += 1;
    }
    this.castIncreases.push(
      Math.min(zenPulseHits.length, ZEN_PULSE_MAX_HITS_FOR_BOOST) * ZEN_PULSE_INCREASE_PER_STACK,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>Effective healing: {formatNumber(this.healing)}</li>
              <li>Overhealing: {formatNumber(this.overhealing)}</li>
              <li>Average increase: {formatPercentage(this.avgIncrease)}%</li>
              <li>
                Buffs used below {ZEN_PULSE_MAX_HITS_FOR_BOOST}{' '}
                <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
                s: {this.badCasts}
              </li>
              <li>Wasted Buffs: {this.wastedBuffs}</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.ZEN_PULSE_TALENT}>
          <ItemHealingDone amount={this.healing} />
          <hr />
          {this.avgHitsPerConsume.toFixed(2)}{' '}
          <small>
            Average hits per <SpellLink spell={SPELLS.VIVIFY} />
          </small>
          <div></div>
          <TooltipElement
            content={
              <>
                {formatNumber(this.avgRawHealingPerCast)} <small>raw healing per cast</small>
              </>
            }
          >
            {formatNumber(this.avgHealingPerCast)} <small>healing per cast</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ZenPulse;
