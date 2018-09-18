import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import Renew from 'Parser/Priest/Holy/Modules/Spells/Renew';
import PrayerOfMending from 'Parser/Priest/Holy/Modules/Spells/PrayerOfMending';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';
import { formatThousands } from 'common/format';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class HolyWordSalvation extends Analyzer {
  salvTicks = 0;
  healingFromSalv = 0;
  overhealingFromSalv = 0;

  static dependencies = {
    renew: Renew,
    prayerOfMending: PrayerOfMending,
  };

  get renewCount() {
    return this.renew.renewsFromSalv;
  }

  get healingFromRenew() {
    return this.renew.healingFromRenew(this.renewCount);
  }

  get pomCount() {
    return this.prayerOfMending.pomTicksFromSalv;
  }

  get healingFromPom() {
    return this.prayerOfMending.averagePomTickHeal * this.pomCount;
  }

  get totalHealing() {
    return this.healingFromSalv + this.healingFromRenew + this.healingFromPom;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HOLY_WORD_SALVATION_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HOLY_WORD_SALVATION_TALENT.id) {
      this.healingFromSalv += event.amount | 0;
      this.overhealingFromSalv += event.overhealing | 0;
      this.salvTicks++;
    }
  }

  statistic() {
    return (

      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.HOLY_WORD_SALVATION_TALENT.id} />}
        value={(
            <ItemHealingDone amount={this.totalHealing} />
        )}
        label="Holy Word: Salvation"
        tooltip={`
          Healing from Salv: ${formatThousands(this.healingFromSalv)}<br />
          Healing from Renews: ${formatThousands(this.healingFromRenew)}<br />
          Healing from PoMs: ${formatThousands(this.healingFromPom)}
        `}
        position={STATISTIC_ORDER.CORE(7)}
      />

    );
  }
}

export default HolyWordSalvation;
