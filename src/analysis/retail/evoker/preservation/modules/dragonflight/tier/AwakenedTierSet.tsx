import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { getLifesparkLivingFlame } from '../../../normalizers/CastLinkNormalizer';
import { TIERS } from 'game/TIERS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import DonutChart from 'parser/ui/DonutChart';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemSetLink from 'interface/ItemSetLink';
import { EVOKER_DF4_ID } from 'common/ITEMS/dragonflight';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SpellLink } from 'interface';
import { InformationIcon } from 'interface/icons';
import Soup from 'interface/icons/Soup';
import Flask from 'interface/icons/Flask';
import Events, {
  HealEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
  ApplyBuffStackEvent,
  EventType,
} from 'parser/core/Events';

class AwakenedPrevokerSet extends Analyzer {
  //2p
  reversionHealingAdded: number = 0;
  totalReversionTicks: number = 0;
  buffedReversionTicks: number = 0;
  //4p
  totalLifesparkGenerated: number = 0;
  lifesparksToHeal: number = 0;
  totalLifesparkHealing: number = 0;
  lifesparksToDamage: number = 0;
  totalLifesparkDamage: number = 0;
  lifesparksLostRefresh: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.DF4);

    //2p
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.REVERSION_TALENT, SPELLS.REVERSION_ECHO]),
      this.onReversionHeal,
    );

    //4p
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LIFESPARK),
      this.gainLifesparkStack,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.LIFESPARK),
      this.gainLifesparkStack,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.LIFESPARK),
      this.gainLifesparkStack,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LIFESPARK),
      this.consumeLifesparkStack,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.LIFESPARK),
      this.consumeLifesparkStack,
    );
  }

  //2p
  get twoPieceUptime() {
    return (
      Math.trunc(
        (this.selectedCombatant.getBuffUptime(SPELLS.TIME_BENDER.id) / this.owner.fightDuration) *
          1000,
      ) / 10
    );
  }

  onReversionHeal(event: HealEvent) {
    this.totalReversionTicks += 1;
    if (this.selectedCombatant.hasBuff(SPELLS.TIME_BENDER.id)) {
      this.buffedReversionTicks += 1;
      this.reversionHealingAdded += event.amount / 3;
    }
  }

  //4p
  gainLifesparkStack(event: ApplyBuffEvent | RefreshBuffEvent | ApplyBuffStackEvent) {
    this.totalLifesparkGenerated += 1;
    if (event.type === EventType.RefreshBuff) {
      this.lifesparksLostRefresh += 1;
    }
  }

  consumeLifesparkStack(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const LifesparkLivingFlame = getLifesparkLivingFlame(event);
    if (LifesparkLivingFlame) {
      if (LifesparkLivingFlame.type === 'damage') {
        this.lifesparksToDamage += 1;
        this.totalLifesparkDamage += LifesparkLivingFlame.amount / 3;
      } else if (LifesparkLivingFlame.type === 'heal') {
        this.lifesparksToHeal += 1;
        this.totalLifesparkHealing += LifesparkLivingFlame.amount / 3;
      }
    }
  }

  //display
  renderDonutChart() {
    const wastedLifesparks =
      this.totalLifesparkGenerated - this.lifesparksToHeal - this.lifesparksToDamage;
    const items = [
      {
        color: '#02b30e',
        label: 'Healing',
        value: this.lifesparksToHeal,
        valueTooltip: <ItemHealingDone amount={this.totalLifesparkHealing} />,
      },
      {
        color: '#e32214',
        label: 'Damage',
        value: this.lifesparksToDamage,
        valueTooltip: <ItemDamageDone amount={this.totalLifesparkDamage} />,
      },
      {
        color: '#888a88',
        label: 'Wasted Procs',
        value: wastedLifesparks,
        valueTooltip:
          this.lifesparksLostRefresh +
          ' lost to early refresh, ' +
          (wastedLifesparks - this.lifesparksLostRefresh) +
          ' expired',
      },
    ]
      .filter((item) => {
        return item.value > 0;
      })
      .sort((a, b) => {
        return Math.sign(b.value - a.value);
      });
    return <DonutChart items={items} />;
  }

  statistic() {
    const reversionTicksBuffed = Math.floor(
      (this.buffedReversionTicks * 100) / this.totalReversionTicks,
    );

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <div className="pad">
          <label>
            <ItemSetLink id={EVOKER_DF4_ID}>Scales of the Awakened</ItemSetLink>
          </label>
          <br />
          <h3>
            2 Set: <SpellLink spell={SPELLS.TIME_BENDER} />
          </h3>
          <div className="value">
            <Soup /> {this.twoPieceUptime}% <small>uptime</small>
          </div>
          <div className="value">
            <ItemHealingDone amount={this.reversionHealingAdded} />
          </div>
          <div className="value">
            <InformationIcon /> {reversionTicksBuffed}%{' '}
            <small>
              of <SpellLink spell={TALENTS_EVOKER.REVERSION_TALENT} /> ticks buffed
            </small>
          </div>
          <br />
          <h3>
            4 Set: <SpellLink spell={SPELLS.LIFESPARK} />
          </h3>
          <div className="value">
            <Flask /> {this.totalLifesparkGenerated} <small>total procs generated</small>
          </div>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default AwakenedPrevokerSet;
