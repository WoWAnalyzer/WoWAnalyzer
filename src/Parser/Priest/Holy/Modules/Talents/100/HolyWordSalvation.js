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
          <React.Fragment>
            <ItemHealingDone amount={this.totalHealing} />
          </React.Fragment>
        )}
        label="Holy Word: Salvation"
        tooltip={`
          Healing from (~${this.salvTicks}) Salv: ${formatThousands(this.healingFromSalv)}<br />
          Healing from (~${this.renewCount}) Renews: ${formatThousands(this.healingFromRenew)}<br />
          Healing from (~${this.pomCount}) PoMs: ${formatThousands(this.healingFromPom)}
        `}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default HolyWordSalvation;
