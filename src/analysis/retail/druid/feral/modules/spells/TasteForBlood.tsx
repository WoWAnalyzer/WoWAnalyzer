import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { FB_SPELLS } from 'analysis/retail/druid/feral/constants';

const BASE_BOOST = 0.15;
const TF_BOOST = 0.15;

/**
 * **Taste for Blood**
 * Spec Talent
 *
 * Ferocious Bite deals 15% increased damage and an additional 15% during Tiger's Fury.
 */
class TasteForBlood extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.TASTE_FOR_BLOOD_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(FB_SPELLS), this.onFbDamage);
  }

  onFbDamage(event: DamageEvent) {
    let boost = BASE_BOOST;
    if (this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id)) {
      boost += TF_BOOST;
    }
    this.damage += calculateEffectiveDamage(event, boost);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_DRUID.TASTE_FOR_BLOOD_TALENT}>
          <ItemPercentDamageDone amount={this.damage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TasteForBlood;
