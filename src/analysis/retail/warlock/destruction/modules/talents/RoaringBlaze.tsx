import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

/*
  Roaring Blaze (Tier 90 Destruction talent):
    Conflagrate burns the target for an additional (48% of Spell power) Fire damage over 6 sec.
 */
class RoaringBlaze extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ROARING_BLAZE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ROARING_BLAZE_DAMAGE),
      this.onRoaringBlazeDamage,
    );
  }

  onRoaringBlazeDamage(event: DamageEvent) {
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  get dps() {
    return (this.damage / this.owner.fightDuration) * 1000;
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.ROARING_BLAZE_DAMAGE.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <TalentSpellText talent={TALENTS.ROARING_BLAZE_TALENT}>
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total
          </small>
          <br />
          <UptimeIcon />
          {formatPercentage(this.uptime, 0)}%<small> uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RoaringBlaze;
