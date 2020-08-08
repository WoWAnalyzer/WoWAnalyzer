import React from 'react';
import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import ItemHealingDone from 'interface/ItemHealingDone';
import { AOTB_ABILITIES_NOT_AFFECTED, AOTB_MULTIPLIER } from 'parser/hunter/beastmastery/constants';

/**
 * Increases the damage of your pet's abilities by 30%.
 * Increases the effectiveness of your pet's Predator's Thirst, Endurance Training, and Pathfinding passives by 50%.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/a4KVj37kTNbyxG1Y#fight=10&type=summary&source=8
 */

class AspectOfTheBeast extends Analyzer {

  damage = 0;
  healing = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ASPECT_OF_THE_BEAST_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET), this.onPetHeal);
  }

  onPetDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (AOTB_ABILITIES_NOT_AFFECTED.includes(spellId)) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, AOTB_MULTIPLIER);
  }

  onPetHeal(event: HealEvent) {
    this.healing += calculateEffectiveHealing(event, AOTB_MULTIPLIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.ASPECT_OF_THE_BEAST_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <ItemHealingDone amount={this.healing} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AspectOfTheBeast;
