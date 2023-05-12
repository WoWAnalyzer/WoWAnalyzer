import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Insanity from 'interface/icons/Insanity';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { SPIRIT_DAMAGE_MULTIPLIER } from '../../constants';

class AuspiciousSpirits extends Analyzer {
  damage = 0;
  insanity = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AUSPICIOUS_SPIRITS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_DAMAGE),
      this.onApparitionDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_RESOURCE),
      this.onApparitionGain,
    );
  }

  onApparitionDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onApparitionGain(event: ResourceChangeEvent) {
    this.insanity += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="The damage displayed is the additional damage you gained from taking this talent."
      >
        <BoringSpellValueText spellId={TALENTS.AUSPICIOUS_SPIRITS_TALENT.id}>
          <>
            <div>
              <ItemDamageDone amount={this.damage - this.damage / SPIRIT_DAMAGE_MULTIPLIER} />
            </div>
            <div>
              <Insanity /> {formatNumber(this.insanity)} <small>Insanity generated</small>
            </div>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AuspiciousSpirits;
