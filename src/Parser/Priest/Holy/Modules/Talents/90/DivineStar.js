import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

// Example Log: /report/mWZ6TG9JgjPQVdbA/9-Mythic+Zek'voz+-+Kill+(7:24)/1-Allyseia`Ø
class DivineStar extends Analyzer {
  divineStarDamage = 0;
  divineStarHealing = 0;
  divineStarOverhealing = 0;
  divineStarCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    // For some reason there are heals that are recoeded as damaging spells. I don't know what's up with that.
    if (spellId === SPELLS.DIVINE_STAR_HEAL.id || spellId === SPELLS.DIVINE_STAR_DAMAGE.id) {
      this.divineStarDamage += event.amount || 0;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIVINE_STAR_HEAL.id) {
      this.divineStarHealing += event.amount || 0;
      this.divineStarOverhealing += event.overhealing || 0;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.DIVINE_STAR_TALENT.id) {
      this.divineStarCasts++;
    }
  }

  statistic() {
    return (

      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.DIVINE_STAR_TALENT.id} />}
        value={(
          <React.Fragment>
            <ItemHealingDone amount={this.divineStarHealing} /><br />
            <ItemDamageDone amount={this.divineStarDamage} />
          </React.Fragment>
        )}
        label="Divine Star"
        tooltip={`Divine Star Cast: ${this.divineStarCasts}`}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default DivineStar;
