import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import HolyWordSanctify from 'parser/priest/holy/modules/spells/holyword/HolyWordSanctify';
import HolyWordSerenity from 'parser/priest/holy/modules/spells/holyword/HolyWordSerenity';
import HolyWordChastise from 'parser/priest/holy/modules/spells/holyword/HolyWordChastise';
import { formatNumber } from 'common/format';
import ItemManaGained from 'interface/ItemManaGained';
import { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/NfFqTvxrQ8GLWDpY/12-Normal+Fetid+Devourer+-+Kill+(1:25)/6-Yrret
class Apotheosis extends Analyzer {
  static dependencies = {
    sanctify: HolyWordSanctify,
    serenity: HolyWordSerenity,
    chastise: HolyWordChastise,
  };
  protected sanctify!: HolyWordSanctify;
  protected serenity!: HolyWordSerenity;
  protected chastise!: HolyWordChastise;

  apotheosisCasts = 0;
  apotheosisActive = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id);
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.APOTHEOSIS_TALENT.id) {
      this.apotheosisCasts += 1;
      this.apotheosisActive = true;
    }
  }

  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.APOTHEOSIS_TALENT.id) {
      this.apotheosisActive = false;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>
            Serenity: {this.sanctify.apotheosisCooldownReduction / 1000}s CDR | {this.sanctify.apotheosisManaReduction} Mana saved <br />
            Sanctify: {this.serenity.apotheosisCooldownReduction / 1000}s CDR | {this.serenity.apotheosisManaReduction} Mana saved <br />
            Chastise: {this.chastise.apotheosisCooldownReduction / 1000}s CDR | {this.chastise.apotheosisManaReduction} Mana saved
          </>
        )}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spell={SPELLS.APOTHEOSIS_TALENT}>
          <>
            <ItemManaGained amount={this.sanctify.apotheosisManaReduction + this.serenity.apotheosisManaReduction + this.chastise.apotheosisManaReduction} /><br />
            {formatNumber((this.sanctify.apotheosisCooldownReduction + this.serenity.apotheosisCooldownReduction + this.chastise.apotheosisCooldownReduction) / 1000)}s Cooldown Reduction
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Apotheosis;
