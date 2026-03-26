import { SPELL_COLORS } from 'analysis/retail/monk/mistweaver/constants';
import { formatNumber, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  CALL_OF_YSERA_DREAM_BREATH_INCREASE,
  CALL_OF_YSERA_LIVING_FLAME_INCREASE,
} from '../../constants';

class CallOfYsera extends Analyzer {
  extraBreathHealing = 0;
  extraLivingFlameHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT);
    if (!this.active) {
      return;
    }
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
  }

  onDreamBreathHeal(event: HealEvent) {
    this.extraBreathHealing += calculateEffectiveHealing(
      event,
      CALL_OF_YSERA_DREAM_BREATH_INCREASE,
    );
  }

  onLivingFlameHeal(event: HealEvent) {
    this.extraLivingFlameHealing += calculateEffectiveHealing(
      event,
      CALL_OF_YSERA_LIVING_FLAME_INCREASE,
    );
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
        label: 'Dream Breath',
        spellId: TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
        value: this.extraBreathHealing,
        valueTooltip: formatThousands(this.extraBreathHealing),
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
                <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> Healing:{' '}
                {formatNumber(this.extraBreathHealing)}
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.CALL_OF_YSERA_TALENT}>
          <ItemHealingDone amount={this.extraBreathHealing + this.extraLivingFlameHealing} />
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
