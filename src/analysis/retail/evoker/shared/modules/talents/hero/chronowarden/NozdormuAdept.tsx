import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { NOZDORMU_ADEPT_PRESCIENCE_MULTIPLIER } from 'analysis/retail/evoker/augmentation/constants';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/evoker';

/**
 * Aug: Prescience grants 1% additional critical strike chance and has 2 sec reduced cooldown.
 * Pres [NYI]: Temporal Anomaly has 15% reduced mana cost and 4 sec reduced cooldown.
 */
class NozdormuAdept extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.NOZDORMU_ADEPT_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, NOZDORMU_ADEPT_PRESCIENCE_MULTIPLIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.damage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.NOZDORMU_ADEPT_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default NozdormuAdept;
