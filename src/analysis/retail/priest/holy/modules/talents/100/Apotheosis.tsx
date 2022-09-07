import HolyWordChastise from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordChastise';
import HolyWordSanctify from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordSanctify';
import HolyWordSerenity from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordSerenity';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/NfFqTvxrQ8GLWDpY/12-Normal+Fetid+Devourer+-+Kill+(1:25)/6-Yrret
class Apotheosis extends Analyzer {
  static dependencies = {
    sanctify: HolyWordSanctify,
    serenity: HolyWordSerenity,
    chastise: HolyWordChastise,
  };
  apotheosisCasts = 0;
  apotheosisActive = false;
  protected sanctify!: HolyWordSanctify;
  protected serenity!: HolyWordSerenity;
  protected chastise!: HolyWordChastise;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.APOTHEOSIS_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.APOTHEOSIS_TALENT),
      this.onRemoveBuff,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.apotheosisCasts += 1;
    this.apotheosisActive = true;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.apotheosisActive = false;
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Serenity: {this.sanctify.apotheosisCooldownReduction / 1000}s CDR |{' '}
            {this.sanctify.apotheosisManaReduction} Mana saved <br />
            Sanctify: {this.serenity.apotheosisCooldownReduction / 1000}s CDR |{' '}
            {this.serenity.apotheosisManaReduction} Mana saved <br />
            Chastise: {this.chastise.apotheosisCooldownReduction / 1000}s CDR |{' '}
            {this.chastise.apotheosisManaReduction} Mana saved
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spellId={SPELLS.APOTHEOSIS_TALENT.id}>
          <>
            <ItemManaGained
              amount={
                this.sanctify.apotheosisManaReduction +
                this.serenity.apotheosisManaReduction +
                this.chastise.apotheosisManaReduction
              }
            />
            <br />
            {formatNumber(
              (this.sanctify.apotheosisCooldownReduction +
                this.serenity.apotheosisCooldownReduction +
                this.chastise.apotheosisCooldownReduction) /
                1000,
            )}
            s Cooldown Reduction
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Apotheosis;
