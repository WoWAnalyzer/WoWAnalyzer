import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';

const PUNISH_DAMAGE_INCREASE = 0.1;

class Punish extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  bonusDmg: number = 0;

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PUNISH_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM),
      this.onSlamDamage,
    );
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.PUNISH_DEBUFF.id) / this.owner.fightDuration;
  }

  onSlamDamage(event: DamageEvent) {
    this.bonusDmg += calculateEffectiveDamage(event, PUNISH_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Punish added a total of {formatNumber(this.bonusDmg)} damage to your Shield Slams (
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%). <br />
            {formatPercentage(this.uptime)}% debuff uptime.
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={TALENTS.PUNISH_TALENT.id} /> Damage contributed
            </>
          }
        >
          <>
            {formatNumber((this.bonusDmg / this.owner.fightDuration) * 1000)} <small>DPS</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default Punish;
