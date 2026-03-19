import { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RemoveBuffEvent,
  EventType,
  MaxChargesIncreasedEvent,
  MaxChargesDecreasedEvent,
} from 'parser/core/Events';
import { GetRelatedEvent } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../../Guide';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { formatPercentage } from 'common/format';

const EPIPHANY_BUFF_ID = 414556;

/**
 * Epiphany: Your Holy Words have a 25% chance to make your next Prayer of Mending cost no cooldown.
 */
class Epiphany extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
  };

  protected eventEmitter!: EventEmitter;

  procsGained = 0;
  procsUsed = 0;
  procsWasted = 0;
  private buffActive = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.EPIPHANY_TALENT);
    if (!this.active) return;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EPIPHANY_BUFF),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EPIPHANY_BUFF),
      this.onRemoveBuff,
    );
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    this.procsGained += 1;
    this.buffActive = true;

    // Increase max charges of Prayer of Mending by 1
    this.increaseMaxCharges(event.timestamp);
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const linkedCast = GetRelatedEvent<CastEvent>(event, 'EpiphanyPomCast');
    if (linkedCast) {
      this.procsUsed += 1;
    } else {
      this.procsWasted += 1;
    }
    this.buffActive = false;

    // Decrease max charges of Prayer of Mending by 1
    this.decreaseMaxCharges(event.timestamp);
  }

  private increaseMaxCharges(timestamp: number) {
    const increaseEvent: MaxChargesIncreasedEvent = {
      type: EventType.MaxChargesIncreased,
      timestamp,
      spellId: SPELLS.PRAYER_OF_MENDING_HEAL.id,
      by: 1,
      __fabricated: true,
    };
    this.eventEmitter.fabricateEvent(increaseEvent);
  }

  private decreaseMaxCharges(timestamp: number) {
    const decreaseEvent: MaxChargesDecreasedEvent = {
      type: EventType.MaxChargesDecreased,
      timestamp,
      spellId: SPELLS.PRAYER_OF_MENDING_HEAL.id,
      by: 1,
      __fabricated: true,
    };
    this.eventEmitter.fabricateEvent(decreaseEvent);
  }

  get utilization() {
    return this.procsGained > 0 ? this.procsUsed / this.procsGained : 0;
  }

  get guideSubsection(): JSX.Element {
    if (!this.active) return <></>;

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.EPIPHANY_TALENT} />
        </b>{' '}
        gives your Holy Word spells a 25% chance to make your next{' '}
        <SpellLink spell={SPELLS.PRAYER_OF_MENDING_HEAL} /> cost no cooldown.
        Use Prayer of Mending immediately when you get a proc to avoid wasting it.
      </p>
    );

    const data = (
      <div>
        <strong>Epiphany usage</strong>
        <GradiatedPerformanceBar
          good={{
            count: this.procsUsed,
            label: 'Procs used',
          }}
          bad={{
            count: this.procsWasted,
            label: 'Procs wasted',
          }}
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(14)}
        tooltip={
          <>
            Procs gained: {this.procsGained}<br />
            Procs used: {this.procsUsed}<br />
            Procs wasted: {this.procsWasted}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.EPIPHANY_TALENT}>
          {formatPercentage(this.utilization)}% <small>proc usage</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Epiphany;