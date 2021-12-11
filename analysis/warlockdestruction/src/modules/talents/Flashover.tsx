import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { Tooltip } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DAMAGE_BONUS = 0.25;
const MAX_STACKS = 4;
const STACKS_PER_CAST = 2;
const debug = false;

class Flashover extends Analyzer {
  get dps() {
    return (this.damage / this.owner.fightDuration) * 1000;
  }

  _currentStacks = 0;
  bonusStacks = 0;
  wastedStacks = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FLASHOVER_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONFLAGRATE),
      this.onConflagrateDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONFLAGRATE),
      this.onConflagrateCast,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.BACKDRAFT),
      this.onBackdraftRemoveBuffStack,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.BACKDRAFT),
      this.onBackdraftRemoveBuff,
    );
  }

  onConflagrateDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  onConflagrateCast() {
    if (this._currentStacks <= MAX_STACKS - STACKS_PER_CAST) {
      // We don't waste the base Backdraft stack, nor the bonus one
      this._currentStacks += STACKS_PER_CAST;
      this.bonusStacks += 1;
    } else {
      // Conflagrate grants 2 stacks with Flashover, we can attribute 1 to the base Conflagrate and 1 to the Flashover, in this case the Flashover one would get wasted
      debug && this.log('WASTE');
      this._currentStacks = MAX_STACKS;
      this.wastedStacks += 1;
    }
    debug && this.log(`Stacks after conflag cast: ${this._currentStacks}`);
  }

  onBackdraftRemoveBuffStack() {
    this._currentStacks -= 1;
    debug && this.log(`Remove buff stack, current: ${this._currentStacks}`);
  }

  onBackdraftRemoveBuff() {
    this._currentStacks = 0;
    debug && this.log(`Remove buff, current: ${this._currentStacks}`);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} bonus damage`}
      >
        <BoringSpellValueText spellId={SPELLS.FLASHOVER_TALENT.id}>
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total
          </small>{' '}
          <br />
          {this.bonusStacks} <small>bonus Backdraft stacks</small> <br />
          {this.wastedStacks}
          <Tooltip content="Conflagrate on 3 or 4 stacks of Backdraft">
            <small style={{ marginLeft: 7 }}>
              wasted Backdraft stacks <sup>*</sup>
            </small>
          </Tooltip>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Flashover;
