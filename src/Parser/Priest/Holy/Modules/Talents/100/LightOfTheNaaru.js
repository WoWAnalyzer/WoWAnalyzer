import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TalentStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import HolyWordSanctify from 'Parser/Priest/Holy/Modules/Spells/HolyWords/HolyWordSanctify';
import HolyWordChastise from 'Parser/Priest/Holy/Modules/Spells/HolyWords/HolyWordChastise';
import HolyWordSerenity from 'Parser/Priest/Holy/Modules/Spells/HolyWords/HolyWordSerenity';

// Example Log: /report/Gvxt7CgLya2W1TYj/5-Normal+Zek'voz+-+Kill+(3:57)/13-弥砂丶
class LightOfTheNaaru extends Analyzer {
  static dependencies = {
    sanctify: HolyWordSanctify,
    serenity: HolyWordSerenity,
    chastise: HolyWordChastise,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id);
  }

  statistic() {
    console.log(this.serenity);
    console.log(this.sanctify);
    return (

      <TalentStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.LIGHT_OF_THE_NAARU_TALENT.id} />}
        value={`${Math.ceil((this.sanctify.lightOfTheNaaruCooldownReduction + this.serenity.lightOfTheNaaruCooldownReduction + this.chastise.lightOfTheNaaruCooldownReduction) / 1000)}s Cooldown Reduction`}
        label="Light of the Naaru"
        tooltip={`
          Serenity: ${Math.ceil(this.serenity.lightOfTheNaaruCooldownReduction / 1000)}s CDR<br />
          Sanctify: ${Math.ceil(this.sanctify.lightOfTheNaaruCooldownReduction / 1000)}s CDR<br />
          Chastise: ${Math.ceil(this.chastise.lightOfTheNaaruCooldownReduction / 1000)}s CDR
        `}
        position={STATISTIC_ORDER.CORE(7)}
      />

    );
  }
}

export default LightOfTheNaaru;
