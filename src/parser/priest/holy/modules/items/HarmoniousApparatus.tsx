import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, DamageEvent, SummonEvent } from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import SpellLink from 'common/SpellLink';
import { DIRE_COMMAND_PROC_CHANCE } from 'parser/hunter/beastmastery/constants';
import ItemDamageDone from 'interface/ItemDamageDone';
import Haste from 'interface/icons/Haste';
import { formatPercentage } from 'common/format';
import { DIRE_BEAST_HASTE_PERCENT } from 'parser/hunter/shared/constants';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import HolyWordSanctify from 'parser/priest/holy/modules/spells/holyword/HolyWordSanctify';
import HolyWordSerenity from 'parser/priest/holy/modules/spells/holyword/HolyWordSerenity';
import HolyWordChastise from 'parser/priest/holy/modules/spells/holyword/HolyWordChastise';

/**
 * TODO Find a log with both Dire Command and Dire Beast talent and account for them using the same spell for buff
 * Kill Command has a 20% chance to also summon a Dire Beast to attack your target.
 *
 * Example log:
 *
 */
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
