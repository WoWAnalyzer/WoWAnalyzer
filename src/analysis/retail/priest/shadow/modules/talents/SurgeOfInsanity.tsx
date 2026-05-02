import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ResourceChangeEvent, DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import {
  calculateEffectiveDamage,
  calculateEffectiveResourceRestored,
} from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { SURGE_OF_INSANITY_DAMAGE_PER_RANK } from '../../constants';
import { SURGE_OF_INSANITY_INSANITY_PER_RANK } from '../../constants';

class SurgeOfInsanity extends Analyzer {
  damage = 0;
  insanityGained = 0;

  multiplierSurgeOfInsanityDamage =
    this.selectedCombatant.getTalentRank(TALENTS.SURGE_OF_INSANITY_TALENT) *
    SURGE_OF_INSANITY_DAMAGE_PER_RANK;
  multiplierSurgeOfInsanityInsanity =
    this.selectedCombatant.getTalentRank(TALENTS.SURGE_OF_INSANITY_TALENT) *
    SURGE_OF_INSANITY_INSANITY_PER_RANK;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY),
      this.onMFDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onMFDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onMFResource,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY),
      this.onMFResource,
    );
  }

  onMFDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, this.multiplierSurgeOfInsanityDamage);
  }

  onMFResource(event: ResourceChangeEvent) {
    this.insanityGained += calculateEffectiveResourceRestored(
      event,
      this.multiplierSurgeOfInsanityInsanity,
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.SURGE_OF_INSANITY_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
          <div>
            <ItemInsanityGained amount={this.insanityGained} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SurgeOfInsanity;
