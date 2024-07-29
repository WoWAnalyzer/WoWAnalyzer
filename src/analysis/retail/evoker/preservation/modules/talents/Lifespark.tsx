import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { getLifesparkLivingFlame } from '../../normalizers/EventLinking/helpers';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import DonutChart from 'parser/ui/DonutChart';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Flask from 'interface/icons/Flask';
import Events, {
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
  ApplyBuffStackEvent,
  EventType,
} from 'parser/core/Events';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { LIFESPARK_INCREASE } from '../../constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

class Lifespark extends Analyzer {
  totalLifesparkGenerated: number = 0;
  lifesparksToHeal: number = 0;
  totalLifesparkHealing: number = 0;
  lifesparksToDamage: number = 0;
  totalLifesparkDamage: number = 0;
  lifesparksLostRefresh: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.LIFESPARK_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LIFESPARK_BUFF),
      this.gainLifesparkStack,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.LIFESPARK_BUFF),
      this.gainLifesparkStack,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.LIFESPARK_BUFF),
      this.gainLifesparkStack,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LIFESPARK_BUFF),
      this.consumeLifesparkStack,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.LIFESPARK_BUFF),
      this.consumeLifesparkStack,
    );
  }

  gainLifesparkStack(event: ApplyBuffEvent | RefreshBuffEvent | ApplyBuffStackEvent) {
    this.totalLifesparkGenerated += 1;
    if (event.type === EventType.RefreshBuff) {
      this.lifesparksLostRefresh += 1;
    }
  }

  consumeLifesparkStack(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const lfEvent = getLifesparkLivingFlame(event);
    if (lfEvent) {
      if (lfEvent.type === EventType.Damage) {
        this.lifesparksToDamage += 1;
        this.totalLifesparkDamage += calculateEffectiveDamage(lfEvent, LIFESPARK_INCREASE);
      } else if (lfEvent.type === EventType.Heal) {
        this.lifesparksToHeal += 1;
        this.totalLifesparkHealing += calculateEffectiveHealing(lfEvent, LIFESPARK_INCREASE);
      }
    }
  }

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
        valueTooltip: (
          <>
            {this.lifesparksLostRefresh} lost to early refresh,{' '}
            {wastedLifesparks - this.lifesparksLostRefresh} expired
          </>
        ),
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
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div>
          <TalentSpellText talent={TALENTS_EVOKER.LIFESPARK_TALENT}>
            <div>
              <Flask /> {this.totalLifesparkGenerated} <small>total procs generated</small>
            </div>
          </TalentSpellText>
          <div className="pad">{this.renderDonutChart()}</div>
        </div>
      </Statistic>
    );
  }
}

export default Lifespark;
