import PrayerOfMending from 'analysis/retail/priest/holy/modules/spells/PrayerOfMending';
import { formatThousands } from 'common/format';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HasRelatedEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SALVATION_RENEW_HEALS } from '../../../normalizers/CastLinkNormalizer';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class HolyWordSalvation extends Analyzer {
  static dependencies = {
    prayerOfMending: PrayerOfMending,
  };
  salvTicks = 0;
  healingFromSalv = 0;
  overhealingFromSalv = 0;
  absorptionFromSalv = 0;

  healingFromRenew = 0;
  absorptionFromRenew = 0;
  overhealingFromRenew = 0;

  protected prayerOfMending!: PrayerOfMending;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOLY_WORD_SALVATION_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.HOLY_WORD_SALVATION_TALENT),
      this.onHeal,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onRenewHeal,
    );
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
    return this.overhealingFromSalv + this.overhealingFromRenew + this.overHealingFromPom;
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

  onRenewHeal(event: HealEvent) {
    if (HasRelatedEvent(event, SALVATION_RENEW_HEALS)) {
      this.healingFromRenew += event.amount || 0;
      this.overhealingFromRenew += event.overheal || 0;
      this.absorptionFromRenew += event.absorbed || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            <div>
              Healing from Salv: {formatThousands(this.healingFromSalv + this.absorptionFromSalv)}
            </div>
            <div>
              Healing from Renews:{' '}
              {formatThousands(this.healingFromRenew + this.absorptionFromRenew)}
            </div>
            <div>
              Healing from PoMs: {formatThousands(this.healingFromPom + this.absorptionFromPom)}
            </div>
            <div>
              This talent does not account for <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} /> in
              this module due to the nature of{' '}
              <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_MENDING_TALENT} />. Find its direct initial
              heal contribution in the table at the top.
            </div>
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spell={TALENTS.HOLY_WORD_SALVATION_TALENT}>
          <ItemHealingDone amount={this.totalHealing + this.totalAbsorbed} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HolyWordSalvation;
