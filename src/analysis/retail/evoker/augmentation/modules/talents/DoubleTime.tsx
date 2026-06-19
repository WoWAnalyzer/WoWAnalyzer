import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { DOUBLE_TIME_EBON_MIGHT_MULTIPLIER } from 'analysis/retail/evoker/augmentation/constants';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/evoker';

/**
 * Applying Ebon Might has a chance equal to your critical strike chance to grant 50% additional Ebon Might stats for 15 sec.
 * Hardcast Prescience has a chance equal to your critical strike chance to grant 1.5x the normal critical strike chance for 15 sec. [Not trackable]
 */
class DoubleTime extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_EXTERNAL),
      this.onDamage,
      // Healing not included as effect is negligible with Ebon Might no longer buffing healers
    );
  }

  onDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.DOUBLE_TIME_EBON_MIGHT_BUFF.id)) {
      this.damage += calculateEffectiveDamage(event, DOUBLE_TIME_EBON_MIGHT_MULTIPLIER);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <li>Ebon Might damage: {formatNumber(this.damage)}</li>
            <li>Prescience damage is not trackable on logs.</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.DOUBLE_TIME_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default DoubleTime;
