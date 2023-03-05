import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

/*
  Roaring Blaze:
    Conflagrate increases your Soul Fire, Channel Demonfire, Immolate, Incinerate, and Conflagrate
    damage by 25% for 8 sec.
 */
class RoaringBlaze extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ROARING_BLAZE_TALENT);
  }


  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.ROARING_BLAZE_DAMAGE.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size='flexible'
      >
        <TalentSpellText talent={TALENTS.ROARING_BLAZE_TALENT}>
          <UptimeIcon />
          {formatPercentage(this.uptime, 0)}%<small> uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RoaringBlaze;
