import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared';
import { BLOODSEEKER_ATTACK_SPEED_GAIN } from 'analysis/retail/hunter/survival/constants';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Kill Command causes the target to bleed for X damage over 8 sec.
 * You and your pet gain 10% attack speed for every bleeding enemy within 12 yds.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/6GjD12YkQCnJqPTz#fight=25&type=auras&translate=true&source=19&ability=260249
 */

class Bloodseeker extends Analyzer {
  averageStacks: number = 0;
  kcCastTimestamp: number = 0;
  damage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.BLOODSEEKER_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.KILL_COMMAND_DAMAGE_SV),
      this.onPetDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.KILL_COMMAND_CAST_SV),
      this.onCast,
    );
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.BLOODSEEKER_BUFF.id) / this.owner.fightDuration
    );
  }

  get averageAttackSpeedGain() {
    this.averageStacks =
      this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.BLOODSEEKER_BUFF.id) /
      this.owner.fightDuration;
    return this.averageStacks * BLOODSEEKER_ATTACK_SPEED_GAIN;
  }

  onPetDamage(event: DamageEvent) {
    if (event.timestamp > this.kcCastTimestamp + MS_BUFFER_100) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  onCast(event: CastEvent) {
    this.kcCastTimestamp = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        tooltip={
          <>
            You had {formatPercentage(this.uptime)}% uptime on the buff, with an average of{' '}
            {this.averageStacks.toFixed(2)} stacks.
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS.BLOODSEEKER_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            {formatPercentage(this.averageAttackSpeedGain)}% <small>atk speed gain</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Bloodseeker;
