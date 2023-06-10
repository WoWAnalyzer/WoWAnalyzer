import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ENGULFING_BLAZE_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

class EngulfingBlaze extends Analyzer {
  livingFlameDamage: number = 0;
  engulfingBlazeDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ENGULFING_BLAZE_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_DAMAGE),
      this.onHit,
    );
  }

  onHit(event: DamageEvent) {
    this.livingFlameDamage += event.amount;
    if (event.absorbed !== undefined) {
      this.livingFlameDamage += event.absorbed;
    }
  }

  statistic() {
    this.engulfingBlazeDamage =
      this.livingFlameDamage - this.livingFlameDamage / (1 + ENGULFING_BLAZE_MULTIPLIER);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.engulfingBlazeDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.ENGULFING_BLAZE_TALENT}>
          <ItemDamageDone amount={this.engulfingBlazeDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EngulfingBlaze;
