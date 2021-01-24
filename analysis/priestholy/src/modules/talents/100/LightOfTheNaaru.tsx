import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import HolyWordSanctify from '@wowanalyzer/priest-holy/src/modules/spells/holyword/HolyWordSanctify';
import HolyWordChastise from '@wowanalyzer/priest-holy/src/modules/spells/holyword/HolyWordChastise';
import HolyWordSerenity from '@wowanalyzer/priest-holy/src/modules/spells/holyword/HolyWordSerenity';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/Gvxt7CgLya2W1TYj/5-Normal+Zek'voz+-+Kill+(3:57)/13-弥砂丶
class LightOfTheNaaru extends Analyzer {
  static dependencies = {
    sanctify: HolyWordSanctify,
    serenity: HolyWordSerenity,
    chastise: HolyWordChastise,
  };
  protected sanctify!: HolyWordSanctify;
  protected serenity!: HolyWordSerenity;
  protected chastise!: HolyWordChastise;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id);
  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>
            Serenity: {Math.ceil(this.serenity.lightOfTheNaaruCooldownReduction / 1000)}s CDR<br />
            Sanctify: {Math.ceil(this.sanctify.lightOfTheNaaruCooldownReduction / 1000)}s CDR<br />
            Chastise: {Math.ceil(this.chastise.lightOfTheNaaruCooldownReduction / 1000)}s CDR
          </>
        )}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spell={SPELLS.LIGHT_OF_THE_NAARU_TALENT}>
          {Math.ceil((this.sanctify.lightOfTheNaaruCooldownReduction + this.serenity.lightOfTheNaaruCooldownReduction + this.chastise.lightOfTheNaaruCooldownReduction) / 1000)}s <small>Cooldown Reduction</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LightOfTheNaaru;
