import LivingFlame from 'analysis/retail/evoker/shared/modules/core/LivingFlame';
import { SPELL_COLORS } from 'analysis/retail/monk/mistweaver/constants';
import { formatNumber, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { EmpowerEndEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import DonutChart from 'parser/ui/DonutChart';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  CALL_OF_YSERA_DREAM_BREATH_INCREASE,
  CALL_OF_YSERA_DREAM_LIVING_FLAME_INCREASE,
} from '../../constants';
import {
  isFromDreamBreathCallOfYsera,
  isFromLivingFlameCallOfYsera,
} from '../../normalizers/EventLinking/helpers';
import HotTrackerPrevoker from '../core/HotTrackerPrevoker';
import DreamBreath from './DreamBreath';

class CallOfYsera extends Analyzer {
  static dependencies = {
    dreamBreath: DreamBreath,
    livingFlame: LivingFlame,
    hotTracker: HotTrackerPrevoker,
  };
  protected hotTracker!: HotTrackerPrevoker;
  protected dreamBreath!: DreamBreath;
  protected livingFlame!: LivingFlame;
  buffedDreamBreaths: number = 0;
  extraBreathHealing: number = 0;
  extraBreathHoTHealing: number = 0;
  buffedLivingFlames: number = 0;
  extraLivingFlameHealing: number = 0;
  empoweredDbCasts: number = 0;

  get totalBreathHealing() {
    return this.extraBreathHealing + this.extraBreathHoTHealing;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.empowerEnd
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.DREAM_BREATH_TALENT, SPELLS.DREAM_BREATH_FONT]),
      this.onDBCast,
    );
    //dream breath and dream breath echo healing
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.DREAM_BREATH, SPELLS.DREAM_BREATH_ECHO]),
      this.onDreamBreathHeal,
    );
    //living flame and living flame echo healing
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_HEAL),
      this.onLivingFlameHeal,
    );
    //hot attribution to determine whether a dream breath's hot was buffed by call of ysera or not on application

    //verdant embrace echoes each apply their own call of ysera buff, these are always applied after the initial cast and show up in the log as refresh buff events

    //empowered spell cast ids are applied as removed as a buff event for the duration of their empower
  }

  onDBCast(event: EmpowerEndEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.CALL_OF_YSERA_BUFF.id)) {
      this.empoweredDbCasts += 1;
    }
  }

  get percentDbBuffed() {
    return (this.empoweredDbCasts / this.dreamBreath.totalBreaths) * 100;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentDbBuffed,
      isLessThan: {
        minor: 80,
        average: 70,
        major: 60,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get badCastsThresholds() {
    return {
      actual: this.buffedLivingFlames,
      isGreaterThan: {
        minor: 0,
        average: 3,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onDreamBreathHeal(event: HealEvent) {
    if (!event.tick) {
      if (isFromDreamBreathCallOfYsera(event)) {
        this.extraBreathHealing += calculateEffectiveHealing(
          event,
          CALL_OF_YSERA_DREAM_BREATH_INCREASE,
        );
        this.buffedDreamBreaths += 1;
      }
    }
    const playerId = event.targetID;
    const spellId = event.ability.guid;
    if (!this.hotTracker.hots[playerId] || !this.hotTracker.hots[playerId][spellId]) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][spellId];
    if (this.hotTracker.fromCallOfYsera(hot)) {
      this.extraBreathHoTHealing += calculateEffectiveHealing(
        event,
        CALL_OF_YSERA_DREAM_BREATH_INCREASE,
      );
    }
  }

  onLivingFlameHeal(event: HealEvent) {
    if (isFromLivingFlameCallOfYsera(event)) {
      this.buffedLivingFlames += 1;
      this.extraLivingFlameHealing += calculateEffectiveHealing(
        event,
        CALL_OF_YSERA_DREAM_LIVING_FLAME_INCREASE,
      );
    }
  }

  renderCallOfYseraChart() {
    const items = [
      {
        color: SPELL_COLORS.SOOTHING_MIST,
        label: 'Living Flame',
        spellId: SPELLS.LIVING_FLAME_CAST.id,
        value: this.extraLivingFlameHealing,
        valueTooltip: formatThousands(this.extraLivingFlameHealing),
      },
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Hit',
        spellId: TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
        value: this.extraBreathHealing,
        valueTooltip: formatThousands(this.extraBreathHealing),
      },
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: 'HoT',
        spellId: TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
        value: this.extraBreathHoTHealing,
        valueTooltip: formatThousands(this.extraBreathHoTHealing),
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Call Of Ysera's buff provided the following additional healing:
            <ul>
              <li>
                <SpellLink spell={SPELLS.LIVING_FLAME_CAST} /> Healing:{' '}
                {formatNumber(this.extraLivingFlameHealing)}
              </li>
              <li>
                <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> Hit Healing:{' '}
                {formatNumber(this.extraBreathHealing)}
              </li>
              <li>
                <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> HoT Healing:{' '}
                {formatNumber(this.extraBreathHoTHealing)}
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.CALL_OF_YSERA_TALENT}>
          <ItemHealingDone amount={this.totalBreathHealing + this.extraLivingFlameHealing} />
        </TalentSpellText>
        <div className="pad">
          <SpellLink spell={TALENTS_EVOKER.CALL_OF_YSERA_TALENT}>Sources:</SpellLink>
          {this.renderCallOfYseraChart()}
        </div>
      </Statistic>
    );
  }
}

export default CallOfYsera;
