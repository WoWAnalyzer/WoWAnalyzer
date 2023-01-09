import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

const DAMAGE_BUFF_PER_STACK = 0.04;

/**
 * Each Soul Shard spent on Hand of Gul'dan increases the damage of your next Call Dreadstalkers by 4%.
 */

class DreadCalling extends Analyzer {
  private totalCasts: number = 0;
  private buffStacksConsumed: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_WARLOCK.DREAD_CALLING_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CALL_DREADSTALKERS),
      this.onCallDreadstalkersCast,
    );
  }

  onCallDreadstalkersCast(event: CastEvent) {
    this.totalCasts += 1;

    this.buffStacksConsumed += this.selectedCombatant.getBuffStacks(
      SPELLS.DREAD_CALLING_BUFF.id,
      event.timestamp,
    );
  }

  get dreadCallingStacksConsumed() {
    return this.buffStacksConsumed;
  }

  get callDreadstalkersCasts() {
    return this.totalCasts;
  }

  statistic() {
    const averageNumberOfStacks = this.dreadCallingStacksConsumed / this.callDreadstalkersCasts;
    const averageDamageBuff = DAMAGE_BUFF_PER_STACK * averageNumberOfStacks;

    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={TALENTS_WARLOCK.DREAD_CALLING_TALENT}>
          {formatPercentage(averageDamageBuff, 0)}%{' '}
          <TooltipElement
            content={`${averageNumberOfStacks.toFixed(2)} stacks per cast on average`}
          >
            <small>average buff on Call Dreadstalkers</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default DreadCalling;
