import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import HolyWordSanctify from '@wowanalyzer/priest-holy/src/modules/spells/holyword/HolyWordSanctify';
import HolyWordSerenity from '@wowanalyzer/priest-holy/src/modules/spells/holyword/HolyWordSerenity';
import HolyWordChastise from '@wowanalyzer/priest-holy/src/modules/spells/holyword/HolyWordChastise';

class HarmoniousApparatus extends Analyzer {
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

    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.HARMONIOUS_APPARATUS.bonusID);
  }

  get reductionForAllSpells() {
    let totalReductionBySpell: { [spellId: number]: { base: number } } = {};

    totalReductionBySpell = this.sumCooldown(totalReductionBySpell, this.sanctify.totalHolyWordReductionPerSpellPerTalent);
    totalReductionBySpell = this.sumCooldown(totalReductionBySpell, this.serenity.totalHolyWordReductionPerSpellPerTalent);
    totalReductionBySpell = this.sumCooldown(totalReductionBySpell, this.chastise.totalHolyWordReductionPerSpellPerTalent);

    return totalReductionBySpell;
  }

  sumCooldown(currentList: any, newList: any) {
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

  reductionForSpell(spellId: number) {
    const reduction = this.reductionForAllSpells[spellId];
    if (reduction && reduction.base) {
      return reduction.base;
    }
    return 0;
  }

  statistic() {
    const totalHealingSpellReduction = this.reductionForSpell(SPELLS.CIRCLE_OF_HEALING_TALENT.id) +
      this.reductionForSpell(SPELLS.PRAYER_OF_MENDING_CAST.id);

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={(
          <>
            Serenity: {Math.ceil(this.reductionForSpell(SPELLS.CIRCLE_OF_HEALING_TALENT.id) / 1000)}s CDR<br />
            Sanctify: {Math.ceil(this.reductionForSpell(SPELLS.PRAYER_OF_MENDING_CAST.id) / 1000)}s CDR<br />
            Chastise : {Math.ceil(this.reductionForSpell(SPELLS.HOLY_FIRE.id) / 1000)}s CDR<br />
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.HARMONIOUS_APPARATUS}>
          {Math.ceil(totalHealingSpellReduction / 1000)}s <small>Healing Spell Cooldown Reduction</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HarmoniousApparatus;
