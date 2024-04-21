import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

import { AUSPICIOUS_SPIRITS_DAMAGE_MULTIPLIER } from '../../constants';

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

  //this is used in ShadowyApparitions to show all Apparition Talents together
  subStatistic() {
    return (
      <BoringSpellValueText spell={TALENTS.AUSPICIOUS_SPIRITS_TALENT}>
        <div>
          <ItemDamageDone
            amount={this.damage - this.damage / AUSPICIOUS_SPIRITS_DAMAGE_MULTIPLIER}
          />
        </div>
        <div>
          <ItemInsanityGained amount={this.insanity} />
        </div>
      </BoringSpellValueText>
    );
  }
}

export default AuspiciousSpirits;
