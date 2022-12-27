import PrayerOfMending from 'analysis/retail/priest/holy/modules/spells/PrayerOfMending';
import Renew from 'analysis/retail/priest/holy/modules/spells/Renew';
import { formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class HolyWordSalvation extends Analyzer {
  static dependencies = {
    renew: Renew,
    prayerOfMending: PrayerOfMending,
  };
  salvTicks = 0;
  healingFromSalv = 0;
  overhealingFromSalv = 0;
  absorptionFromSalv = 0;
  protected renew!: Renew;
  protected prayerOfMending!: PrayerOfMending;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOLY_WORD_SALVATION_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.HOLY_WORD_SALVATION_TALENT),
      this.onHeal,
    );
  }

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

  onHeal(event: HealEvent) {
    this.healingFromSalv += event.amount || 0;
    this.overhealingFromSalv += event.overheal || 0;
    this.absorptionFromSalv += event.absorbed || 0;
    this.salvTicks += 1;
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Healing from Salv: {formatThousands(this.healingFromSalv + this.absorptionFromSalv)}
            <br />
            Healing from Renews: {formatThousands(this.healingFromRenew + this.absorptionFromRenew)}
            <br />
            Healing from PoMs: {formatThousands(this.healingFromPom + this.absorptionFromPom)}
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spellId={TALENTS.HOLY_WORD_SALVATION_TALENT.id}>
          <ItemHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HolyWordSalvation;
