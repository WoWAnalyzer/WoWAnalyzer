import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  BLACK_DAMAGE_SPELLS,
  MIGHT_OF_THE_BLACK_DRAGONFLIGHT_MULTIPLIER,
} from 'analysis/retail/evoker/shared/constants';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

/**
 * Black spells deal 20% increased damage.
 */
class MightOfTheBlackDragonflight extends Analyzer {
  extraDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MIGHT_OF_THE_BLACK_DRAGONFLIGHT_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(BLACK_DAMAGE_SPELLS),
      this.onCast,
    );
  }

  onCast(event: DamageEvent) {
    this.extraDamage += calculateEffectiveDamage(event, MIGHT_OF_THE_BLACK_DRAGONFLIGHT_MULTIPLIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.extraDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.MIGHT_OF_THE_BLACK_DRAGONFLIGHT_TALENT}>
          <ItemDamageDone amount={this.extraDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MightOfTheBlackDragonflight;
