import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Each Soul Shard spent on Hand of Gul'dan increases the damage of your next Call Dreadstalkers by 4%.
 */

class DreadCalling extends Analyzer {
  callDreadstalkersCasts: number = 0;
  dreadCallingStacksConsumed: number = 0;

  DAMAGE_BUFF_PER_STACK = 0.04;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_WARLOCK.DREAD_CALLING_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CALL_DREADSTALKERS),
      this.onCallDreadstalkersCast,
    );
  }

  onCallDreadstalkersCast(event: CastEvent) {
    this.callDreadstalkersCasts += 1;

    this.dreadCallingStacksConsumed += this.selectedCombatant.getBuffStacks(
      SPELLS.DREAD_CALLING_BUFF.id,
      event.timestamp,
    );
  }

  statistic() {
    const averageNumberOfStacks = this.dreadCallingStacksConsumed / this.callDreadstalkersCasts;
    const averageDamageBuff = this.DAMAGE_BUFF_PER_STACK * averageNumberOfStacks;

    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={TALENTS_WARLOCK.DREAD_CALLING_TALENT.id}>
          {formatPercentage(averageDamageBuff, 0)}%{' '}
          <TooltipElement
            content={`${averageNumberOfStacks.toFixed(2)} stacks per cast on average`}
          >
            <small>average buff on Call Dreadstalkers</small>
          </TooltipElement>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DreadCalling;
