import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, FightEndEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SEARING_TOUCH_THRESHOLD, SharedCode } from '../../shared';

class ImprovedScorch extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    sharedCode: SharedCode,
  };
  protected enemies!: Enemies;
  protected sharedCode!: SharedCode;

  executeActive: boolean = false;
  executeStart: number = 0;
  executeTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.IMPROVED_SCORCH_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onDamage(event: DamageEvent) {
    const healthPercent = this.sharedCode.getTargetHealth(event) || 1;
    if (healthPercent === 1) {
      return;
    }

    //If the target is under 30% and wasn't before, then mark the beginning of execute and flag execute as Active
    //If the target is not under 30% and was before, then end execute and add up the time that execute was Active
    if (healthPercent < SEARING_TOUCH_THRESHOLD && !this.executeActive) {
      this.executeStart = event.timestamp;
      this.executeActive = true;
    } else if (healthPercent > SEARING_TOUCH_THRESHOLD && this.executeActive) {
      this.executeTime += event.timestamp - this.executeStart;
      this.executeStart = 0;
      this.executeActive = false;
    }
  }

  onFightEnd(event: FightEndEvent) {
    if (this.executeActive) {
      this.executeTime += event.timestamp - this.executeStart;
    }
  }

  improvedScorchUptime = () => {
    const history = this.enemies.getDebuffHistory(SPELLS.IMPROVED_SCORCH_BUFF.id);
    let uptime = 0;
    history.forEach((d) => (uptime += d.end - d.start));
    return uptime;
  };

  get uptimePercent() {
    return this.improvedScorchUptime() / this.executeTime;
  }

  get uptimePercentThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimePercentThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          While the the target was under {formatPercentage(SEARING_TOUCH_THRESHOLD)}% you had{' '}
          {formatPercentage(this.uptimePercent)}% uptime on{' '}
          <SpellLink spell={TALENTS.IMPROVED_SCORCH_TALENT} />. Because this buff gives you more
          damage during your execute, you need to ensure that you are keeping the buff going for as
          much of your execute as possible.
        </>,
      )
        .icon(TALENTS.IMPROVED_SCORCH_TALENT.icon)
        .actual(`${formatPercentage(this.uptimePercent)}% Utilization`)
        .recommended(`${formatPercentage(recommended)} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spell={TALENTS.IMPROVED_SCORCH_TALENT}>
          <>
            {formatPercentage(this.uptimePercent, 0)}% <small>Uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ImprovedScorch;
