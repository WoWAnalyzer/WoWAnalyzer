import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import HolyWordSanctify from 'parser/priest/holy/modules/spells/holyword/HolyWordSanctify';
import HolyWordChastise from 'parser/priest/holy/modules/spells/holyword/HolyWordChastise';
import HolyWordSerenity from 'parser/priest/holy/modules/spells/holyword/HolyWordSerenity';
import SPELLS from 'common/SPELLS';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

class HolyWordsReductionBySpell extends Analyzer {
  lightOfTheNaaruActive = false;
  apotheosisActive = false;

  static dependencies = {
    sanctify: HolyWordSanctify,
    serenity: HolyWordSerenity,
    chastise: HolyWordChastise,
  };

  constructor(...args) {
    super(...args);
    this.lightOfTheNaaruActive = this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id);
    this.apotheosisActive = this.selectedCombatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id);
  }

  get totalReduction() {
    return this.sanctify.totalCooldownReduction + this.serenity.totalCooldownReduction + this.chastise.totalCooldownReduction;
  }

  get reductionBySpell() {
    let totalReductionBySpell = {};

    totalReductionBySpell = this.sumCooldown(totalReductionBySpell, this.sanctify.totalHolyWordReductionPerSpellPerTalent);
    totalReductionBySpell = this.sumCooldown(totalReductionBySpell, this.serenity.totalHolyWordReductionPerSpellPerTalent);
    totalReductionBySpell = this.sumCooldown(totalReductionBySpell, this.chastise.totalHolyWordReductionPerSpellPerTalent);
    return totalReductionBySpell;
  }

  sumCooldown(currentList, newList) {
    for (const spellId in newList) {
      if (currentList[spellId] == null) {
        currentList[spellId] = newList[spellId];
      } else {
        for (const cooldownType in newList[spellId]) {
          currentList[spellId][cooldownType] = currentList[spellId][cooldownType] || 0;
          currentList[spellId][cooldownType] += newList[spellId][cooldownType];
        }
      }
    }
    return currentList;
  }

  statistic() {
    const reductionRatio = this.totalReduction / (this.owner.fightDuration + this.totalReduction);
    const reductionBySpell = this.reductionBySpell;

    return (
      <ExpandableStatisticBox
        position={STATISTIC_ORDER.CORE(6)}
        icon={<SpellIcon id={SPELLS.HOLY_WORDS.id} />}
        value={`${formatPercentage(reductionRatio)} %`}
        label="Effective Holy Word reduction"
        tooltip={`The % above is the total CD reduction normalize against the fight length.</br>
                  This allows for comparision across different fights more easily.</br></br>
                  Talents like <b>Light of the Naaru</b> and <b>Apotheosis</b> which provide </br>
                  further CD reduction are taken into account when calculating these numbers.</br></br>
                  If you took the talent <b>Holy Word Salvation</b>, <b>Holy Words Sanctify	and Serenity</b>
                  will show since they provide CD reduction for <b>Holy World Salvation</b>.`}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <td className={"text-left"}>Spell</td>
              <td>Base</td>
              {this.apotheosisActive ? <th>Apotheosis</th> : ''}
              {this.lightOfTheNaaruActive ? <th>Light of the Naaru</th> : ''}
            </tr>
          </thead>
          <tbody>
            {Object.keys(reductionBySpell).map((e, i) => (
              <tr key={i}>
                <td className={"text-left"}><SpellIcon id={e} /> {SPELLS[e].name}</td>
                <td>{Math.ceil(reductionBySpell[e].base / 1000)}s</td>
                {this.apotheosisActive ? <td>{Math.ceil(reductionBySpell[e].apotheosis / 1000)}s</td> : ''}
                {this.lightOfTheNaaruActive ? <td>{Math.ceil(reductionBySpell[e].lightOfTheNaaru / 1000)}s</td> : ''}
              </tr>
            ))}
          </tbody>
        </table>
      </ExpandableStatisticBox>

    );
  }

}

export default HolyWordsReductionBySpell;
