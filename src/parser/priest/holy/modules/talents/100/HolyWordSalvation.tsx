import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Renew from 'parser/priest/holy/modules/spells/Renew';
import PrayerOfMending from 'parser/priest/holy/modules/spells/PrayerOfMending';
import ItemHealingDone from 'interface/ItemHealingDone';
import { formatThousands } from 'common/format';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class HolyWordSalvation extends Analyzer {
  salvTicks = 0;
  healingFromSalv = 0;
  overhealingFromSalv = 0;
  absorptionFromSalv = 0;

  static dependencies = {
    renew: Renew,
    prayerOfMending: PrayerOfMending,
  };
  protected renew!: Renew;
  protected prayerOfMending!: PrayerOfMending;

  get renewCount() {
    return this.renew.renewsFromSalvation;
  }

  get healingFromRenew() {
    return this.renew.healingFromRenew(this.renewCount);
  }

  get overHealingFromRenew() {
    return this.renew.overhealingFromRenew(this.renewCount);
  }

  get absorptionFromRenew() {
    return this.renew.absorptionFromRenew(this.renewCount);
  }

  get pomCount() {
    return this.prayerOfMending.pomTicksFromSalv;
  }

  get healingFromPom() {
    return this.prayerOfMending.averagePomTickHeal * this.pomCount;
  }

  get overHealingFromPom() {
    return this.prayerOfMending.averagePomTickOverheal * this.pomCount;
  }

  get absorptionFromPom() {
    return this.prayerOfMending.averagePomTickAbsorption * this.pomCount;
  }

  get totalHealing() {
    return this.healingFromSalv + this.healingFromRenew + this.healingFromPom;
  }

  get totalOverHealing() {
    return this.overhealingFromSalv + this.overHealingFromRenew + this.overHealingFromPom;
  }

  get totalAbsorbed() {
    return this.absorptionFromSalv + this.absorptionFromRenew + this.absorptionFromPom;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HOLY_WORD_SALVATION_TALENT.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HOLY_WORD_SALVATION_TALENT), this.onHeal);
  }

  onHeal(event: HealEvent) {
    this.healingFromSalv += event.amount || 0;
    this.overhealingFromSalv += event.overheal || 0;
    this.absorptionFromSalv += event.absorbed || 0;
    this.salvTicks += 1;
  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>
            Healing from Salv: {formatThousands(this.healingFromSalv + this.absorptionFromSalv)}<br />
            Healing from Renews: {formatThousands(this.healingFromRenew + this.absorptionFromRenew)}<br />
            Healing from PoMs: {formatThousands(this.healingFromPom + this.absorptionFromPom)}
          </>
        )}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spell={SPELLS.HOLY_WORD_SALVATION_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HolyWordSalvation;
