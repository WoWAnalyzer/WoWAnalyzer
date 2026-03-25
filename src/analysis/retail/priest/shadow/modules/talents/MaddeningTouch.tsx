import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ResourceChangeEvent, DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { MADDENING_TOUCH_DAMAGE_PER_RANK } from '../../constants';

class MaddeningTouch extends Analyzer {
  damage = 0;
  insanityGained = 0;

  multiplierMaddeningTouch =
    this.selectedCombatant.getTalentRank(TALENTS.MADDENING_TOUCH_TALENT) *
    MADDENING_TOUCH_DAMAGE_PER_RANK;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MADDENING_TOUCH_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VAMPIRIC_TOUCH),
      this.onVampricTouchDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MADDENING_TOUCH_RESOURCE),
      this.onVampricTouchResource,
    );
  }

  onVampricTouchDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, this.multiplierMaddeningTouch);
  }

  onVampricTouchResource(event: ResourceChangeEvent) {
    this.insanityGained += event.resourceChange - event.waste;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.MADDENING_TOUCH_TALENT}>
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

export default MaddeningTouch;
