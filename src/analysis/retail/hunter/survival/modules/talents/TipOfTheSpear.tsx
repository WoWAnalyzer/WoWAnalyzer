import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import {
  RAPTOR_MONGOOSE_VARIANTS,
  TIP_DAMAGE_INCREASE,
  TIP_MAX_STACKS,
} from 'analysis/retail/hunter/survival/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, ChangeBuffStackEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Kill Command increases the direct damage of your other spells by 15%, stacking up to 3 times.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/btfPX81A4vnC2LaM#fight=1&type=damage-done&source=10&view=events
 */

class TipOfTheSpear extends Analyzer {
  private spenderCasts: number = 0;
  private stacks: number = 0;
  private usedStacks: number = 0;
  private wastedStacks: number = 0;
  private damage: number = 0;
  private lastApplicationTimestamp: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.TIP_OF_THE_SPEAR_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_SURVIVAL_TALENT),
      this.onKillCommandCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS),
      this.onSpenderCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS),
      this.onDamage,
    );
    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.TIP_OF_THE_SPEAR_CAST),
      this.onChangeBuffStack,
    );
  }

  onSpenderCast() {
    this.spenderCasts += 1;
  }

  onKillCommandCast(event: CastEvent) {
    if (
      this.stacks === TIP_MAX_STACKS &&
      event.timestamp > this.lastApplicationTimestamp + MS_BUFFER_100
    ) {
      this.wastedStacks += 1;
    }
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, TIP_DAMAGE_INCREASE);
    this.usedStacks += 1;
  }

  onChangeBuffStack(event: ChangeBuffStackEvent) {
    if (event.newStacks !== 0) {
      this.lastApplicationTimestamp = event.timestamp;
    }
    this.stacks = event.newStacks;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.TIP_OF_THE_SPEAR_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            <small>Used</small> {this.usedStacks}/{this.usedStacks + this.wastedStacks}{' '}
            <small>possible stacks</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TipOfTheSpear;
