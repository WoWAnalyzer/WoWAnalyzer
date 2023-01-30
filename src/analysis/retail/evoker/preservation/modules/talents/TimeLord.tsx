import { formatNumber } from 'common/format';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { ECHO_HEALS, TIMELORD_INCREASE } from '../../constants';
import Echo from './Echo';

class TimeLord extends Analyzer {
  static dependencies = {
    echo: Echo,
  };
  protected echo!: Echo;
  effectiveHealing: number = 0;
  totalIncrease: number = 0;
  overhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.TIME_LORD_TALENT);
    this.totalIncrease =
      this.selectedCombatant.getTalentRank(TALENTS_EVOKER.TIME_LORD_TALENT) * TIMELORD_INCREASE;
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(ECHO_HEALS), this.handleEchoHeal);
  }

  handleEchoHeal(event: HealEvent) {
    if (!this.echo.isEchoHeal(event)) {
      return;
    }
    this.effectiveHealing += calculateEffectiveHealing(event, this.totalIncrease);
    this.overhealing += calculateOverhealing(event, this.totalIncrease);
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
              <li>
                {formatNumber(this.effectiveHealing)} increased{' '}
                <SpellLink id={TALENTS_EVOKER.ECHO_TALENT.id} /> healing from{' '}
                <SpellLink id={TALENTS_EVOKER.TIME_LORD_TALENT} />
              </li>
              <li>
                {formatNumber(this.overhealing)} overhealing from{' '}
                <SpellLink id={TALENTS_EVOKER.TIME_LORD_TALENT} />
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.TIME_LORD_TALENT}>
          <ItemHealingDone amount={this.effectiveHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TimeLord;
